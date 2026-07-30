const { processCommissionPayout } = require('../services/financialService');
const { CommissionPayout } = require('../models/CommissionPayout');
const { serializeDoc, serializeList } = require('../services/serialization');

async function createCommissionPayout(req, res) {
  const payout = await processCommissionPayout(req.body, req.user);
  res.status(201).json({
    message: 'Commission payout processed successfully',
    data: serializeDoc(payout)
  });
}

async function getCommissionPayouts(req, res) {
  const query = {};
  if (req.query.payeeId) {
    query.payeeId = req.query.payeeId;
  }
  const payouts = await CommissionPayout.find(query).sort({ createdAt: -1 });
  res.json({
    data: serializeList(payouts)
  });
}

module.exports = {
  createCommissionPayout,
  getCommissionPayouts
};
