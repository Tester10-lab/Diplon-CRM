const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const app = require('./app');
const { Customer } = require('./models/CustomerTraveler');
const { Lead } = require('./models/Pipeline');
const { requestContext } = require('./utils/context');

let replSet;

// Branch A identities
const branchAId = new mongoose.Types.ObjectId();
const companyAId = new mongoose.Types.ObjectId();
const employeeAId = new mongoose.Types.ObjectId();

// Branch B identities
const branchBId = new mongoose.Types.ObjectId();
const companyBId = new mongoose.Types.ObjectId(); // Same or different company, tenant scoping applies to both
const employeeBId = new mongoose.Types.ObjectId();

async function setupDb() {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  await mongoose.connect(uri);
  console.log('Test DB connected.');
}

async function teardownDb() {
  await mongoose.disconnect();
  await replSet.stop();
}

async function runTests() {
  await setupDb();
  let leadAId, leadBId;

  // Seed Branch A Data
  await requestContext.run({
    branchId: branchAId.toString(),
    companyId: companyAId.toString(),
    employeeId: employeeAId.toString(),
    currentUserRole: 'ADMIN'
  }, async () => {
    const customerA = await Customer.create({
      firstName: 'Alice',
      lastName: 'A',
      branchId: branchAId,
      companyId: companyAId
    });
    const leadA = await Lead.create({
      customerId: customerA._id,
      branchId: branchAId,
      companyId: companyAId,
      stage: 'New'
    });
    leadAId = leadA._id.toString();
  });

  // Seed Branch B Data
  await requestContext.run({
    branchId: branchBId.toString(),
    companyId: companyBId.toString(),
    employeeId: employeeBId.toString(),
    currentUserRole: 'ADMIN'
  }, async () => {
    const customerB = await Customer.create({
      firstName: 'Bob',
      lastName: 'B',
      branchId: branchBId,
      companyId: companyBId
    });
    const leadB = await Lead.create({
      customerId: customerB._id,
      branchId: branchBId,
      companyId: companyBId,
      stage: 'New'
    });
    leadBId = leadB._id.toString();
  });

  console.log('--- TEST 1: Branch A only sees Branch A data ---');
  const res1 = await request(app)
    .get('/api/leads')
    .set('x-mock-role', 'ADMIN')
    .set('x-mock-employee-id', employeeAId.toString())
    .set('x-mock-branch-id', branchAId.toString())
    .set('x-mock-company-id', companyAId.toString());

  const data1 = res1.body.data || res1.body;
  if (data1.length === 1 && data1[0]._id === leadAId) {
    console.log('✅ TEST 1 PASSED: Branch A correctly isolated');
  } else {
    throw new Error(`TEST 1 FAILED: Expected 1 lead (${leadAId}), got ${data1.length} leads: ${JSON.stringify(data1)}`);
  }

  console.log('--- TEST 2: Branch B only sees Branch B data ---');
  const res2 = await request(app)
    .get('/api/leads')
    .set('x-mock-role', 'ADMIN')
    .set('x-mock-employee-id', employeeBId.toString())
    .set('x-mock-branch-id', branchBId.toString())
    .set('x-mock-company-id', companyBId.toString());

  const data2 = res2.body.data || res2.body;
  if (data2.length === 1 && data2[0]._id === leadBId) {
    console.log('✅ TEST 2 PASSED: Branch B correctly isolated');
  } else {
    throw new Error(`TEST 2 FAILED: Expected 1 lead (${leadBId}), got ${data2.length} leads`);
  }

  console.log('--- TEST 3: Branch A cannot directly GET Branch B lead ---');
  const res3 = await request(app)
    .get(`/api/leads/${leadBId}`)
    .set('x-mock-role', 'ADMIN')
    .set('x-mock-employee-id', employeeAId.toString())
    .set('x-mock-branch-id', branchAId.toString())
    .set('x-mock-company-id', companyAId.toString());

  if (res3.status === 404) {
    console.log('✅ TEST 3 PASSED: Direct access to cross-tenant data blocked (404)');
  } else {
    throw new Error(`TEST 3 FAILED: Expected 404, got ${res3.status}`);
  }

  console.log('\n✅ ALL TENANT ISOLATION TESTS PASSED SUCCESSFULLY');
}

if (require.main === module) {
  runTests().then(teardownDb).catch(err => {
    console.error(err);
    teardownDb();
    process.exit(1);
  });
}
