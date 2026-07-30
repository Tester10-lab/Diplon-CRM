const { Reminder, AuditLog } = require('../models/AuditReminder');
const { buildViewQuery } = require('../utils/rbac');

exports.listFollowUps = async (req, res) => {
  // We want to query reminders where entityType is Lead, Inquiry, or Quotation.
  // The user should only see follow-ups for entities they have view access to.
  // We apply the same view query rules (branchId/companyId).
  
  const baseQuery = buildViewQuery(req.user);
  
  const query = {
    ...baseQuery,
    entityType: { $in: ['Lead', 'Inquiry', 'Quotation'] }
  };

  // If status query is provided, use it, else default to PENDING
  if (req.query.status) {
    query.status = req.query.status;
  } else {
    query.status = 'PENDING';
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const followUps = await Reminder.find(query)
    .sort({ dueAt: 1 }) // Closest due dates first
    .skip(skip)
    .limit(limit);

  res.json({ data: followUps, page, limit });
};

exports.listAuditLogs = async (req, res) => {
  // Basic RBAC check: the user can see audit logs if they can see the entity.
  // Ideally, we'd verify the entity exists and they have access to it, 
  // but for a simpler list, we ensure the log's branchId/companyId matches the view query.

  const baseQuery = buildViewQuery(req.user);

  const query = {
    ...baseQuery,
    entityId: req.params.entityId
  };

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const logs = await AuditLog.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({ data: logs, page, limit });
};
