const { AuditLog } = require('../models/AuditReminder');

/**
 * Creates an AuditLog entry. If this is the FIRST activity log for a Lead or Inquiry,
 * this function automatically populates `firstResponseAt` on that entity atomically.
 */
async function logActivity(entityId, entityType, action, details, user, session = null) {
  const logData = {
    entityId,
    entityType,
    action,
    details,
    actorId: user.employeeId,
    branchId: user.branchId,
    companyId: user.companyId
  };

  const auditLog = new AuditLog(logData);
  if (session) {
    await auditLog.save({ session });
  } else {
    await auditLog.save();
  }

  // Handle firstResponseAt trigger atomically for Lead and Inquiry
  if (entityType === 'Lead' || entityType === 'Inquiry') {
    const Model = require('../models/Pipeline')[entityType];

    // ATOMIC FIX: Update only if firstResponseAt is currently null/undefined.
    // This avoids the check-then-act race condition (e.g. concurrent seat booking issue).
    const filter = {
      _id: entityId,
      firstResponseAt: null
    };

    const update = {
      $set: { firstResponseAt: new Date() }
    };

    const options = {};
    if (session) {
      options.session = session;
    }

    // Atomic update, if it doesn't match (because firstResponseAt is already set), it safely does nothing.
    await Model.updateOne(filter, update, options);
  }

  return auditLog;
}

module.exports = {
  logActivity
};
