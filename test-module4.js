const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const app = require('./app');
const { Customer } = require('./models/CustomerTraveler');
const { Package, DepartureInstance } = require('./models/Product');
const { Booking } = require('./models/Pipeline');
const { CommissionLedger, FinancialLedger } = require('./models/Ledger');
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
  console.log('Module 4 Test DB connected.');
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

async function runModule4Tests() {
  console.log('\n==================================================');
  console.log('STARTING MODULE 4 AUTOMATED TEST SUITE');
  console.log('==================================================\n');

  await setup();

  try {
    await requestContext.run({
      branchId: testBranchId.toString(),
      companyId: testCompanyId.toString(),
      employeeId: testAdminId.toString(),
      currentUserRole: 'ADMIN'
    }, async () => {
      // 0. Seed Base Setup Data
      const pkg = await Package.create({
        name: 'Everest Base Camp Trek',
        itinerary: 'Day 1: Lukla, Day 2: Namche',
        basePricing: 150000,
        branchId: testBranchId,
        companyId: testCompanyId,
        createdBy: testAdminId
      });

      const departure = await DepartureInstance.create({
        packageId: pkg._id,
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-10-15'),
        seatsTotal: 10,
        seatsAvailable: 8,
        seatsBooked: 2,
        branchId: testBranchId,
        companyId: testCompanyId,
        createdBy: testAdminId
      });

      const customer = await Customer.create({
        _id: testCustomerId,
        firstName: 'Ram',
        lastName: 'Sharma',
        email: 'ram@example.com',
        phone: '+9779800000000',
        branchId: testBranchId,
        companyId: testCompanyId
      });

      const booking = await Booking.create({
        customerId: customer._id,
        packageId: pkg._id,
        departureInstanceId: departure._id,
        seatsReserved: 2,
        totalAmount: 300000,
        totalPrice: 300000,
        status: 'CONFIRMED',
        paymentStatus: 'UNPAID',
        branchId: testBranchId,
        companyId: testCompanyId
      });

      // 1. Create Invoice
      console.log('--- TEST 1: Generating Invoice for Booking ---');
      const invRes = await request(app)
        .post('/api/invoices')
        .set(reqHeaders)
        .send({ bookingId: booking._id.toString() });

      console.log('Invoice Status:', invRes.status, invRes.body.data ? invRes.body.data.invoiceNumber : invRes.body);
      if (invRes.status !== 201 || !invRes.body.data) throw new Error('Test 1 Failed: Invoice creation');
      const invoiceId = invRes.body.data._id;

      // 2. Record Partial Customer Payment (NPR 100,000 via eSewa)
      console.log('\n--- TEST 2: Recording Partial Customer Payment (eSewa) ---');
      const payRes1 = await request(app)
        .post('/api/payments')
        .set(reqHeaders)
        .send({
          bookingId: booking._id.toString(),
          amount: 100000,
          paymentMethod: 'ESEWA',
          transactionRef: 'ES-99887766'
        });

      console.log('Payment 1 Status:', payRes1.status, payRes1.body.data ? payRes1.body.data.amount : payRes1.body);
      if (payRes1.status !== 201) throw new Error('Test 2 Failed: Partial payment recording');

      // Verify Invoice state after Partial Payment
      const invCheck1 = await request(app)
        .get(`/api/invoices/${invoiceId}`)
        .set(reqHeaders);
      
      console.log('Invoice Status After Partial Payment:', invCheck1.body.data.status, 'Paid:', invCheck1.body.data.paidAmount, 'Balance:', invCheck1.body.data.balanceDue);
      if (invCheck1.body.data.status !== 'PARTIALLY_PAID' || invCheck1.body.data.balanceDue !== 200000) {
        throw new Error('Test 2 Failed: Invoice status or balance due incorrect');
      }

      // 3. Record Final Customer Payment (NPR 200,000 via Bank Transfer)
      console.log('\n--- TEST 3: Recording Final Customer Payment (Bank Transfer) ---');
      const payRes2 = await request(app)
        .post('/api/payments')
        .set(reqHeaders)
        .send({
          bookingId: booking._id.toString(),
          amount: 200000,
          paymentMethod: 'BANK_TRANSFER',
          transactionRef: 'NABIL-112233'
        });

      console.log('Payment 2 Status:', payRes2.status);
      if (payRes2.status !== 201) throw new Error('Test 3 Failed: Final payment recording');

      const invCheck2 = await request(app)
        .get(`/api/invoices/${invoiceId}`)
        .set(reqHeaders);
      
      console.log('Invoice Status After Full Payment:', invCheck2.body.data.status, 'Paid:', invCheck2.body.data.paidAmount, 'Balance:', invCheck2.body.data.balanceDue);
      if (invCheck2.body.data.status !== 'PAID' || invCheck2.body.data.balanceDue !== 0) {
        throw new Error('Test 3 Failed: Invoice status should be PAID with 0 balance due');
      }

      // 4. Create Supplier Payables (Departure Level + Booking Level)
      console.log('\n--- TEST 4: Registering Supplier Payables (Vendor Bills) ---');
      
      // Departure-level Hotel cost (NPR 80,000)
      const spRes1 = await request(app)
        .post('/api/supplier-payables')
        .set(reqHeaders)
        .send({
          supplierName: 'Yak & Yeti Hotel',
          supplierCategory: 'HOTEL',
          departureInstanceId: departure._id.toString(),
          amount: 80000
        });
      console.log('Hotel Payable Created:', spRes1.status, spRes1.body.data ? spRes1.body.data.supplierName : spRes1.body);
      if (spRes1.status !== 201) throw new Error('Test 4 Failed: Hotel payable');
      const hotelPayableId = spRes1.body.data._id;

      // Departure-level Transport cost (NPR 40,000)
      const spRes2 = await request(app)
        .post('/api/supplier-payables')
        .set(reqHeaders)
        .send({
          supplierName: 'Himalayan Sherpa Transport',
          supplierCategory: 'TRANSPORT',
          departureInstanceId: departure._id.toString(),
          amount: 40000
        });
      if (spRes2.status !== 201) throw new Error('Test 4 Failed: Transport payable');

      // Booking-level Addon flight cost (NPR 30,000)
      const spRes3 = await request(app)
        .post('/api/supplier-payables')
        .set(reqHeaders)
        .send({
          supplierName: 'Yeti Airlines',
          supplierCategory: 'AIRLINE',
          bookingId: booking._id.toString(),
          amount: 30000
        });
      if (spRes3.status !== 201) throw new Error('Test 4 Failed: Flight payable');

      // 5. Pay Hotel Supplier Bill
      console.log('\n--- TEST 5: Paying Supplier Bill (Hotel) ---');
      const payHotelRes = await request(app)
        .post(`/api/supplier-payables/${hotelPayableId}/pay`)
        .set(reqHeaders)
        .send({
          amount: 80000,
          paymentMethod: 'CONNECT_IPS',
          transactionRef: 'CIPS-990011'
        });
      console.log('Pay Hotel Status:', payHotelRes.status, 'Payable Status:', payHotelRes.body.data.status);
      if (payHotelRes.status !== 200 || payHotelRes.body.data.status !== 'PAID') {
        throw new Error('Test 5 Failed: Supplier bill payout');
      }

      // 6. Agent Commission Payout
      console.log('\n--- TEST 6: Commission Payout to Agent ---');
      // Create test commission ledger entry
      const commLedger = await CommissionLedger.create({
        entityId: testAdminId,
        amount: 15000,
        type: 'credit',
        reason: 'Sales Commission for Booking',
        refId: booking._id,
        createdBy: testAdminId,
        branchId: testBranchId,
        companyId: testCompanyId
      });

      const commPayoutRes = await request(app)
        .post('/api/commissions/payout')
        .set(reqHeaders)
        .send({
          payeeType: 'EMPLOYEE',
          payeeId: testAdminId.toString(),
          commissionLedgerIds: [commLedger._id.toString()],
          paymentMethod: 'KHALTI',
          transactionRef: 'KH-554433'
        });

      console.log('Commission Payout Status:', commPayoutRes.status, 'Total Paid:', commPayoutRes.body.data ? commPayoutRes.body.data.totalPaid : commPayoutRes.body);
      if (commPayoutRes.status !== 201) throw new Error('Test 6 Failed: Commission payout');

      // 7. Departure Profitability Report
      console.log('\n--- TEST 7: Departure Profitability Report ---');
      const profRes = await request(app)
        .get(`/api/finance-reports/departures/${departure._id}/profitability`)
        .set(reqHeaders);

      console.log('Profitability Report Data:');
      console.dir(profRes.body.data, { depth: null });

      const f = profRes.body.data.financials;
      // Revenue = 300,000
      // Supplier Costs = 80,000 + 40,000 + 30,000 = 150,000
      // Gross Profit = 150,000 (50% margin)
      if (f.totalRevenue !== 300000 || f.totalSupplierCost !== 150000 || f.grossProfit !== 150000 || f.profitMarginPercent !== 50) {
        throw new Error('Test 7 Failed: Profitability math mismatch');
      }

      // 8. Financial Summary Dashboard Report
      console.log('\n--- TEST 8: Financial Summary Dashboard Report ---');
      const summaryRes = await request(app)
        .get('/api/finance-reports/summary')
        .set(reqHeaders);

      console.log('Financial Summary Data:', summaryRes.body.data);
      if (summaryRes.status !== 200 || !summaryRes.body.data) {
        throw new Error('Test 8 Failed: Financial summary report');
      }

      console.log('\n==================================================');
      console.log('ALL MODULE 4 TESTS PASSED SUCCESSFULLY! 🎉');
      console.log('==================================================\n');
    });
  } finally {
    await teardown();
  }
}

runModule4Tests().catch(err => {
  console.error('Module 4 Test Suite Failed:', err);
  process.exit(1);
});
