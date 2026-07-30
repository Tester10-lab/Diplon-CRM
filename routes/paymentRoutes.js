const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { paymentCreateSchema } = require('../schemas/module4Schemas');

router.post('/', requireRole(['ADMIN', 'MANAGER', 'FINANCE', 'AGENT']), validate(paymentCreateSchema), paymentController.createPayment);
router.get('/booking/:bookingId', requireRole(['ADMIN', 'MANAGER', 'FINANCE', 'AGENT']), paymentController.getPaymentsByBooking);

module.exports = router;
