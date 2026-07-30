const { OperationsNote } = require('../models/OperationsNote');
const { AuditLog } = require('../models/AuditReminder');
const { logActivity } = require('./activityService');
const { getContext } = require('../utils/context');

async function getTimeline(departureInstanceId) {
  const notes = await OperationsNote.find({ departureInstanceId })
    .populate('createdBy', 'email role')
    .lean();

  const auditLogs = await AuditLog.find({ entityId: departureInstanceId })
    .populate('actorId', 'email role')
    .lean();

  const timelineItems = [
    ...notes.map(n => ({
      id: n._id,
      kind: 'NOTE',
      type: n.type,
      message: n.message,
      author: n.createdBy ? n.createdBy.email : 'System',
      createdAt: n.createdAt
    })),
    ...auditLogs.map(a => ({
      id: a._id,
      kind: 'AUDIT',
      action: a.action,
      entityType: a.entityType,
      details: a.details,
      author: a.actorId ? a.actorId.email : 'System',
      createdAt: a.createdAt
    }))
  ];

  timelineItems.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  return timelineItems;
}

async function addNote(departureInstanceId, type, message, user) {
  const context = getContext();
  const note = new OperationsNote({
    departureInstanceId,
    type: type || 'NOTE',
    message,
    createdBy: user.employeeId || user._id,
    branchId: context.branchId,
    companyId: context.companyId
  });

  await note.save();
  await logActivity(departureInstanceId, 'DepartureInstance', 'add_note', `Added operations note: ${message}`, user);
  return note;
}

module.exports = {
  getTimeline,
  addNote
};
