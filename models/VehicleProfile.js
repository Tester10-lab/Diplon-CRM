const mongoose = require('mongoose');
const { scopingPlugin } = require('../plugins/scoping');

const vehicleProfileSchema = new mongoose.Schema({
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true, unique: true },
  registrationNumber: { type: String, required: true },
  seatingCapacity: { type: Number, required: true, min: 1 },
  bluebookExpiry: { type: Date },
  insuranceExpiry: { type: Date },
  taxExpiry: { type: Date },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

vehicleProfileSchema.index({ companyId: 1, registrationNumber: 1 }, { unique: true });
vehicleProfileSchema.plugin(scopingPlugin);

const VehicleProfile = mongoose.model('VehicleProfile', vehicleProfileSchema);

module.exports = { VehicleProfile };
