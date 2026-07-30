const express = require('express');
const { requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { updateQuotationSchema, acceptRejectQuotationSchema } = require('../schemas/crmSchemas');
const quotationController = require('../controllers/quotationController');

const router = express.Router();


router.get('/', quotationController.listQuotations);
router.get('/:id', quotationController.getQuotation);
router.put('/:id', validate(updateQuotationSchema), quotationController.updateQuotation);

// Accept and Reject require MANAGER+
router.post('/:id/accept', requireRole(['ADMIN', 'MANAGER']), validate(acceptRejectQuotationSchema), quotationController.acceptQuotation);
router.post('/:id/reject', requireRole(['ADMIN', 'MANAGER']), validate(acceptRejectQuotationSchema), quotationController.rejectQuotation);

module.exports = router;

