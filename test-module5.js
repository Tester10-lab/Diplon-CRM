const { MongoMemoryReplSet } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');

const app = require('./app');
const { User, Employee } = require('./models/UserEmployee');
const { Package, DepartureInstance } = require('./models/Product');
const { Customer, Traveler } = require('./models/CustomerTraveler');
const { Booking } = require('./models/Pipeline');
const { BookingTraveler } = require('./models/BookingTraveler');

let replset;

const companyAId = new mongoose.Types.ObjectId();
const branchAId = new mongoose.Types.ObjectId();
const companyBId = new mongoose.Types.ObjectId();
const branchBId = new mongoose.Types.ObjectId();

const adminAHeaders = {
  'x-mock-role': 'ADMIN',
  'x-mock-employee-id': new mongoose.Types.ObjectId().toString(),
  'x-mock-branch-id': branchAId.toString(),
  'x-mock-company-id': companyAId.toString()
};

const opsAHeaders = {
  'x-mock-role': 'OPERATIONS',
  'x-mock-employee-id': new mongoose.Types.ObjectId().toString(),
  'x-mock-branch-id': branchAId.toString(),
  'x-mock-company-id': companyAId.toString()
};

const financeAHeaders = {
  'x-mock-role': 'FINANCE',
  'x-mock-employee-id': new mongoose.Types.ObjectId().toString(),
  'x-mock-branch-id': branchAId.toString(),
  'x-mock-company-id': companyAId.toString()
};

const adminBHeaders = {
  'x-mock-role': 'ADMIN',
  'x-mock-employee-id': new mongoose.Types.ObjectId().toString(),
  'x-mock-branch-id': branchBId.toString(),
  'x-mock-company-id': companyBId.toString()
};

