const express = require('express');
const router = express.Router();
const operationsController = require('../controllers/operationsController');
const { requireRole } = require('../middlewares/auth');


router.get('/manifests/:departureInstanceId', requireRole(['ADMIN', 'MANAGER', 'OPERATIONS']), operationsController.getManifest);

module.exports = router;

