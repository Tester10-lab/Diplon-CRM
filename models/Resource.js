const mongoose = require('mongoose');
const { scopingPlugin } = require('../plugins/scoping');

const resourceSchema = new mongoose.Schema({
  type: { type: String, enum: ['Vehicle', 'Guide', 'Driver'], required: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  availability: { type: Boolean, default: true },
  details: { type: mongoose.Schema.Types.Mixed }, // Flexible subdocument for type-specific fields
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

resourceSchema.plugin(scopingPlugin);
const Resource = mongoose.model('Resource', resourceSchema);

const assignmentSchema = new mongoose.Schema({
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  departureInstanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'DepartureInstance', required: true },
  role: {
    type: String,
    enum: ['DRIVER', 'GUIDE', 'VEHICLE', 'BACKUP_VEHICLE', 'UNSPECIFIED'],
    default: 'UNSPECIFIED'
  },
  status: {
    type: String,
    enum: ['ASSIGNED', 'CONFIRMED', 'NO_SHOW', 'COMPLETED', 'CANCELLED'],
    default: 'ASSIGNED'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

assignmentSchema.plugin(scopingPlugin);
const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = { Resource, Assignment };
