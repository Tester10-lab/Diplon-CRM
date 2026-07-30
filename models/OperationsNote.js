const mongoose = require('mongoose');
const { scopingPlugin } = require('../plugins/scoping');

const operationsNoteSchema = new mongoose.Schema({
  departureInstanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'DepartureInstance', required: true },
  type: { type: String, enum: ['NOTE', 'ALERT'], default: 'NOTE' },
  message: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

operationsNoteSchema.index({ departureInstanceId: 1, createdAt: -1 });
operationsNoteSchema.plugin(scopingPlugin);

const OperationsNote = mongoose.model('OperationsNote', operationsNoteSchema);

module.exports = { OperationsNote };
