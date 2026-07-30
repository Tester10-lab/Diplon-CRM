require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/diplon-crm?replicaSet=rs0';

async function startServer() {
  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`✅ Backend Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
