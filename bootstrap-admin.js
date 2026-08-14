require('dotenv').config();
const mongoose = require('mongoose');
const { Company, Branch } = require('./models/Tenant');
const { User, Employee } = require('./models/UserEmployee');
const { hashPassword } = require('./utils/auth');
const { withContext } = require('./utils/context');

async function bootstrapAdmin() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/diplon-crm?replicaSet=rs0';
  console.log('Connecting to database...');
  await mongoose.connect(uri);

  const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || process.argv[2] || 'admin@diplon.com').toLowerCase().trim();
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || process.argv[3] || 'DiplonAdmin@2026!';
  const companyName = process.env.INITIAL_COMPANY_NAME || 'Diplon Travel HQ';
  const branchName = process.env.INITIAL_BRANCH_NAME || 'Main Branch';

  // 1. Ensure Tenant (Company and Branch) exists
  let company = await Company.findOne().setOptions({ skipScoping: true });
  if (!company) {
    company = await Company.create({ name: companyName });
    console.log(`✅ Created initial Company: "${company.name}" (ID: ${company._id})`);
  } else {
    console.log(`ℹ️ Using existing Company: "${company.name}" (ID: ${company._id})`);
  }

  let branch = await Branch.findOne({ companyId: company._id }).setOptions({ skipScoping: true });
  if (!branch) {
    branch = await Branch.create({ companyId: company._id, name: branchName });
    console.log(`✅ Created initial Branch: "${branch.name}" (ID: ${branch._id})`);
  } else {
    console.log(`ℹ️ Using existing Branch: "${branch.name}" (ID: ${branch._id})`);
  }

  // 2. Check if a SUPER_ADMIN already exists in the system
  const existingSuperAdmin = await User.findOne({ role: 'SUPER_ADMIN' }).setOptions({ skipScoping: true });
  if (existingSuperAdmin) {
    console.log(`ℹ️ A SUPER_ADMIN account already exists in this database: "${existingSuperAdmin.email}" (ID: ${existingSuperAdmin._id}).`);
    console.log('No action taken. Bootstrap aborted safely to prevent duplicate administrators.');
    await mongoose.disconnect();
    return;
  }

  // Check if target email exists under any other role
  const existingUser = await User.findOne({ email: adminEmail }).setOptions({ skipScoping: true });
  if (existingUser) {
    console.log(`⚠️ User with email "${adminEmail}" already exists (Role: ${existingUser.role}, ID: ${existingUser._id}).`);
    console.log('No action taken. Bootstrap aborted safely.');
    await mongoose.disconnect();
    return;
  }

  await withContext({ branchId: branch._id, companyId: company._id, currentUserRole: 'SUPER_ADMIN' }, async () => {
    const passwordHash = hashPassword(adminPassword);
    const user = await User.create({
      email: adminEmail,
      passwordHash,
      role: 'SUPER_ADMIN',
      branchId: branch._id,
      companyId: company._id,
      isActive: true
    });

    const employee = await Employee.create({
      userId: user._id,
      branchId: branch._id,
      companyId: company._id,
      designation: 'Principal Super Admin',
      salesTarget: 0,
      commissionRate: 0
    });

    console.log('\n==================================================');
    console.log('🎉 INITIAL SUPER_ADMIN CREATED SUCCESSFULLY!');
    console.log('==================================================');
    console.log(`Email:       ${user.email}`);
    console.log(`Role:        ${user.role}`);
    console.log(`User ID:     ${user._id}`);
    console.log(`Employee ID: ${employee._id}`);
    console.log(`Company ID:  ${company._id}`);
    console.log(`Branch ID:   ${branch._id}`);
    console.log('==================================================\n');
  });

  await mongoose.disconnect();
}

bootstrapAdmin().catch(err => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
