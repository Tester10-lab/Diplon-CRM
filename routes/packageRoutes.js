const express = require('express');
const { requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createPackageSchema, updatePackageSchema } = require('../schemas/module2Schemas');
const packageController = require('../controllers/packageController');

const router = express.Router();

// View Package catalog (ADMIN, MANAGER, AGENT, OPERATIONS, FINANCE, AGENCY, DRIVER)
router.get('/', requireRole(['ADMIN', 'MANAGER', 'AGENT', 'OPERATIONS', 'FINANCE', 'AGENCY', 'DRIVER']), packageController.listPackages);

// Create/edit Package (ADMIN, MANAGER only)
router.post('/', requireRole(['ADMIN', 'MANAGER']), validate(createPackageSchema), packageController.createPackage);
router.put('/:id', requireRole(['ADMIN', 'MANAGER']), validate(updatePackageSchema), packageController.updatePackage);

module.exports = router;

