process.env.NODE_ENV = process.env.NODE_ENV || 'test';
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const app = require('./app');
const { User, Employee } = require('./models/UserEmployee');
const { hashPassword } = require('./utils/auth');
const { requestContext } = require('./utils/context');

let replSet;
const branchId = new mongoose.Types.ObjectId();
const companyId = new mongoose.Types.ObjectId();

async function setupDb() {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  await mongoose.connect(uri);
  console.log('Role Auth Test DB connected.');
}

async function teardownDb() {
  await mongoose.disconnect();
  await replSet.stop();
}

async function runTests() {
  await setupDb();

  console.log('--- TEST 1: Create Admin & Agent Users ---');
  let adminEmployee, agentEmployee;

  await requestContext.run({
    branchId: branchId.toString(),
    companyId: companyId.toString(),
    currentUserRole: 'ADMIN'
  }, async () => {
    const adminPasswordHash = hashPassword('AdminPass123!');
    const adminUser = await User.create({
      email: 'admin@diplon.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      branchId,
      companyId,
      isActive: true
    });
    adminEmployee = await Employee.create({
      userId: adminUser._id,
      branchId,
      companyId,
      designation: 'Managing Director'
    });

    const agentPasswordHash = hashPassword('AgentPass123!');
    const agentUser = await User.create({
      email: 'agent@diplon.com',
      passwordHash: agentPasswordHash,
      role: 'AGENT',
      branchId,
      companyId,
      isActive: true
    });
    agentEmployee = await Employee.create({
      userId: agentUser._id,
      branchId,
      companyId,
      designation: 'Sales Agent',
      salesTarget: 100000,
      commissionRate: 5
    });
  });

  // Login Admin
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@diplon.com',
      password: 'AdminPass123!'
    });

  if (loginRes.status !== 200 || !loginRes.body.data.token) {
    throw new Error(`TEST 1 FAILED: Login failed. Status: ${loginRes.status}, Body: ${JSON.stringify(loginRes.body)}`);
  }
  const adminToken = loginRes.body.data.token;
  console.log('✅ TEST 1 PASSED: Admin user created & token issued upon login');

  console.log('--- TEST 2: Reject Invalid Credentials (401) ---');
  const invalidLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@diplon.com',
      password: 'WrongPassword'
    });

  if (invalidLoginRes.status === 401 && invalidLoginRes.body.error.code === 'UNAUTHORIZED') {
    console.log('✅ TEST 2 PASSED: Invalid login rejected with 401 UNAUTHORIZED');
  } else {
    throw new Error(`TEST 2 FAILED: Expected 401 UNAUTHORIZED, got ${invalidLoginRes.status}`);
  }

  console.log('--- TEST 3: Login Agent & Verify /api/auth/me Endpoint ---');
  const agentLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'agent@diplon.com',
      password: 'AgentPass123!'
    });
  const agentToken = agentLoginRes.body.data.token;

  const meRes = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${agentToken}`);

  if (meRes.status === 200 && meRes.body.data.user.role === 'AGENT') {
    console.log('✅ TEST 3 PASSED: Bearer token authenticated /api/auth/me request');
  } else {
    throw new Error(`TEST 3 FAILED: Expected 200 and role AGENT, got status ${meRes.status}`);
  }

  console.log('--- TEST 4: Register User Endpoint (Admin Restricted) ---');
  const regRes = await request(app)
    .post('/api/auth/register')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      email: 'finance@diplon.com',
      password: 'FinancePass123!',
      role: 'FINANCE',
      branchId: branchId.toString(),
      companyId: companyId.toString(),
      designation: 'Accountant'
    });

  if (regRes.status === 201 && regRes.body.data.user.role === 'FINANCE') {
    console.log('✅ TEST 4 PASSED: Admin successfully registered new FINANCE user');
  } else {
    throw new Error(`TEST 4 FAILED: Expected 201, got ${regRes.status}: ${JSON.stringify(regRes.body)}`);
  }

  console.log('--- TEST 5: Non-Admin User Blocked from User Registration (403) ---');
  const regBlockedRes = await request(app)
    .post('/api/auth/register')
    .set('Authorization', `Bearer ${agentToken}`)
    .send({
      email: 'hacker@diplon.com',
      password: 'HackerPass123!',
      role: 'ADMIN',
      branchId: branchId.toString(),
      companyId: companyId.toString()
    });

  if (regBlockedRes.status === 403 && regBlockedRes.body.error.code === 'FORBIDDEN') {
    console.log('✅ TEST 5 PASSED: Non-admin user blocked from registration (403 FORBIDDEN)');
  } else {
    throw new Error(`TEST 5 FAILED: Expected 403 FORBIDDEN, got ${regBlockedRes.status}`);
  }

  console.log('--- TEST 6: Role Authorization Guard (AGENT blocked from Financial Payouts - 403) ---');
  const payoutBlockedRes = await request(app)
    .post('/api/finance/commissions/payout')
    .set('x-mock-role', 'AGENT')
    .send({
      agentEmployeeId: agentEmployee._id.toString(),
      payoutAmount: 5000,
      paymentMethod: 'BANK_TRANSFER'
    });

  if (payoutBlockedRes.status === 403 && payoutBlockedRes.body.error.code === 'FORBIDDEN') {
    console.log('✅ TEST 6 PASSED: AGENT role blocked from commission payout execution (403 FORBIDDEN)');
  } else {
    throw new Error(`TEST 6 FAILED: Expected 403, got ${payoutBlockedRes.status}`);
  }

  console.log('--- TEST 7: Field-Level Mongoose RBAC Guard (Restricted Fields Mutation) ---');
  let guardTriggered = false;
  try {
    await requestContext.run({
      branchId: branchId.toString(),
      companyId: companyId.toString(),
      employeeId: agentEmployee._id.toString(),
      currentUserRole: 'AGENT'
    }, async () => {
      const emp = await Employee.findById(agentEmployee._id);
      emp.salesTarget = 999999; // Restricted field modification attempt by AGENT
      await emp.save();
    });
  } catch (err) {
    if (err.message.includes('Unauthorized to modify restricted fields')) {
      guardTriggered = true;
    }
  }

  if (guardTriggered) {
    console.log('✅ TEST 7 PASSED: Mongoose restrictFields plugin blocked unauthorized field mutation by AGENT role');
  } else {
    throw new Error('TEST 7 FAILED: Mongoose restrictFields plugin failed to block unauthorized field modification');
  }

  console.log('--- TEST 8: SUPER_ADMIN and SUPER ADMIN Access Control ---');
  const superAdminRegRes = await request(app)
    .post('/api/auth/register')
    .set('x-mock-role', 'SUPER_ADMIN')
    .send({
      email: 'agency_user@diplon.com',
      password: 'AgencyPass123!',
      role: 'AGENCY',
      branchId: branchId.toString(),
      companyId: companyId.toString(),
      designation: 'External Agency Partner'
    });

  if (superAdminRegRes.status === 201 && superAdminRegRes.body.data.user.role === 'AGENCY') {
    console.log('✅ TEST 8 PASSED: SUPER_ADMIN granted full administrative access');
  } else {
    throw new Error(`TEST 8 FAILED: Expected 201, got ${superAdminRegRes.status}`);
  }

  console.log('--- TEST 9: AGENCY and DRIVER Role Permission Boundaries ---');
  // AGENCY role blocked from creating tour packages
  const agencyPackageRes = await request(app)
    .post('/api/packages')
    .set('x-mock-role', 'AGENCY')
    .send({
      name: 'Unauthorized Agency Package',
      durationDays: 3,
      basePricing: 50000
    });

  if (agencyPackageRes.status === 403) {
    console.log('✅ TEST 9a PASSED: AGENCY role blocked from package creation (403 FORBIDDEN)');
  } else {
    throw new Error(`TEST 9a FAILED: Expected 403, got ${agencyPackageRes.status}`);
  }

  // DRIVER role blocked from creating financial payouts
  const driverPayoutRes = await request(app)
    .post('/api/finance/commissions/payout')
    .set('x-mock-role', 'DRIVER')
    .send({
      agentEmployeeId: agentEmployee._id.toString(),
      payoutAmount: 10000
    });

  if (driverPayoutRes.status === 403) {
    console.log('✅ TEST 9b PASSED: DRIVER role blocked from commission payouts (403 FORBIDDEN)');
  } else {
    throw new Error(`TEST 9b FAILED: Expected 403, got ${driverPayoutRes.status}`);
  }

  console.log('--- TEST 10: Unauthenticated Requests (No Auth Header, No Mock Header) Rejected (401) Outside Test ---');
  const prevEnv10 = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'production';
    // 10a: /api/auth/me
    const unauthMeRes = await request(app).get('/api/auth/me');
    if (unauthMeRes.status !== 401 || unauthMeRes.body.error?.code !== 'UNAUTHORIZED') {
      throw new Error(`TEST 10a FAILED: Expected 401 UNAUTHORIZED on /api/auth/me, got ${unauthMeRes.status}`);
    }

    // 10b: /api/packages (POST)
    const unauthPkgRes = await request(app).post('/api/packages').send({ name: 'Hack Package', basePricing: 100 });
    if (unauthPkgRes.status !== 401 || unauthPkgRes.body.error?.code !== 'UNAUTHORIZED') {
      throw new Error(`TEST 10b FAILED: Expected 401 UNAUTHORIZED on /api/packages, got ${unauthPkgRes.status}`);
    }

    // 10c: /api/leads (GET and POST)
    const unauthLeadGetRes = await request(app).get('/api/leads');
    if (unauthLeadGetRes.status !== 401 || unauthLeadGetRes.body.error?.code !== 'UNAUTHORIZED') {
      throw new Error(`TEST 10c FAILED: Expected 401 UNAUTHORIZED on /api/leads, got ${unauthLeadGetRes.status}`);
    }

    // 10d: /api/finance/commissions/payout
    const unauthPayoutRes = await request(app).post('/api/finance/commissions/payout').send({ payoutAmount: 5000 });
    if (unauthPayoutRes.status !== 401 || unauthPayoutRes.body.error?.code !== 'UNAUTHORIZED') {
      throw new Error(`TEST 10d FAILED: Expected 401 UNAUTHORIZED on finance payout, got ${unauthPayoutRes.status}`);
    }

    // 10e: /api/operations/dashboard
    const unauthOpsRes = await request(app).get('/api/operations/dashboard');
    if (unauthOpsRes.status !== 401 || unauthOpsRes.body.error?.code !== 'UNAUTHORIZED') {
      throw new Error(`TEST 10e FAILED: Expected 401 UNAUTHORIZED on operations dashboard, got ${unauthOpsRes.status}`);
    }
  } finally {
    process.env.NODE_ENV = prevEnv10;
  }
  console.log('✅ TEST 10 PASSED: All unauthenticated requests rejected with 401 UNAUTHORIZED');

  console.log('--- TEST 11: Invalid / Expired Bearer Token Rejected (401) ---');
  const invalidTokenRes = await request(app)
    .get('/api/auth/me')
    .set('Authorization', 'Bearer invalid.token.payload');
  if (invalidTokenRes.status === 401 && invalidTokenRes.body.error?.code === 'UNAUTHORIZED') {
    console.log('✅ TEST 11 PASSED: Malformed/Invalid token rejected with 401 UNAUTHORIZED');
  } else {
    throw new Error(`TEST 11 FAILED: Expected 401 UNAUTHORIZED, got ${invalidTokenRes.status}`);
  }

  console.log('--- TEST 12: Production Mode Disallows Mock Headers ---');
  const prevEnv = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'production';
    const prodMockRes = await request(app)
      .get('/api/operations/dashboard')
      .set('x-mock-role', 'SUPER_ADMIN');
    if (prodMockRes.status === 401 && prodMockRes.body.error?.code === 'UNAUTHORIZED') {
      console.log('✅ TEST 12 PASSED: Mock headers ignored and rejected with 401 in production mode');
    } else {
      throw new Error(`TEST 12 FAILED: Expected 401 in production, got ${prodMockRes.status}`);
    }
  } finally {
    process.env.NODE_ENV = prevEnv;
  }

  console.log('--- TEST 13: JWT_SECRET Required Outside Test Environment ---');
  const savedNodeEnv = process.env.NODE_ENV;
  const savedJwtSecret = process.env.JWT_SECRET;
  try {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;
    delete require.cache[require.resolve('./utils/auth')];
    let threw = false;
    try {
      require('./utils/auth');
    } catch (e) {
      threw = true;
    }
    if (threw) {
      console.log('✅ TEST 13a PASSED: Loading utils/auth without JWT_SECRET in production throws error');
    } else {
      throw new Error('TEST 13a FAILED: Expected error when loading auth utils without JWT_SECRET in production');
    }
  } finally {
    process.env.NODE_ENV = savedNodeEnv;
    if (savedJwtSecret) process.env.JWT_SECRET = savedJwtSecret;
    delete require.cache[require.resolve('./utils/auth')];
    require('./utils/auth');
  }

  // TEST 13b: ENCRYPTION_KEY Required Outside Test Environment
  const savedEncKey = process.env.ENCRYPTION_KEY;
  try {
    process.env.NODE_ENV = 'production';
    delete process.env.ENCRYPTION_KEY;
    delete require.cache[require.resolve('./models/CustomerTraveler')];
    let threw = false;
    try {
      require('./models/CustomerTraveler');
    } catch (e) {
      threw = true;
    }
    if (threw) {
      console.log('✅ TEST 13b PASSED: Loading CustomerTraveler without ENCRYPTION_KEY in production throws error');
    } else {
      throw new Error('TEST 13b FAILED: Expected error when loading CustomerTraveler without ENCRYPTION_KEY in production');
    }
  } finally {
    process.env.NODE_ENV = savedNodeEnv;
    if (savedEncKey) process.env.ENCRYPTION_KEY = savedEncKey;
    delete require.cache[require.resolve('./models/CustomerTraveler')];
    require('./models/CustomerTraveler');
  }

  console.log('--- TEST 14: CORS Allowlist Enforcement ---');
  const allowedCorsRes = await request(app)
    .get('/api/health')
    .set('Origin', 'http://localhost:5173');
  if (allowedCorsRes.status === 200) {
    console.log('✅ TEST 14a PASSED: Allowed CORS origin accepted (200 OK)');
  } else {
    throw new Error(`TEST 14a FAILED: Expected 200, got ${allowedCorsRes.status}`);
  }

  const disallowedCorsRes = await request(app)
    .get('/api/health')
    .set('Origin', 'http://malicious-site.com');
  if (disallowedCorsRes.status === 403 && disallowedCorsRes.body.error?.code === 'FORBIDDEN') {
    console.log('✅ TEST 14b PASSED: Disallowed CORS origin blocked (403 FORBIDDEN)');
  } else {
    throw new Error(`TEST 14b FAILED: Expected 403 FORBIDDEN, got status ${disallowedCorsRes.status}`);
  }

  console.log('\n🎉 ALL ROLE-BASED AUTHENTICATION & ACCESS CONTROL TESTS PASSED SUCCESSFULLY!');
}

if (require.main === module) {
  runTests().then(teardownDb).catch(err => {
    console.error(err);
    teardownDb();
    process.exit(1);
  });
}
