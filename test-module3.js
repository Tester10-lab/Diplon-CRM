process.env.NODE_ENV = process.env.NODE_ENV || 'test';
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const app = require('./app');
const { Quotation, Booking } = require('./models/Pipeline');
const { Package, DepartureInstance } = require('./models/Product');
const { BookingTraveler } = require('./models/BookingTraveler');
const { AuditLog } = require('./models/AuditReminder');
const { requestContext } = require('./utils/context');

let replSet;

const testAdminId = new mongoose.Types.ObjectId();
const testBranchId = new mongoose.Types.ObjectId();
const testCompanyId = new mongoose.Types.ObjectId();
const testCustomerId = new mongoose.Types.ObjectId();

async function setup() {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  await mongoose.connect(uri);
  console.log('Test DB connected.');
}

async function teardown() {
  await mongoose.disconnect();
  await replSet.stop();
}

const reqHeaders = {
  'x-mock-role': 'ADMIN',
  'x-mock-employee-id': testAdminId.toString(),
  'x-mock-branch-id': testBranchId.toString(),
  'x-mock-company-id': testCompanyId.toString()
};

async function runTests() {
  await requestContext.run({
    branchId: testBranchId.toString(),
    companyId: testCompanyId.toString(),
    employeeId: testAdminId.toString(),
    currentUserRole: 'ADMIN'
  }, async () => {
  // Setup Test Data
  await Package.deleteMany({});
  await DepartureInstance.deleteMany({});
  await Quotation.deleteMany({});
  await Booking.deleteMany({});
  await BookingTraveler.deleteMany({});

  const pkg = await Package.create({
    name: 'Module 3 Test Package',
    itinerary: 'Test Itinerary',
    basePricing: 1000,
    companyId: testCompanyId,
    branchId: testBranchId
  });

  const departure = await DepartureInstance.create({
    packageId: pkg._id,
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000),
    seatsTotal: 10,
    seatsAvailable: 10,
    status: 'Active',
    companyId: testCompanyId,
    branchId: testBranchId
  });

  // Quotation 1: DRAFT (should fail to book)
  const draftQuotation = await Quotation.create({
    customerId: testCustomerId,
    companyId: testCompanyId,
    branchId: testBranchId,
    packageId: pkg._id,
    status: 'DRAFT',
    totalAmount: 1000
  });

  // Quotation 2: ACCEPTED
  const acceptedQuotation = await Quotation.create({
    customerId: testCustomerId,
    companyId: testCompanyId,
    branchId: testBranchId,
    packageId: pkg._id,
    status: 'ACCEPTED',
    totalAmount: 2000
  });

  console.log('--- TEST 1: Block booking from non-ACCEPTED Quotation ---');
  const res1 = await request(app)
    .post('/api/bookings')
    .set(reqHeaders)
    .send({
      quotationId: draftQuotation._id.toString(),
      departureInstanceId: departure._id.toString(),
      seatsReserved: 2
    });

  if (res1.status === 409) {
    console.log('✅ TEST 1 PASSED: Blocked DRAFT quotation (409 Conflict)');
  } else {
    throw new Error(`TEST 1 FAILED: Expected 409, got ${res1.status}`);
  }

  console.log('--- TEST 2: Create Booking successfully ---');
  const res2 = await request(app)
    .post('/api/bookings')
    .set(reqHeaders)
    .send({
      quotationId: acceptedQuotation._id.toString(),
      departureInstanceId: departure._id.toString(),
      seatsReserved: 2
    });

  if (res2.status !== 201) throw new Error(`TEST 2 FAILED: Expected 201, got ${res2.status}. Body: ${JSON.stringify(res2.body)}`);
  
  const bookingId = res2.body.data._id;
  const updatedDeparture = await DepartureInstance.findById(departure._id);
  if (res2.body.data.seatsReserved === 2 && updatedDeparture.seatsAvailable === 8) {
    console.log('✅ TEST 2 PASSED: Booking created, seats reserved');
  } else {
    throw new Error('TEST 2 FAILED: State mismatch');
  }

  console.log('--- TEST 3: Enforce Atomic Traveler Limit (Concurrency) ---');
  // We reserved 2 seats. We fire 3 traveler additions simultaneously.
  // Using Promise.all to genuinely test the race condition.
  
  const reqHeadersWithRetry = async (payload) => {
    let retries = 3;
    let res;
    while (retries > 0) {
      res = await request(app).post('/api/booking-travelers').set(reqHeaders).send(payload);
      if (res.status === 409 && res.body.error && res.body.error.message && res.body.error.message.includes('Concurrent')) {
        // Simulating a client retrying a transient write conflict
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
        retries--;
      } else {
        break;
      }
    }
    return res;
  };

  const reqTraveler1 = reqHeadersWithRetry({ bookingId: bookingId, travelerId: new mongoose.Types.ObjectId().toString(), seatAssignment: '1A', roomAssignment: '101' });
  const reqTraveler2 = reqHeadersWithRetry({ bookingId: bookingId, travelerId: new mongoose.Types.ObjectId().toString(), seatAssignment: '1B', roomAssignment: '101' });
  const reqTraveler3 = reqHeadersWithRetry({ bookingId: bookingId, travelerId: new mongoose.Types.ObjectId().toString(), seatAssignment: '1C', roomAssignment: '101' });

  const travelerResults = await Promise.all([reqTraveler1, reqTraveler2, reqTraveler3]);
  const trSuccesses = travelerResults.filter(r => r.status === 201);
  const trFailures = travelerResults.filter(r => r.status === 409);

  if (trSuccesses.length === 2 && trFailures.length === 1) {
    console.log('✅ TEST 3 PASSED: Concurrency handled, exactly 2 succeeded and 1 blocked (409)');
  } else {
    throw new Error(`TEST 3 FAILED: Expected 2 successes and 1 failure, got ${trSuccesses.length} successes and ${trFailures.length} failures (Other statuses: ${travelerResults.filter(r => r.status !== 201 && r.status !== 409).map(r => r.status).join(',')})`);
  }

  console.log('--- TEST 4: Cancellation Seat Release ---');
  const res4 = await request(app)
    .put(`/api/bookings/${bookingId}/cancel`)
    .set(reqHeaders)
    .send();

  if (res4.status !== 200) throw new Error(`TEST 4 FAILED: Expected 200, got ${res4.status}`);

  const cancelledDep = await DepartureInstance.findById(departure._id);
  if (cancelledDep.seatsAvailable === 10) {
    console.log('✅ TEST 4 PASSED: Cancel released exact seatsReserved back to departure');
  } else {
    throw new Error('TEST 4 FAILED: seatsAvailable is ' + cancelledDep.seatsAvailable);
  }

  console.log('--- TEST 5: Waitlist Promotion Concurrency ---');
  // Set departure to only have 1 seat left
  await DepartureInstance.updateOne({ _id: departure._id }, { $set: { seatsAvailable: 1 } });
  
  // Seed two WAITLISTED bookings
  const wl1 = await Booking.create({
    customerId: testCustomerId,
    companyId: testCompanyId,
    branchId: testBranchId,
    packageId: pkg._id,
    departureInstanceId: departure._id,
    status: 'WAITLISTED',
    seatsReserved: 1
  });

  const wl2 = await Booking.create({
    customerId: testCustomerId,
    companyId: testCompanyId,
    branchId: testBranchId,
    packageId: pkg._id,
    departureInstanceId: departure._id,
    status: 'WAITLISTED',
    seatsReserved: 1
  });

  // Genuinely test the race condition using Promise.all
  const reqPromote1 = request(app).put(`/api/bookings/${wl1._id}/promote`).set(reqHeaders).send();
  const reqPromote2 = request(app).put(`/api/bookings/${wl2._id}/promote`).set(reqHeaders).send();

  const promoteResults = await Promise.all([reqPromote1, reqPromote2]);
  
  const prSuccesses = promoteResults.filter(r => r.status === 200);
  const prFailures = promoteResults.filter(r => r.status === 409);

  if (prSuccesses.length === 1 && prFailures.length === 1) {
    const finalDep = await DepartureInstance.findById(departure._id);
    if (finalDep.seatsAvailable === 0) {
      console.log('✅ TEST 5 PASSED: Waitlist promotion concurrency resolved safely (one 200, one 409)');
    } else {
      throw new Error('TEST 5 FAILED: Seats not updated correctly. seatsAvailable: ' + finalDep.seatsAvailable);
    }
  } else {
    throw new Error(`TEST 5 FAILED: Expected 1 success and 1 failure, got ${prSuccesses.length} successes and ${prFailures.length} failures`);
  }

  console.log('--- TEST 6: 409 Conflict when seats unavailable ---');
  const res6 = await request(app)
    .post('/api/bookings')
    .set(reqHeaders)
    .send({
      quotationId: acceptedQuotation._id.toString(),
      departureInstanceId: departure._id.toString(),
      seatsReserved: 1
    });

  if (res6.status === 409) {
    console.log('✅ TEST 6 PASSED: Blocked booking due to no seats (409 Conflict)');
  } else {
    throw new Error(`TEST 6 FAILED: Expected 409, got ${res6.status}`);
  }

  console.log('--- TEST 7: Audit log for cancelled WAITLISTED booking ---');
  const wl3 = await Booking.create({
    customerId: testCustomerId,
    companyId: testCompanyId,
    branchId: testBranchId,
    packageId: pkg._id,
    departureInstanceId: departure._id,
    status: 'WAITLISTED',
    seatsReserved: 5
  });

  const res7 = await request(app)
    .put(`/api/bookings/${wl3._id}/cancel`)
    .set(reqHeaders)
    .send();

  if (res7.status !== 200) throw new Error(`TEST 7 FAILED: Expected 200 on cancel, got ${res7.status}`);

  const cancelAudit = await AuditLog.collection.findOne({ entityId: wl3._id, action: 'cancel' });
  if (cancelAudit && cancelAudit.details && cancelAudit.details.includes('Released 0 seats')) {
    console.log('✅ TEST 7 PASSED: Audit log recorded Released 0 seats');
  } else {
    throw new Error('TEST 7 FAILED: Audit log details mismatch: ' + (cancelAudit ? cancelAudit.details : 'not found'));
  }

  console.log('\n✅ ALL TESTS PASSED SUCCESSFULLY');
  });
}

if (require.main === module) {
  setup().then(() => runTests().then(teardown).catch(err => {
    console.error(err);
    teardown();
    process.exit(1);
  }));
}
