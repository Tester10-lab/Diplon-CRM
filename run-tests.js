const { MongoMemoryReplSet } = require('mongodb-memory-server');
const { execSync } = require('child_process');

async function run() {
  console.log('Spinning up in-memory MongoDB Replica Set for testing...');
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  
  console.log(`Replica set started at ${uri}`);
  console.log('--------------------------------------------------');
  
  try {
    console.log('Running seed.js...');
    execSync('node seed.js', { 
      env: { ...process.env, MONGODB_URI: uri }, 
      stdio: 'inherit' 
    });

    console.log('\n--------------------------------------------------');
    console.log('Running test-booking.js (Concurrency Test)...');
    execSync('node test-booking.js', { 
      env: { ...process.env, MONGODB_URI: uri }, 
      stdio: 'inherit' 
    });
  } catch (error) {
    console.error('Test execution failed.');
  } finally {
    console.log('\n--------------------------------------------------');
    console.log('Stopping in-memory Replica Set...');
    await replSet.stop();
  }
}

run();
