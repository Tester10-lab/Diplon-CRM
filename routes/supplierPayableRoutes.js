const express = require('express');
const router = express.Router();
const supplierPayableController = require('../controllers/supplierPayableController');
const { requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { supplierPayableCreateSchema, supplierPaymentExecuteSchema } = require('../schemas/module4Schemas');

router.post('/', requireRole(['ADMIN', 'MANAGER', 'FINANCE', 'OPERATIONS']), validate(supplierPayableCreateSchema), supplierPayableController.createPayable);
router.post('/:id/pay', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), validate(supplierPaymentExecuteSchema), supplierPayableController.payPayable);
router.get('/', requireRole(['ADMIN', 'MANAGER', 'FINANCE', 'OPERATIONS']), supplierPayableController.getPayables);

module.exports = router;
