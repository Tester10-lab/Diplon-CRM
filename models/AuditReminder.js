const mongoose = require('mongoose');
const { scopingPlugin } = require('../plugins/scoping');

const auditLogSchema = new mongoose.Schema({
  entityType: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  action: { type: String, required: true }, // e.g., 'update', 'merge', 'pii_view'
  details: { type: String },
  beforeState: { type: mongoose.Schema.Types.Mixed },
  afterState: { type: mongoose.Schema.Types.Mixed },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

auditLogSchema.plugin(scopingPlugin);
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

const reminderSchema = new mongoose.Schema({
  entityType: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  dueDate: { type: Date, required: true },
  message: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  status: { type: String, enum: ['Pending', 'Completed', 'Dismissed'], default: 'Pending' },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

reminderSchema.plugin(scopingPlugin);
const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = { AuditLog, Reminder };
