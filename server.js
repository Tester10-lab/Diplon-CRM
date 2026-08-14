require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL;

// Root health check endpoint for cloud platforms (Render, Vercel, Railway)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Diplon Travel ERP API',
    mode: process.env.NODE_ENV,
    message: 'Backend web service is online and healthy.',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting/offline',
    timestamp: new Date().toISOString()
  });
});

// Start Express server immediately so Render port binding and health checks pass
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Diplon Backend API listening on port ${PORT}`);
  console.log(`🌍 Environment: Running in ${process.env.NODE_ENV} mode`);
});

// Connect to MongoDB asynchronously in background without killing process on failure
if (MONGODB_URI) {
  console.log(`Connecting to MongoDB Atlas database...`);
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 15000
  })
  .then(() => {
    console.log('✅ Connected successfully to MongoDB Database');
  })
  .catch(err => {
    console.warn('⚠️ Warning: MongoDB connection error:', err.message);
    console.warn('Backend API remains online. Please verify your MONGODB_URI connection string and IP whitelist in MongoDB Atlas.');
  });
} else {
  console.warn('⚠️ MONGODB_URI environment variable is not defined on Render.');
  console.warn('Add MONGODB_URI in Render dashboard: Service -> Environment -> MONGODB_URI');
}
