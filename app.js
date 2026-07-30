const express = require('express');
const cors = require('cors');
require('express-async-errors'); // Automatically patches express to handle async errors

const errorHandler = require('./middlewares/errorHandler');

// Domain Hub Routers
const financialHubRouter = require('./routes/financialHubRouter');
const operationsHubRouter = require('./routes/operationsHubRouter');
const documentsHubRouter = require('./routes/documentsHubRouter');

// Core Domain Routers
const activityRoutes = require('./routes/activityRoutes');
const packageRoutes = require('./routes/packageRoutes');
const departureRoutes = require('./routes/departureRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const leadRoutes = require('./routes/leadRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const bookingTravelerRoutes = require('./routes/bookingTravelerRoutes');
const operationsRoutes = require('./routes/operationsRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const supplierPayableRoutes = require('./routes/supplierPayableRoutes');
const commissionPayoutRoutes = require('./routes/commissionPayoutRoutes');
const financeReportRoutes = require('./routes/financeReportRoutes');

const authRoutes = require('./routes/authRoutes');

const app = express();

const { authenticate } = require('./middlewares/auth');
const { requestContext } = require('./utils/context');

// Global Middlewares
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow during initial setup
    }
  },
  credentials: true
}));

app.use(express.json());

// Health Check Endpoint for Cloud Hosts (Render, AWS, Railway, DigitalOcean)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Diplon Travel ERP API'
  });
});

app.use(authenticate);
app.use((req, res, next) => {
  if (!req.user) {
    return next();
  }
  requestContext.run({
    branchId: req.user.branchId,
    companyId: req.user.companyId,
    employeeId: req.user.employeeId,
    currentUserId: req.user.employeeId,
    currentUserRole: req.user.role,
    partnerId: req.user.partnerId
  }, next);
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Domain Hub Mounts (Central ERP Architecture)
app.use('/api/finance', financialHubRouter);
app.use('/api/operations', operationsHubRouter);
app.use('/api/documents', documentsHubRouter);

// Core CRM & Pipeline Routes
app.use('/api/activities', activityRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/booking-travelers', bookingTravelerRoutes);

// Legacy Route Aliases for backwards compatibility
app.use('/api/departures', departureRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/supplier-payables', supplierPayableRoutes);
app.use('/api/commissions', commissionPayoutRoutes);
app.use('/api/finance-reports', financeReportRoutes);

// Serve Frontend Static Assets in Production
const path = require('path');
const fs = require('fs');
const clientDistPath = path.join(__dirname, 'client', 'dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

module.exports = app;
