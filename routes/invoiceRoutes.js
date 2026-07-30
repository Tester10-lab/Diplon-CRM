const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { invoiceCreateSchema } = require('../schemas/module4Schemas');

router.post('/', requireRole(['ADMIN', 'MANAGER', 'FINANCE', 'AGENT']), validate(invoiceCreateSchema), invoiceController.createInvoice);
router.get('/:id', requireRole(['ADMIN', 'MANAGER', 'FINANCE', 'AGENT']), invoiceController.getInvoiceById);
router.get('/booking/:bookingId', requireRole(['ADMIN', 'MANAGER', 'FINANCE', 'AGENT']), invoiceController.getInvoiceByBooking);

module.exports = router;
