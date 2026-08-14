const express = require('express');
const validate = require('../middlewares/validate');
const { createInquirySchema, updateInquirySchema } = require('../schemas/crmSchemas');
const inquiryController = require('../controllers/inquiryController');
const { requireRole } = require('../middlewares/auth');

const router = express.Router();

router.post('/', requireRole(['ADMIN', 'MANAGER', 'AGENT']), validate(createInquirySchema), inquiryController.createInquiry);
router.get('/', requireRole(['ADMIN', 'MANAGER', 'AGENT', 'OPERATIONS', 'FINANCE']), inquiryController.listInquiries);
router.get('/:id', requireRole(['ADMIN', 'MANAGER', 'AGENT', 'OPERATIONS', 'FINANCE']), inquiryController.getInquiry);
router.put('/:id', requireRole(['ADMIN', 'MANAGER', 'AGENT']), validate(updateInquirySchema), inquiryController.updateInquiry);
router.post('/:id/convert-to-quotation', requireRole(['ADMIN', 'MANAGER', 'AGENT']), inquiryController.convertToQuotation);

module.exports = router;