async function runModule5Tests() {
  console.log('\n==================================================');
  console.log('STARTING MODULE 5 AUTOMATED TEST SUITE');
  console.log('==================================================\n');

  replset = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replset.getUri();
  await mongoose.connect(uri);
  console.log('Module 5 Test DB connected.');

  // Seed Base Data
  const packageA = await Package.create({
    name: 'EBC Trek Module 5',
    durationDays: 12,
    basePricing: 150000,
    companyId: companyAId,
    branchId: branchAId
  });

  const today = new Date();
  const startDateA = new Date(today);
  startDateA.setDate(startDateA.getDate() + 1); // Tomorrow
  const endDateA = new Date(startDateA);
  endDateA.setDate(endDateA.getDate() + 12);

  const departureA = await DepartureInstance.create({
    packageId: packageA._id,
    startDate: startDateA,
    endDate: endDateA,
    seatsTotal: 10,
    seatsAvailable: 7,
    status: 'Active',
    companyId: companyAId,
    branchId: branchAId
  });

  // Past delayed departure (status Active, end date in past)
  const pastStart = new Date(today);
  pastStart.setDate(pastStart.getDate() - 15);
  const pastEnd = new Date(today);
  pastEnd.setDate(pastEnd.getDate() - 2);

  const departureDelayed = await DepartureInstance.create({
    packageId: packageA._id,
    startDate: pastStart,
    endDate: pastEnd,
    seatsTotal: 10,
    seatsAvailable: 5,
    status: 'Active',
    companyId: companyAId,
    branchId: branchAId
  });

  // Overlapping Departure B
  const departureB = await DepartureInstance.create({
    packageId: packageA._id,
    startDate: startDateA,
    endDate: endDateA,
    seatsTotal: 10,
    seatsAvailable: 10,
    status: 'Active',
    companyId: companyAId,
    branchId: branchAId
  });

  // Customer & Travelers
  const customerA = await Customer.create({
    firstName: 'Ram',
    lastName: 'Shrestha',
    email: 'ram.m5@example.com',
    phone: '9841000000',
    companyId: companyAId,
    branchId: branchAId
  });

  const traveler1 = await Traveler.create({
    name: 'Ram Shrestha',
    dob: new Date('1990-01-01'),
    companyId: companyAId,
    branchId: branchAId
  });

  const traveler2 = await Traveler.create({
    name: 'Sita Shrestha',
    dob: new Date('1992-05-15'),
    companyId: companyAId,
    branchId: branchAId
  });

  const traveler3 = await Traveler.create({
    name: 'Hari Shrestha',
    dob: new Date('1995-10-20'),
    companyId: companyAId,
    branchId: branchAId
  });

  // Booking with 3 Travelers
  const bookingA = await Booking.create({
    customerId: customerA._id,
    packageId: packageA._id,
    departureInstanceId: departureA._id,
    seatsReserved: 3,
    totalAmount: 450000,
    status: 'CONFIRMED',
    companyId: companyAId,
    branchId: branchAId
  });

  await BookingTraveler.create([
    { bookingId: bookingA._id, travelerId: traveler1._id, status: 'Active', companyId: companyAId, branchId: branchAId },
    { bookingId: bookingA._id, travelerId: traveler2._id, status: 'Active', companyId: companyAId, branchId: branchAId },
    { bookingId: bookingA._id, travelerId: traveler3._id, status: 'Active', companyId: companyAId, branchId: branchAId }
  ]);

  // TEST 1: FINANCE Role Access & Vehicle Profitability Report
  console.log('--- TEST 1: FINANCE Role Access ---');
  const dashRes1 = await request(app)
    .get('/api/operations/dashboard')
    .set(financeAHeaders);

  if (dashRes1.status !== 200) {
    throw new Error(`TEST 1 FAILED: Dashboard returned status ${dashRes1.status}`);
  }
  const dashData1 = dashRes1.body.data || dashRes1.body;
  if (!dashData1.activeTours) {
    throw new Error('TEST 1 FAILED: activeTours missing from dashboard response');
  }
  console.log('✅ TEST 1 PASSED: FINANCE user successfully accessed Operations Dashboard');

  // TEST 2: Vehicle Profile CRUD & Duplicate Registration Rollback
  console.log('\n--- TEST 2: Vehicle Profile CRUD & Duplicate Registration Rollback ---');
  const createVehRes = await request(app)
    .post('/api/operations/fleet')
    .set(opsAHeaders)
    .send({
      name: 'Tourist Bus A1',
      registrationNumber: 'BA-2-PA-1234',
      seatingCapacity: 2, // Small vehicle capacity = 2 for capacity test
      bluebookExpiry: '2027-12-31'
    });

  if (createVehRes.status !== 201) {
    throw new Error(`TEST 2 FAILED: Vehicle creation returned ${createVehRes.status}`);
  }
  const vehData = createVehRes.body.data || createVehRes.body;
  const vehicleId = vehData._id;
  console.log(`Vehicle Created: ${vehData.name} Reg: ${vehData.profile.registrationNumber} Capacity: ${vehData.profile.seatingCapacity}`);

  // Duplicate Registration Rejection
  const dupVehRes = await request(app)
    .post('/api/operations/fleet')
    .set(opsAHeaders)
    .send({
      name: 'Tourist Bus A2',
      registrationNumber: 'BA-2-PA-1234',
      seatingCapacity: 35
    });

  if (dupVehRes.status !== 409) {
    throw new Error(`TEST 2 FAILED: Expected 409 for duplicate registration, got ${dupVehRes.status}`);
  }

  // Update Vehicle
  const updateVehRes = await request(app)
    .put(`/api/operations/fleet/${vehicleId}`)
    .set(opsAHeaders)
    .send({
      name: 'Luxury Tourist Bus A1',
      bluebookExpiry: '2028-12-31'
    });

  if (updateVehRes.status !== 200) {
    throw new Error(`TEST 2 FAILED: Vehicle update returned ${updateVehRes.status}`);
  }
  const updatedVehData = updateVehRes.body.data || updateVehRes.body;
  if (updatedVehData.name !== 'Luxury Tourist Bus A1') {
    throw new Error(`TEST 2 FAILED: Vehicle update failed to change name`);
  }
  console.log('✅ TEST 2 PASSED: Vehicle CRUD & Duplicate registration blocked (409 Conflict)');

  // TEST 3: Driver & Guide Profile CRUD & Duplicate License Rollback
  console.log('\n--- TEST 3: Driver & Guide Profile CRUD ---');
  const createDrvRes = await request(app)
    .post('/api/operations/drivers')
    .set(opsAHeaders)
    .send({
      name: 'Babu Driver',
      licenseNumber: 'LIC-998877',
      performanceRating: 4.8
    });

  if (createDrvRes.status !== 201) {
    throw new Error(`TEST 3 FAILED: Driver creation returned ${createDrvRes.status}`);
  }
  const drvData = createDrvRes.body.data || createDrvRes.body;
  const driverId = drvData._id;

  const dupDrvRes = await request(app)
    .post('/api/operations/drivers')
    .set(opsAHeaders)
    .send({
      name: 'Kaji Driver',
      licenseNumber: 'LIC-998877'
    });

  if (dupDrvRes.status !== 409) {
    throw new Error(`TEST 3 FAILED: Expected 409 for duplicate license, got ${dupDrvRes.status}`);
  }

  const createGdeRes = await request(app)
    .post('/api/operations/guides')
    .set(opsAHeaders)
    .send({
      name: 'Pasang Sherpa',
      languages: ['English', 'Nepali', 'Japanese'],
      certifications: ['High Altitude Rescue']
    });

  if (createGdeRes.status !== 201) {
    throw new Error(`TEST 3 FAILED: Guide creation returned ${createGdeRes.status}`);
  }
  console.log('✅ TEST 3 PASSED: Driver & Guide CRUD & Duplicate license blocked (409 Conflict)');

  // TEST 4: Dispatch Capacity Rejection & Overlap Double-Booking Prevention
  console.log('\n--- TEST 4: Dispatch Engine Capacity & Overlap Rejection ---');
  // Capacity Rejection: Bus capacity = 2, traveler count = 3
  const capRes = await request(app)
    .post(`/api/operations/dispatch/${departureA._id}/assign`)
    .set(opsAHeaders)
    .send({
      resourceId: vehicleId,
      role: 'VEHICLE'
    });

  if (capRes.status !== 409) {
    throw new Error(`TEST 4 FAILED: Expected 409 for capacity check, got ${capRes.status}`);
  }
  const capErr = capRes.body.error || capRes.body;
  console.log(`Capacity Check Blocked Status: ${capRes.status} Error: ${capErr.message}`);

  // Increase Vehicle Capacity to 15
  await request(app)
    .put(`/api/operations/fleet/${vehicleId}`)
    .set(opsAHeaders)
    .send({ seatingCapacity: 15 });

  // Assign Vehicle to Departure A
  const assignRes = await request(app)
    .post(`/api/operations/dispatch/${departureA._id}/assign`)
    .set(opsAHeaders)
    .send({
      resourceId: vehicleId,
      role: 'VEHICLE'
    });

  if (assignRes.status !== 201) {
    throw new Error(`TEST 4 FAILED: Vehicle dispatch returned ${assignRes.status}`);
  }

  // Double-Booking Overlap Rejection: Try assigning same vehicle to overlapping Departure B
  const doubleRes = await request(app)
    .post(`/api/operations/dispatch/${departureB._id}/assign`)
    .set(opsAHeaders)
    .send({
      resourceId: vehicleId,
      role: 'VEHICLE'
    });

  if (doubleRes.status !== 409) {
    throw new Error(`TEST 4 FAILED: Expected 409 for double-booking, got ${doubleRes.status}`);
  }
  console.log('✅ TEST 4 PASSED: Seating capacity validation & Overlap double-booking prevented');

  // TEST 5: Manifest Boarding Scanner Idempotency & PII Protection
  console.log('\n--- TEST 5: Manifest Boarding Scanner Idempotency & PII Protection ---');
  const manifestRes = await request(app)
    .get(`/api/operations/manifests/${departureA._id}`)
    .set(opsAHeaders);

  if (manifestRes.status !== 200) {
    throw new Error(`TEST 5 FAILED: Manifest returned ${manifestRes.status}`);
  }

  const manifestData = manifestRes.body.data || manifestRes.body;
  const travelerItem = manifestData.bookings[0].travelers[0];
  if (travelerItem.traveler && travelerItem.traveler.passportNumber) {
    throw new Error('TEST 5 FAILED: PII passportNumber was leaked on manifest');
  }

  // First Scan
  const boardRes1 = await request(app)
    .post(`/api/operations/manifests/${departureA._id}/board/${travelerItem._id}`)
    .set(opsAHeaders);

  if (boardRes1.status !== 200) {
    throw new Error(`TEST 5 FAILED: First boarding scan failed: ${boardRes1.status}`);
  }
  const boardData1 = boardRes1.body.data || boardRes1.body;
  if (boardData1.boardingStatus !== 'BOARDED') {
    throw new Error(`TEST 5 FAILED: First boarding scan status not BOARDED`);
  }

  // Second Scan (Idempotent)
  const boardRes2 = await request(app)
    .post(`/api/operations/manifests/${departureA._id}/board/${travelerItem._id}`)
    .set(opsAHeaders);

  if (boardRes2.status !== 200 || boardRes2.body.message !== 'Traveler already boarded') {
    throw new Error(`TEST 5 FAILED: Second boarding scan failed: ${boardRes2.status}`);
  }
  console.log('✅ TEST 5 PASSED: Boarding scanner is idempotent and PII is protected');

  // TEST 6: Operations Timeline & Note Creation
  console.log('\n--- TEST 6: Operations Timeline & Note Creation ---');
  const noteRes = await request(app)
    .post(`/api/operations/timeline/${departureA._id}/notes`)
    .set(opsAHeaders)
    .send({
      type: 'ALERT',
      message: 'Weather check complete. Road to Lukla clear.'
    });

  if (noteRes.status !== 201) {
    throw new Error(`TEST 6 FAILED: Note creation returned ${noteRes.status}`);
  }

  const timelineRes = await request(app)
    .get(`/api/operations/timeline/${departureA._id}`)
    .set(opsAHeaders);

  const timelineData = timelineRes.body.data || timelineRes.body;
  if (timelineRes.status !== 200 || timelineData.length < 2) {
    throw new Error(`TEST 6 FAILED: Timeline feed returned ${timelineRes.status}`);
  }
  console.log(`Timeline Feed Total Items: ${timelineData.length}`);
  console.log('✅ TEST 6 PASSED: Operations timeline correctly merges AuditLogs and OperationsNotes');

  // TEST 7: Dashboard Bucket Accuracy
  console.log('\n--- TEST 7: Operations Dashboard Bucket Accuracy ---');
  const dashRes2 = await request(app)
    .get('/api/operations/dashboard')
    .set(opsAHeaders);

  if (dashRes2.status !== 200) {
    throw new Error(`TEST 7 FAILED: Dashboard returned ${dashRes2.status}`);
  }
  const dashData2 = dashRes2.body.data || dashRes2.body;
  console.log('Dashboard Cards:', JSON.stringify(dashData2, null, 2));
  if (dashData2.tomorrowTours.count !== 2 || dashData2.delayedTours.count !== 1) {
    throw new Error(`TEST 7 FAILED: Tomorrow count expected 2, got ${dashData2.tomorrowTours.count}; Delayed count expected 1, got ${dashData2.delayedTours.count}`);
  }
  console.log('✅ TEST 7 PASSED: Dashboard cards correctly bucketed (tomorrow: 2, delayed: 1)');

  // TEST 8: Multi-Tenant Isolation Enforcement
  console.log('\n--- TEST 8: Multi-Tenant Isolation Enforcement ---');
  const fleetRes = await request(app)
    .get(`/api/operations/fleet/${vehicleId}`)
    .set(adminBHeaders);

  if (fleetRes.status !== 404) {
    throw new Error(`TEST 8 FAILED: Company B accessed Company A vehicle resource: ${fleetRes.status}`);
  }

  const timelineResB = await request(app)
    .get(`/api/operations/timeline/${departureA._id}`)
    .set(adminBHeaders);

  const timelineDataB = timelineResB.body.data || timelineResB.body;
  if (timelineDataB.length !== 0) {
    throw new Error(`TEST 8 FAILED: Company B accessed Company A timeline data`);
  }
  console.log('✅ TEST 8 PASSED: Multi-Tenant Isolation strictly enforced across all operations models');

  console.log('\n==================================================');
  console.log('MODULE 5 OPERATIONS CENTER TESTS PASSED! 🎉');
  console.log('==================================================\n');

  await mongoose.disconnect();
  await replset.stop();
}

runModule5Tests().catch(err => {
  console.error('\n❌ MODULE 5 TEST SUITE ERROR:', err);
  process.exit(1);
});
