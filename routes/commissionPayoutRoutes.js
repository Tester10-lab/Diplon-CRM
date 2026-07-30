const express = require('express');
const router = express.Router();
const commissionPayoutController = require('../controllers/commissionPayoutController');
const { requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { commissionPayoutCreateSchema } = require('../schemas/module4Schemas');

router.post('/payout', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), validate(commissionPayoutCreateSchema), commissionPayoutController.createCommissionPayout);
router.get('/', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), commissionPayoutController.getCommissionPayouts);

module.exports = router;
