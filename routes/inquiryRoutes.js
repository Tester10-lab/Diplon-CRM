const express = require('express');
const validate = require('../middlewares/validate');
const { createInquirySchema, updateInquirySchema } = require('../schemas/crmSchemas');
const inquiryController = require('../controllers/inquiryController');

const router = express.Router();


router.post('/', validate(createInquirySchema), inquiryController.createInquiry);
router.get('/', inquiryController.listInquiries);
router.get('/:id', inquiryController.getInquiry);
router.put('/:id', validate(updateInquirySchema), inquiryController.updateInquiry);
router.post('/:id/convert-to-quotation', inquiryController.convertToQuotation);

module.exports = router;

