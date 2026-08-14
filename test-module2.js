process.env.NODE_ENV = process.env.NODE_ENV || 'test';
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const app = require('./app');
const { requestContext } = require('./utils/context');

const testAdminId = new mongoose.Types.ObjectId();
const testManagerId = new mongoose.Types.ObjectId();
const testAgentId = new mongoose.Types.ObjectId();
const testOperationsId = new mongoose.Types.ObjectId();
const testBranchId = new mongoose.Types.ObjectId();
const testCompanyId = new mongoose.Types.ObjectId();

let replSet;

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

async function runTests() {
  await requestContext.run({
    branchId: testBranchId.toString(),
    companyId: testCompanyId.toString(),
    employeeId: testAdminId.toString(),
    currentUserRole: 'ADMIN'
  }, async () => {
  let packageId, departure1Id, departure2Id, departure3Id, resourceId;

  console.log('--- TEST 1: Package Creation (ADMIN) ---');
  const res1 = await request(app)
    .post('/api/packages')
    .set('x-mock-role', 'ADMIN')
    .set('x-mock-employee-id', testAdminId.toString())
    .set('x-mock-branch-id', testBranchId.toString())
    .set('x-mock-company-id', testCompanyId.toString())
    .send({
      name: 'Everest Base Camp',
      basePricing: 1200
    });
  
  if (res1.status !== 201) throw new Error('Failed to create package: ' + JSON.stringify(res1.body));
  packageId = res1.body.data._id;
  console.log('✅ TEST 1 PASSED: Package created');

  console.log('--- TEST 2: Departure Creation (OPERATIONS) ---');
  const res2 = await request(app)
    .post('/api/departures')
    .set('x-mock-role', 'OPERATIONS')
    .set('x-mock-employee-id', testOperationsId.toString())
    .set('x-mock-branch-id', testBranchId.toString())
    .set('x-mock-company-id', testCompanyId.toString())
    .send({
      packageId: packageId,
      seatsTotal: 15,
      startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      endDate: new Date(Date.now() + 5 * 86400000).toISOString() // +5 days
    });

  if (res2.status !== 201) throw new Error('Failed to create departure: ' + JSON.stringify(res2.body));
  departure1Id = res2.body.data._id;
  console.log('✅ TEST 2 PASSED: Departure created');

  console.log('--- TEST 3: Resource Creation (MANAGER) ---');
  const res3 = await request(app)
    .post('/api/resources')
    .set('x-mock-role', 'MANAGER')
    .set('x-mock-employee-id', testManagerId.toString())
    .set('x-mock-branch-id', testBranchId.toString())
    .set('x-mock-company-id', testCompanyId.toString())
    .send({
      type: 'Guide',
      name: 'John Doe'
    });

  if (res3.status !== 201) throw new Error('Failed to create resource: ' + JSON.stringify(res3.body));
  resourceId = res3.body.data._id;
  console.log('✅ TEST 3 PASSED: Resource created');

  console.log('--- TEST 4: Resource Assignment (OPERATIONS) ---');
  const res4 = await request(app)
    .post('/api/assignments')
    .set('x-mock-role', 'OPERATIONS')
    .set('x-mock-employee-id', testOperationsId.toString())
    .set('x-mock-branch-id', testBranchId.toString())
    .set('x-mock-company-id', testCompanyId.toString())
    .send({
      resourceId: resourceId,
      departureInstanceId: departure1Id
    });

  if (res4.status !== 201) throw new Error('Failed to assign resource: ' + JSON.stringify(res4.body));
  console.log('✅ TEST 4 PASSED: Resource assigned successfully');

  console.log('--- TEST 5: Prevent Double Booking (409 Conflict) ---');
  // Create an overlapping departure
  const res5a = await request(app)
    .post('/api/departures')
    .set('x-mock-role', 'OPERATIONS')
    .set('x-mock-employee-id', testOperationsId.toString())
    .set('x-mock-branch-id', testBranchId.toString())
    .set('x-mock-company-id', testCompanyId.toString())
    .send({
      packageId: packageId,
      seatsTotal: 10,
      startDate: new Date(Date.now() + 2 * 86400000).toISOString(), // Starts during departure1
      endDate: new Date(Date.now() + 6 * 86400000).toISOString()
    });
  
  departure2Id = res5a.body.data._id;

  const res5b = await request(app)
    .post('/api/assignments')
    .set('x-mock-role', 'OPERATIONS')
    .set('x-mock-employee-id', testOperationsId.toString())
    .set('x-mock-branch-id', testBranchId.toString())
    .set('x-mock-company-id', testCompanyId.toString())
    .send({
      resourceId: resourceId,
      departureInstanceId: departure2Id
    });

  if (res5b.status !== 409) throw new Error('Expected 409 on double booking, got: ' + res5b.status);
  console.log('✅ TEST 5 PASSED: Double booking prevented');

  console.log('--- TEST 6: Atomic Capacity Adjustment bounds ---');
  const res6 = await request(app)
    .put(`/api/departures/${departure1Id}/capacity`)
    .set('x-mock-role', 'ADMIN')
    .set('x-mock-employee-id', testAdminId.toString())
    .set('x-mock-branch-id', testBranchId.toString())
    .set('x-mock-company-id', testCompanyId.toString())
    .send({
      seatsTotal: 20
    });

  if (res6.status !== 200 || res6.body.data.seatsTotal !== 20 || res6.body.data.seatsAvailable !== 20) {
    throw new Error('Capacity adjustment failed: ' + JSON.stringify(res6.body));
  }
  console.log('✅ TEST 6 PASSED: Capacity adjusted safely');

  console.log('--- TEST 7: Guard Assignment on Cancelled Departure ---');
  const res7a = await request(app)
    .put(`/api/departures/${departure2Id}/status`)
    .set('x-mock-role', 'OPERATIONS')
    .set('x-mock-employee-id', testOperationsId.toString())
    .set('x-mock-branch-id', testBranchId.toString())
    .set('x-mock-company-id', testCompanyId.toString())
    .send({ status: 'Cancelled' });

  if (res7a.status !== 200) throw new Error('Failed to cancel departure');

  const res7b = await request(app)
    .post('/api/assignments')
    .set('x-mock-role', 'OPERATIONS')
    .set('x-mock-employee-id', testOperationsId.toString())
    .set('x-mock-branch-id', testBranchId.toString())
    .set('x-mock-company-id', testCompanyId.toString())
    .send({
      resourceId: resourceId,
      departureInstanceId: departure2Id
    });

  if (res7b.status !== 400) throw new Error('Expected 400 on cancelled assignment, got: ' + res7b.status);
  console.log('✅ TEST 7 PASSED: Blocked assignment to Cancelled departure');

  console.log('\n✅ ALL TESTS PASSED SUCCESSFULLY');
  });
}

// Ensure execution waits for promises
if (require.main === module) {
  setup().then(() => runTests().then(teardown).catch(err => {
    console.error(err);
    teardown();
    process.exit(1);
  }));
}
