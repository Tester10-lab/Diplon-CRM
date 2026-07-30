const mongoose = require('mongoose');
const { scopingPlugin } = require('../plugins/scoping');

const driverProfileSchema = new mongoose.Schema({
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true, unique: true },
  licenseNumber: { type: String, required: true },
  licenseExpiry: { type: Date },
  leaveBalance: { type: Number, default: 0 },
  documents: [{
    type: { type: String },
    url: { type: String },
    expiryDate: { type: Date }
  }],
  performanceRating: { type: Number, default: 5.0, min: 0, max: 5 },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

driverProfileSchema.index({ companyId: 1, licenseNumber: 1 }, { unique: true });
driverProfileSchema.plugin(scopingPlugin);

const DriverProfile = mongoose.model('DriverProfile', driverProfileSchema);

module.exports = { DriverProfile };
