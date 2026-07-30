const operationsDashboardService = require('../services/operationsDashboardService');
const { serializeDoc } = require('../services/serialization');

async function getDashboardSummary(req, res, next) {
  try {
    const summary = await operationsDashboardService.getDashboardSummary(req.user);
    res.status(200).json(serializeDoc(summary));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardSummary
};
