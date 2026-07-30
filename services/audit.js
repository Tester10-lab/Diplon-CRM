const { AuditLog } = require('../models/AuditReminder');
const { getContext } = require('../utils/context');

async function writeAuditLog({ entityType, entityId, action, beforeState = null, afterState = null }, session = null) {
  const context = getContext();
  
  if (!context.currentUserId) {
    throw new Error('Audit log requires currentUserId in context');
  }

  const logEntry = new AuditLog({
    entityType,
    entityId,
    action,
    beforeState,
    afterState,
    actorId: context.currentUserId,
    branchId: context.branchId,
    companyId: context.companyId
  });

  return logEntry.save({ session });
}

module.exports = { writeAuditLog };
