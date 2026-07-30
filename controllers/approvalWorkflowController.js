const {
  approveFinancialEntity,
  rejectFinancialEntity,
  getPendingApprovals
} = require('../services/approvalWorkflowService');
const { serializeDoc } = require('../services/serialization');

async function approveItem(req, res) {
  const { entityType, id } = req.params;
  const entity = await approveFinancialEntity(entityType.toUpperCase(), id, req.user);
  res.json({ message: `${entityType} approved successfully`, data: serializeDoc(entity) });
}

async function rejectItem(req, res) {
  const { entityType, id } = req.params;
  const { comments } = req.body;
  const entity = await rejectFinancialEntity(entityType.toUpperCase(), id, comments || '', req.user);
  res.json({ message: `${entityType} rejected successfully`, data: serializeDoc(entity) });
}

async function listPendingApprovals(req, res) {
  const data = await getPendingApprovals();
  res.json({ data });
}

module.exports = {
  approveItem,
  rejectItem,
  listPendingApprovals
};
