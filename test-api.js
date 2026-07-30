require('dotenv').config();
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('./app');
const { Customer } = require('./models/CustomerTraveler');
const { Lead, Inquiry, Quotation } = require('./models/Pipeline');
const { AuditLog } = require('./models/AuditReminder');
const { requestContext } = require('./utils/context');

let replSet;

async function setupDb() {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  await mongoose.connect(uri);
}

async function teardownDb() {
  await mongoose.disconnect();
  await replSet.stop();
}

async function runTests() {
  await setupDb();
  console.log('Test DB connected.');

  try {
    await requestContext.run({
      branchId: '60d5ecb74d6bb8928a314111',
      companyId: '60d5ecb74d6bb8928a314000',
      employeeId: new mongoose.Types.ObjectId().toString(),
      currentUserRole: 'ADMIN'
    }, async () => {
    // Setup Mock Customer
    const customer = new Customer({
      firstName: 'John',
      lastName: 'Doe',
      branchId: '60d5ecb74d6bb8928a314111',
      companyId: '60d5ecb74d6bb8928a314000'
    });
    await customer.save();

    console.log('--- TEST 1: Reject server-derived field (firstResponseAt) ---');
    const res1 = await request(app)
      .post('/api/leads')
      .send({
        customerId: customer._id.toString(),
        firstResponseAt: new Date()
      });
    if (res1.status === 400 && res1.body.error.code === 'VALIDATION_ERROR') {
      console.log('✅ TEST 1 PASSED: Strict validation rejected firstResponseAt');
    } else {
      console.error('❌ TEST 1 FAILED:', res1.body);
    }

    console.log('\n--- TEST 2: Successful Lead Creation ---');
    const res2 = await request(app)
      .post('/api/leads')
      .send({
        customerId: customer._id.toString()
      });
    const leadId = res2.body.data._id;
    if (res2.status === 201 && leadId) {
      console.log('✅ TEST 2 PASSED: Lead created successfully');
    } else {
      console.error('❌ TEST 2 FAILED:', res2.body);
    }

    console.log('\n--- TEST 3: firstResponseAt is correctly set on AuditLog trigger ---');
    // Creating the lead automatically triggers an audit log, so let's verify if firstResponseAt was set
    const lead = await Lead.findById(leadId);
    if (lead.firstResponseAt != null) {
      console.log('✅ TEST 3 PASSED: firstResponseAt was automatically populated by the atomic update trigger');
    } else {
      console.error('❌ TEST 3 FAILED: firstResponseAt is still null');
    }

    console.log('\n--- TEST 4: Lead to Inquiry Conversion ---');
    const res4 = await request(app)
      .post(`/api/leads/${leadId}/convert-to-inquiry`)
      .send({});
    if (res4.status === 201 && res4.body.data.convertedFromLeadId === leadId) {
      console.log('✅ TEST 4 PASSED: Lead converted to Inquiry');
    } else {
      console.error('❌ TEST 4 FAILED:', res4.body);
    }
    const inquiryId = res4.body.data._id;

    console.log('\n--- TEST 5: Prevent Double Conversion (409 Conflict) ---');
    const res5 = await request(app)
      .post(`/api/leads/${leadId}/convert-to-inquiry`)
      .send({});
    if (res5.status === 409) {
      console.log('✅ TEST 5 PASSED: Double conversion prevented with 409 Conflict');
    } else {
      console.error('❌ TEST 5 FAILED:', res5.status, res5.body);
    }

    console.log('\n--- TEST 6: Inquiry to Quotation Conversion ---');
    const res6 = await request(app)
      .post(`/api/inquiries/${inquiryId}/convert-to-quotation`)
      .send({});
    if (res6.status === 201) {
      console.log('✅ TEST 6 PASSED: Inquiry converted to Quotation');
    } else {
      console.error('❌ TEST 6 FAILED:', res6.body);
    }
    const quotationId = res6.body.data._id;

    console.log('\n--- TEST 7: Agent Role Cannot Accept Quotation ---');
    const res7 = await request(app)
      .post(`/api/quotations/${quotationId}/accept`)
      .set('x-mock-role', 'AGENT')
      .send({});
    if (res7.status === 403) {
      console.log('✅ TEST 7 PASSED: Agent correctly forbidden from accepting quotation');
    } else {
      console.error('❌ TEST 7 FAILED:', res7.status, res7.body);
    }

    });
  } catch (error) {
    console.error('Test execution failed:', error);
  } finally {
    await teardownDb();
  }
}

runTests();
