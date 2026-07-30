const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const app = require('./app');
const { Customer } = require('./models/CustomerTraveler');
const { Package, DepartureInstance } = require('./models/Product');
const { Resource } = require('./models/Resource');
const { Booking } = require('./models/Pipeline');
const { User, Employee } = require('./models/UserEmployee');
const { requestContext } = require('./utils/context');

let replSet;

const testAdminId = new mongoose.Types.ObjectId();
const testBranchId = new mongoose.Types.ObjectId();
const testCompanyId = new mongoose.Types.ObjectId();
const testCustomerId = new mongoose.Types.ObjectId();
const testDriverId = new mongoose.Types.ObjectId();
const testVehicleId = new mongoose.Types.ObjectId();

async function setup() {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  await mongoose.connect(uri);
  console.log('ERP Hubs Test DB connected.');
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

async function runERPHubsTests() {
  console.log('\n==================================================');
  console.log('STARTING CENTRAL ERP HUBS AUTOMATED TEST SUITE');
  console.log('==================================================\n');

  await setup();

  try {
    await requestContext.run({
      branchId: testBranchId.toString(),
      companyId: testCompanyId.toString(),
      employeeId: testAdminId.toString(),
      currentUserRole: 'ADMIN'
    }, async () => {
      // 0. Seed Base Data
      const pkg = await Package.create({
        name: 'Annapurna Circuit Trek',
        itinerary: 'Day 1: Besisahar, Day 2: Manang',
        basePricing: 120000,
        branchId: testBranchId,
        companyId: testCompanyId,
        createdBy: testAdminId
      });

      const departure = await DepartureInstance.create({
        packageId: pkg._id,
        startDate: new Date('2026-11-01'),
        endDate: new Date('2026-11-12'),
        seatsTotal: 12,
        seatsAvailable: 10,
        seatsBooked: 2,
        branchId: testBranchId,
        companyId: testCompanyId,
        createdBy: testAdminId
      });

      const customer = await Customer.create({
        _id: testCustomerId,
        firstName: 'Sita',
        lastName: 'Karki',
        email: 'sita@example.com',
        phone: '+9779811111111',
        branchId: testBranchId,
        companyId: testCompanyId
      });

      const driverUser = await User.create({
        _id: testDriverId,
        email: 'driver@himalaya.internal',
        passwordHash: 'hashedpass',
        role: 'OPERATIONS',
        branchId: testBranchId,
        companyId: testCompanyId
      });

      const driver = await Employee.create({
        userId: driverUser._id,
        designation: 'Tour Driver',
        salesTarget: 0,
        commissionRate: 0,
        branchId: testBranchId,
        companyId: testCompanyId
      });

      const vehicle = await Resource.create({
        _id: testVehicleId,
        type: 'Vehicle',
        name: 'Toyota HiAce Bus (Ba 2 Kha 1234)',
        status: 'Active',
        branchId: testBranchId,
        companyId: testCompanyId
      });

      const booking1 = await Booking.create({
        customerId: customer._id,
        packageId: pkg._id,
        departureInstanceId: departure._id,
        seatsReserved: 1,
        totalAmount: 120000,
        totalPrice: 120000,
        status: 'CONFIRMED',
        paymentStatus: 'UNPAID',
        branchId: testBranchId,
        companyId: testCompanyId
      });

      const booking2 = await Booking.create({
        customerId: customer._id,
        packageId: pkg._id,
        departureInstanceId: departure._id,
        seatsReserved: 1,
        totalAmount: 120000,
        totalPrice: 120000,
        status: 'CONFIRMED',
        paymentStatus: 'UNPAID',
        branchId: testBranchId,
        companyId: testCompanyId
      });

      // Generate Invoices via Finance Hub
      const invRes1 = await request(app).post('/api/finance/invoices').set(reqHeaders).send({ bookingId: booking1._id.toString() });
      const invRes2 = await request(app).post('/api/finance/invoices').set(reqHeaders).send({ bookingId: booking2._id.toString() });
      const invoice1Id = invRes1.body.data._id;
      const invoice2Id = invRes2.body.data._id;

      // 1. Finance Hub: Multi-Invoice Payment Allocation
      console.log('--- TEST 1: Finance Hub - Multi-Invoice Payment Allocation ---');
      const payAllocRes = await request(app)
        .post('/api/finance/payments')
        .set(reqHeaders)
        .send({
          customerId: customer._id.toString(),
          amount: 240000,
          paymentMethod: 'BANK_TRANSFER',
          transactionRef: 'GLOBAL-BANK-778899',
          allocations: [
            { invoiceId: invoice1Id, allocatedAmount: 120000 },
            { invoiceId: invoice2Id, allocatedAmount: 120000 }
          ]
        });

      console.log('Multi-Invoice Payment Status:', payAllocRes.status, 'Payment ID:', payAllocRes.body.data._id);
      if (payAllocRes.status !== 201) throw new Error('Test 1 Failed: Multi-invoice allocation');

      // Verify both invoices are now PAID
      const checkInv1 = await request(app).get(`/api/finance/invoices/${invoice1Id}`).set(reqHeaders);
      const checkInv2 = await request(app).get(`/api/finance/invoices/${invoice2Id}`).set(reqHeaders);
      console.log('Invoice 1 Status:', checkInv1.body.data.status, 'Invoice 2 Status:', checkInv2.body.data.status);
      if (checkInv1.body.data.status !== 'PAID' || checkInv2.body.data.status !== 'PAID') {
        throw new Error('Test 1 Failed: Invoices should be marked PAID after allocation');
      }

      // 2. Finance Hub: Credit Note Issuance & Adjustment
      console.log('\n--- TEST 2: Finance Hub - Credit Note Issuance ---');
      const cnRes = await request(app)
        .post('/api/finance/credit-notes')
        .set(reqHeaders)
        .send({
          type: 'CREDIT',
          invoiceId: invoice1Id,
          bookingId: booking1._id.toString(),
          amount: 10000,
          reason: 'Early bird loyalty discount refund'
        });

      console.log('Credit Note Created:', cnRes.status, cnRes.body.data ? cnRes.body.data.noteNumber : cnRes.body);
      if (cnRes.status !== 201) throw new Error('Test 2 Failed: Credit note issuance');

      // 3. Finance Hub: Operational Expense & Approval Workflow Engine
      console.log('\n--- TEST 3: Finance Hub - Operational Expense & Approval Workflow ---');
      const expRes = await request(app)
        .post('/api/finance/expenses')
        .set(reqHeaders)
        .send({
          category: 'MARKETING',
          subCategory: 'Social Media Campaign',
          amount: 75000, // High-value > 50,000 triggers PENDING_APPROVAL
          paymentMethod: 'BANK_TRANSFER'
        });

      console.log('High-value Expense Status:', expRes.status, 'Approval Status:', expRes.body.data.approvalStatus);
      if (expRes.status !== 201 || expRes.body.data.approvalStatus !== 'PENDING_APPROVAL') {
        throw new Error('Test 3 Failed: High value expense should be PENDING_APPROVAL');
      }

      // Manager Approves Expense
      const expId = expRes.body.data._id;
      const appRes = await request(app)
        .post(`/api/finance/approvals/EXPENSE/${expId}/approve`)
        .set(reqHeaders)
        .send({});

      console.log('Approval Status After Action:', appRes.status, appRes.body.data.approvalStatus);
      if (appRes.status !== 200 || appRes.body.data.approvalStatus !== 'APPROVED') {
        throw new Error('Test 3 Failed: Expense approval failed');
      }

      // 4. Operations Hub: Staff & Driver Payroll Ledger
      console.log('\n--- TEST 4: Operations Hub - Driver/Staff Payroll Ledger ---');
      const staffLedgerRes = await request(app)
        .post('/api/operations/staff-driver-ledger')
        .set(reqHeaders)
        .send({
          staffId: driver._id.toString(),
          type: 'ADVANCE',
          amount: 15000,
          paymentMethod: 'CASH',
          notes: 'Fuel and food advance for Annapurna tour'
        });

      console.log('Driver Advance Status:', staffLedgerRes.status, staffLedgerRes.body.data ? staffLedgerRes.body.data.type : staffLedgerRes.body);
      if (staffLedgerRes.status !== 201) throw new Error('Test 4 Failed: Driver advance ledger');

      // 5. Operations Hub: Vehicle Costs & Maintenance Logs
      console.log('\n--- TEST 5: Operations Hub - Vehicle Maintenance & Mileage Logs ---');
      const vehCostRes = await request(app)
        .post('/api/operations/vehicle-costs')
        .set(reqHeaders)
        .send({
          resourceId: vehicle._id.toString(),
          costType: 'SERVICE',
          amount: 25000,
          mileageKm: 45000,
          vendorName: 'Toyota Nepal Service Center',
          notes: '45k km engine servicing and oil change'
        });

      console.log('Vehicle Cost Logged:', vehCostRes.status, vehCostRes.body.data ? vehCostRes.body.data.costType : vehCostRes.body);
      if (vehCostRes.status !== 201) throw new Error('Test 5 Failed: Vehicle cost logging');

      // 6. Documents Hub: Invoice, Receipt, Manifest & Voucher Render Stubs
      console.log('\n--- TEST 6: Documents Hub - Document Generation & Render Stubs ---');
      
      const docInvRes = await request(app).get(`/api/documents/invoices/${invoice1Id}`).set(reqHeaders);
      console.log('Doc Hub Invoice:', docInvRes.status, docInvRes.body.data.document.docNumber);
      if (docInvRes.status !== 200 || !docInvRes.body.data.document.qrPayload) throw new Error('Test 6 Failed: Invoice doc');

      const docManRes = await request(app).get(`/api/documents/manifests/${departure._id}`).set(reqHeaders);
      console.log('Doc Hub Manifest:', docManRes.status, docManRes.body.data.document.docNumber);
      if (docManRes.status !== 200) throw new Error('Test 6 Failed: Manifest doc');

      const docVouchRes = await request(app).get(`/api/documents/vouchers/${booking1._id}`).set(reqHeaders);
      console.log('Doc Hub Voucher:', docVouchRes.status, docVouchRes.body.data.document.docNumber);
      if (docVouchRes.status !== 200) throw new Error('Test 6 Failed: Voucher doc');

      // 7. Finance Hub: Executive Dashboard Cards
      console.log('\n--- TEST 7: Finance Hub - Executive Dashboard Cards ---');
      const dashRes = await request(app).get('/api/finance/reports/executive-dashboard').set(reqHeaders);
      console.log('Executive Dashboard Cards:', dashRes.body.data);
      if (dashRes.status !== 200 || dashRes.body.data.todaysCollection !== 240000) {
        throw new Error('Test 7 Failed: Executive dashboard metrics');
      }

      // 8. Finance Hub: Consolidated Booking Financial Summary
      console.log('\n--- TEST 8: Finance Hub - Consolidated Booking Financial Summary ---');
      const bookSumRes = await request(app).get(`/api/finance/reports/bookings/${booking1._id}/summary`).set(reqHeaders);
      console.log('Booking 1 Summary Data: Customer:', bookSumRes.body.data.customerName, 'Summary:', bookSumRes.body.data.summary);
      if (bookSumRes.status !== 200 || !bookSumRes.body.data.invoice) {
        throw new Error('Test 8 Failed: Booking financial summary');
      }

      // 9. Operations Hub: Tour Main Screen Financial Summary
      console.log('\n--- TEST 9: Operations Hub - Operations Main Screen Tour Summary ---');
      const tourSumRes = await request(app).get(`/api/operations/tours/${departure._id}/financial-summary`).set(reqHeaders);
      console.log('Tour Main Screen Summary Data:', tourSumRes.body.data.financials);
      if (tourSumRes.status !== 200 || tourSumRes.body.data.financials.totalRevenue !== 240000) {
        throw new Error('Test 9 Failed: Tour financial summary');
      }

      console.log('\n==================================================');
      console.log('CENTRAL ERP HUBS (FINANCE, OPERATIONS, DOCUMENTS) PASSED! 🎉');
      console.log('==================================================\n');
    });
  } finally {
    await teardown();
  }
}

runERPHubsTests().catch(err => {
  console.error('Central ERP Hubs Test Suite Failed:', err);
  process.exit(1);
});
