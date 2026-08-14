const express = require('express');
const { requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createDepartureSchema, updateDepartureStatusSchema, updateDepartureCapacitySchema } = require('../schemas/module2Schemas');
const departureController = require('../controllers/departureController');

const router = express.Router();

// View Departure instances (ADMIN, MANAGER, AGENT, OPERATIONS, FINANCE)
router.get('/', requireRole(['ADMIN', 'MANAGER', 'AGENT', 'OPERATIONS', 'FINANCE']), departureController.listDepartures);

// Create/edit Departure (ADMIN, MANAGER, OPERATIONS)
// AGENT cannot create or edit departures
router.post('/', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS']), validate(createDepartureSchema), departureController.createDeparture);
router.put('/:id/status', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS']), validate(updateDepartureStatusSchema), departureController.updateStatus);
router.put('/:id/capacity', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS']), validate(updateDepartureCapacitySchema), departureController.adjustCapacity);

module.exports = router;

