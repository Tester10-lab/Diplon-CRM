const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { requireRole } = require('../middlewares/auth');


router.post('/', requireRole(['ADMIN', 'MANAGER', 'AGENT']), bookingController.createBooking);
router.get('/', requireRole(['ADMIN', 'MANAGER', 'AGENT', 'OPERATIONS']), bookingController.listBookings);
router.get('/:id', requireRole(['ADMIN', 'MANAGER', 'AGENT', 'OPERATIONS']), bookingController.getBooking);

// Cancel must be MANAGER+
router.put('/:id/cancel', requireRole(['ADMIN', 'MANAGER']), bookingController.cancelBooking);

// Promote waitlist
router.put('/:id/promote', requireRole(['ADMIN', 'MANAGER', 'AGENT']), bookingController.promoteWaitlist);

module.exports = router;

