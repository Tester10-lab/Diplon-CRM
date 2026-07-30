const express = require('express');
const { requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createResourceSchema, updateResourceSchema } = require('../schemas/module2Schemas');
const resourceController = require('../controllers/resourceController');

const router = express.Router();


// List resources (ADMIN, MANAGER, OPERATIONS)
router.get('/', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS']), resourceController.listResources);

// Create/edit Resource (ADMIN, MANAGER, OPERATIONS)
router.post('/', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS']), validate(createResourceSchema), resourceController.createResource);
router.put('/:id', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS']), validate(updateResourceSchema), resourceController.updateResource);

module.exports = router;

