const mongoose = require('mongoose');
require('dotenv').config();

const { Company, Branch } = require('./models/Tenant');
const { User, Employee } = require('./models/UserEmployee');
const { Package, DepartureInstance } = require('./models/Product');
const { withContext } = require('./utils/context');

async function seed() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PROD_SEED !== 'true') {
    console.error('⛔ ERROR: seed.js drops the entire database and is blocked in production mode.');
    console.error('To bootstrap an initial admin account safely without wiping data, run: node bootstrap-admin.js');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/diplon-crm?replicaSet=rs0';
  await mongoose.connect(uri);

  // Check replica set status
  try {
    const status = await mongoose.connection.db.admin().command({ replSetGetStatus: 1 });
    console.log(`Connected to replica set: ${status.set}`);
  } catch (err) {
    console.error('FATAL ERROR: Not connected to a replica set. Exiting.');
    process.exit(1);
  }

  // Clear existing data for a clean seed
  await mongoose.connection.db.dropDatabase();

  const company = await Company.create({ name: 'Diplon Travel' });
  const branch = await Branch.create({ companyId: company._id, name: 'HQ' });

  // Use withContext so scoping plugins and RBAC work during seeding
  await withContext({ branchId: branch._id, companyId: company._id, currentUserRole: 'ADMIN' }, async () => {
    const { hashPassword } = require('./utils/auth');
    const user = await User.create({
      email: 'admin@diplon.com',
      passwordHash: hashPassword('Admin@2026!'),
      role: 'ADMIN',
      branchId: branch._id,
      companyId: company._id
    });

    const employee = await Employee.create({
      userId: user._id,
      branchId: branch._id,
      companyId: company._id,
      designation: 'General Manager',
      salesTarget: 100000,
      commissionRate: 0.05
    });

    const pkg = await Package.create({
      name: 'Everest Base Camp Trek',
      itinerary: '14 Days...',
      basePricing: 1500,
      branchId: branch._id,
      companyId: company._id
    });

    const departure = await DepartureInstance.create({
      packageId: pkg._id,
      seatsTotal: 10,
      seatsAvailable: 10,
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      branchId: branch._id,
      companyId: company._id
    });

    console.log('Database seeded successfully!');
    console.log(`Company ID: ${company._id}`);
    console.log(`Branch ID: ${branch._id}`);
    console.log(`User ID: ${user._id}`);
    console.log(`Employee ID: ${employee._id}`);
    console.log(`Departure ID: ${departure._id}`);
  });

  await mongoose.disconnect();
}

seed().catch(console.error);
