const express = require('express');
const router = express.Router();
const bookingTravelerController = require('../controllers/bookingTravelerController');
const { requireRole } = require('../middlewares/auth');


router.post('/', requireRole(['ADMIN', 'MANAGER', 'AGENT', 'OPERATIONS']), bookingTravelerController.addTraveler);
router.delete('/:id', requireRole(['ADMIN', 'MANAGER', 'AGENT', 'OPERATIONS']), bookingTravelerController.removeTraveler);

module.exports = router;

