const express = require('express');
const validate = require('../middlewares/validate');
const { createLeadSchema, updateLeadSchema } = require('../schemas/crmSchemas');
const leadController = require('../controllers/leadController');

const router = express.Router();


router.post('/', validate(createLeadSchema), leadController.createLead);
router.get('/', leadController.listLeads);
router.get('/:id', leadController.getLead);
router.put('/:id', validate(updateLeadSchema), leadController.updateLead);
router.post('/:id/convert-to-inquiry', leadController.convertToInquiry);

module.exports = router;

