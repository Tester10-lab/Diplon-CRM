process.env.NODE_ENV = process.env.NODE_ENV || 'test';
const mongoose = require('mongoose');
require('dotenv').config();

const { Company, Branch } = require('./models/Tenant');
const { DepartureInstance, Package } = require('./models/Product');
const { Customer, Traveler } = require('./models/CustomerTraveler');
const { User } = require('./models/UserEmployee');
const { createBookingWithTransaction } = require('./services/transaction');
const { withContext } = require('./utils/context');

async function testConcurrency() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/diplon-crm?replicaSet=rs0';
  await mongoose.connect(uri);

  try {
    const status = await mongoose.connection.db.admin().command({ replSetGetStatus: 1 });
    console.log(`Connected to replica set: ${status.set}`);
  } catch (err) {
    console.error('FATAL ERROR: Not connected to a replica set. Transactions will not work.');
    process.exit(1);
  }

  // Get first branch and company from db
  const branch = await Branch.findOne();
  const company = await Company.findOne();
  const user = await User.findOne();
  
  if (!branch || !company || !user) {
    console.error('Please run seed.js first');
    process.exit(1);
  }

  await withContext({ branchId: branch._id, companyId: company._id, currentUserId: user._id, currentUserRole: 'ADMIN' }, async () => {
    // 1. Setup Data for Test
    const pkg = await Package.findOne();
    const customer = await Customer.create({
      firstName: 'Test',
      lastName: 'Customer',
      branchId: branch._id,
      companyId: company._id
    });
    const traveler = await Traveler.create({
      name: 'Test Traveler',
      dob: new Date('1990-01-01'),
      branchId: branch._id,
      companyId: company._id
    });

    // Create a new DepartureInstance with ONLY 1 seat available
    const departure = await DepartureInstance.create({
      packageId: pkg._id,
      seatsTotal: 1,
      seatsAvailable: 1, // Only 1 seat
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      branchId: branch._id,
      companyId: company._id
    });

    console.log(`Starting concurrency test... DepartureInstance ${departure._id} has 1 seat available.`);

    // 2. Fire N simultaneous requests
    const NUM_REQUESTS = 5;
    const promises = [];

    for (let i = 0; i < NUM_REQUESTS; i++) {
      const bookingData = {
        customerId: customer._id,
        packageId: pkg._id,
        departureInstanceId: departure._id
      };
      
      const p = createBookingWithTransaction(bookingData, [traveler._id], 1500)
        .then(res => ({ status: 'fulfilled', result: res }))
        .catch(err => ({ status: 'rejected', reason: err.message }));
      promises.push(p);
    }

    // Wait for all to finish
    const results = await Promise.all(promises);
    
    // 3. Analyze Results
    let successCount = 0;
    let failCount = 0;
    
    results.forEach((res, index) => {
      if (res.status === 'fulfilled') {
        successCount++;
        console.log(`Request ${index + 1}: Success! Booking created with ID ${res.result._id}`);
      } else {
        failCount++;
        console.log(`Request ${index + 1}: Failed with error - ${res.reason}`);
      }
    });

    console.log(`\nConcurrency Test Summary:`);
    console.log(`Expected 1 success, got ${successCount}`);
    console.log(`Expected ${NUM_REQUESTS - 1} failures, got ${failCount}`);
    
    if (successCount === 1) {
      console.log('✅ Concurrency test PASSED. Overselling prevented.');
    } else {
      console.log('❌ Concurrency test FAILED.');
    }

    // Verify seatsAvailable
    const updatedDeparture = await DepartureInstance.findById(departure._id);
    console.log(`Final seats available in DB: ${updatedDeparture.seatsAvailable}`);
    if (updatedDeparture.seatsAvailable === 0) {
       console.log('✅ Final seat count is exactly 0.');
    } else {
       console.log('❌ Final seat count is incorrect.');
    }
  });

  await mongoose.disconnect();
}

testConcurrency().catch(console.error);
