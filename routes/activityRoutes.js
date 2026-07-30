const express = require('express');
const activityController = require('../controllers/activityController');

const router = express.Router();


// List follow-ups (Reminders for CRM entities)
router.get('/follow-ups', activityController.listFollowUps);

// List audit logs for a specific entity
router.get('/:entityId/audit-logs', activityController.listAuditLogs);

module.exports = router;

