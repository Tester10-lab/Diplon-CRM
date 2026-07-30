const express = require('express');
const router = express.Router();
const financeReportController = require('../controllers/financeReportController');
const { requireRole } = require('../middlewares/auth');

router.get('/departures/:departureInstanceId/profitability', requireRole(['ADMIN', 'MANAGER', 'FINANCE', 'OPERATIONS']), financeReportController.getDepartureProfitabilityReport);
router.get('/summary', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), financeReportController.getFinancialSummaryReport);

module.exports = router;
