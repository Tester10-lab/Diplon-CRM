const mongoose = require('mongoose');
const { scopingPlugin } = require('../plugins/scoping');

const cancellationPolicySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });
cancellationPolicySchema.plugin(scopingPlugin);

const refundPolicySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });
refundPolicySchema.plugin(scopingPlugin);

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  itinerary: { type: String },
  basePricing: { type: Number, required: true },
  cancellationPolicyId: { type: mongoose.Schema.Types.ObjectId, ref: 'CancellationPolicy' },
  refundPolicyId: { type: mongoose.Schema.Types.ObjectId, ref: 'RefundPolicy' },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });
packageSchema.plugin(scopingPlugin);

const departureInstanceSchema = new mongoose.Schema({
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  seatsTotal: { type: Number, required: true },
  seatsAvailable: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['Scheduled', 'Active', 'Completed', 'Cancelled'], default: 'Scheduled' },
  cancellationPolicyIdOverride: { type: mongoose.Schema.Types.ObjectId, ref: 'CancellationPolicy', default: null },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });
departureInstanceSchema.plugin(scopingPlugin);

const CancellationPolicy = mongoose.model('CancellationPolicy', cancellationPolicySchema);
const RefundPolicy = mongoose.model('RefundPolicy', refundPolicySchema);
const Package = mongoose.model('Package', packageSchema);
const DepartureInstance = mongoose.model('DepartureInstance', departureInstanceSchema);

module.exports = { CancellationPolicy, RefundPolicy, Package, DepartureInstance };
