const mongoose = require('mongoose');
require('dotenv').config();

async function clearData() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/diplon-crm?replicaSet=rs0';
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);

  const db = mongoose.connection.db;

  const collectionsToClear = [
    'customertravelers',
    'bookingtravelers',
    'driverprofiles',
    'guideprofiles',
    'ledgers',
    'commissionpayouts',
    'staffvehicleledgers',
    'supplierpayables',
    'receiptcreditdebits',
    'pipelines',
    'paymentinvoices',
    'operationalexpenses',
    'operationsnotes',
    'auditreminders'
  ];

  console.log('Clearing customer, booking, driver, and operational seed data...');

  for (const collName of collectionsToClear) {
    try {
      const collections = await db.listCollections({ name: collName }).toArray();
      if (collections.length > 0) {
        await db.collection(collName).deleteMany({});
        console.log(`Cleared collection: ${collName}`);
      }
    } catch (err) {
      console.warn(`Could not clear collection ${collName}:`, err.message);
    }
  }

  console.log('Seed customer, booking, and driver data cleared successfully!');
  await mongoose.disconnect();
}

clearData().catch(console.error);
