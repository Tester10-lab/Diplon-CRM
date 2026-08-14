const express = require('express');
const validate = require('../middlewares/validate');
const { createLeadSchema, updateLeadSchema } = require('../schemas/crmSchemas');
const leadController = require('../controllers/leadController');
const { requireRole } = require('../middlewares/auth');

const router = express.Router();

router.post('/', requireRole(['ADMIN', 'MANAGER', 'AGENT']), validate(createLeadSchema), leadController.createLead);
router.get('/', requireRole(['ADMIN', 'MANAGER', 'AGENT', 'OPERATIONS', 'FINANCE']), leadController.listLeads);
router.get('/:id', requireRole(['ADMIN', 'MANAGER', 'AGENT', 'OPERATIONS', 'FINANCE']), leadController.getLead);
router.put('/:id', requireRole(['ADMIN', 'MANAGER', 'AGENT']), validate(updateLeadSchema), leadController.updateLead);
router.post('/:id/convert-to-inquiry', requireRole(['ADMIN', 'MANAGER', 'AGENT']), leadController.convertToInquiry);

module.exports = router;

