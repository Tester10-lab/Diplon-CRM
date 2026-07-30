const { execSync } = require('child_process');

function runTest(testFile) {
  console.log(`\n==================================================`);
  console.log(`RUNNING: ${testFile}`);
  console.log(`==================================================`);
  try {
    execSync(`node ${testFile}`, { stdio: 'inherit' });
    console.log(`✅ ${testFile} PASSED`);
  } catch (err) {
    console.error(`❌ ${testFile} FAILED`);
    process.exit(1);
  }
}

console.log('STARTING ALL SUITES TEST RUNNER...');
runTest('test-tenant-isolation.js');
runTest('test-module2.js');
runTest('test-module3.js');
runTest('test-module4.js');
runTest('test-erp-hubs.js');
runTest('test-role-auth.js');
runTest('test-module5.js');
console.log('\n🎉 ALL PROJECT TEST SUITES PASSED SUCCESSFULLY!');
