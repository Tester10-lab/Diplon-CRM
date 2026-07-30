const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { requireRole } = require('../middlewares/auth');

router.get('/invoices/:id', requireRole(['ADMIN', 'MANAGER', 'FINANCE', 'AGENT']), documentController.getInvoiceDocument);
router.get('/receipts/:id', requireRole(['ADMIN', 'MANAGER', 'FINANCE', 'AGENT']), documentController.getReceiptDocument);
router.get('/manifests/:departureInstanceId', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS', 'AGENT']), documentController.getManifestDocument);
router.get('/vouchers/:bookingId', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS', 'AGENT']), documentController.getVoucherDocument);

module.exports = router;
