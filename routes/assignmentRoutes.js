const express = require('express');
const { requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createAssignmentSchema } = require('../schemas/module2Schemas');
const assignmentController = require('../controllers/assignmentController');

const router = express.Router();


// Assign a resource to a departure instance (ADMIN, MANAGER, OPERATIONS)
router.post('/', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS']), validate(createAssignmentSchema), assignmentController.createAssignment);

module.exports = router;

