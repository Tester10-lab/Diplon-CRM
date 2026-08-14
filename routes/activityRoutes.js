const express = require('express');
const activityController = require('../controllers/activityController');
const { requireRole } = require('../middlewares/auth');

const router = express.Router();

// List follow-ups (Reminders for CRM entities)
router.get('/follow-ups', requireRole(['ADMIN', 'MANAGER', 'AGENT', 'OPERATIONS', 'FINANCE']), activityController.listFollowUps);

// List audit logs for a specific entity
router.get('/:entityId/audit-logs', requireRole(['ADMIN', 'MANAGER', 'AGENT', 'OPERATIONS', 'FINANCE']), activityController.listAuditLogs);

module.exports = router;

