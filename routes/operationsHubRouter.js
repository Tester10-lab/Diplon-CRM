const express = require('express');
const router = express.Router();
const departureController = require('../controllers/departureController');
const resourceController = require('../controllers/resourceController');
const assignmentController = require('../controllers/assignmentController');
const operationsController = require('../controllers/operationsController');
const expenseVehicleController = require('../controllers/expenseVehicleController');
const financeReportController = require('../controllers/financeReportController');
const fleetController = require('../controllers/fleetController');
const driverController = require('../controllers/driverController');
const guideController = require('../controllers/guideController');
const dispatchController = require('../controllers/dispatchController');
const operationsDashboardController = require('../controllers/operationsDashboardController');
const timelineController = require('../controllers/timelineController');

const { requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const {
  staffLedgerCreateSchema,
  vehicleCostCreateSchema
} = require('../schemas/financialRefinementsSchemas');

// 1. Dashboard
router.get('/dashboard', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS', 'FINANCE']), operationsDashboardController.getDashboardSummary);

// 2. Departures
router.post('/departures', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS']), departureController.createDeparture);
router.get('/departures', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS', 'AGENT', 'FINANCE']), departureController.listDepartures);
router.get('/departures/:id', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS', 'AGENT', 'FINANCE']), departureController.getDeparture);

// 3. Fleet (Vehicles + Vehicle Profiles)
router.get('/fleet', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS', 'FINANCE']), fleetController.listVehicles);
router.post('/fleet', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS']), fleetController.createVehicle);
router.get('/fleet/:id', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS', 'FINANCE']), fleetController.getVehicle);
router.put('/fleet/:id', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS']), fleetController.updateVehicle);

// 4. Drivers (Drivers + Driver Profiles)
router.get('/drivers', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS', 'FINANCE']), driverController.listDrivers);
router.post('/drivers', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS']), driverController.createDriver);
router.get('/drivers/:id', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS', 'FINANCE']), driverController.getDriver);
router.put('/drivers/:id', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS']), driverController.updateDriver);

// 5. Guides (Guides + Guide Profiles)
router.get('/guides', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS', 'FINANCE']), guideController.listGuides);
router.post('/guides', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS']), guideController.createGuide);
router.get('/guides/:id', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS', 'FINANCE']), guideController.getGuide);
router.put('/guides/:id', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS']), guideController.updateGuide);

// 6. Dispatch Engine
router.post('/dispatch/:departureInstanceId/assign', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS']), dispatchController.assignDispatch);

// 7. Manifests & Boarding Scanner
router.get('/manifests/:departureInstanceId', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS', 'AGENT', 'FINANCE']), operationsController.getManifest);
router.post('/manifests/:departureInstanceId/board/:travelerId', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS']), operationsController.boardTraveler);

// 8. Timeline & Operations Notes
router.get('/timeline/:departureInstanceId', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS', 'FINANCE']), timelineController.getTimeline);
router.post('/timeline/:departureInstanceId/notes', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS']), timelineController.createNote);

// 9. Legacy Resources & Assignments
router.post('/resources', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS']), resourceController.createResource);
router.get('/resources', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS', 'FINANCE']), resourceController.listResources);
router.post('/assignments', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS']), assignmentController.createAssignment);

// 10. Staff & Driver Ledger
router.post('/staff-driver-ledger', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS', 'FINANCE']), validate(staffLedgerCreateSchema), expenseVehicleController.createStaffLedger);
router.get('/staff-driver-ledger', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS', 'FINANCE']), expenseVehicleController.getStaffLedgers);

// 11. Vehicle Costs & Profitability
router.post('/vehicle-costs', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS']), validate(vehicleCostCreateSchema), expenseVehicleController.createVehicleCost);
router.get('/vehicle-costs', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS', 'FINANCE']), expenseVehicleController.getVehicleCosts);
router.get('/vehicle-costs/vehicles/:resourceId/profitability', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS', 'FINANCE']), expenseVehicleController.getVehicleProfitabilityReport);

// 12. Operations Tour Financial Summary
router.get('/tours/:departureInstanceId/financial-summary', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS', 'FINANCE']), financeReportController.getTourSummary);

module.exports = router;
