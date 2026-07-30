const mongoose = require('mongoose');
const { scopingPlugin } = require('../plugins/scoping');

const DriverStaffLedgerSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserEmployee', required: true },
  type: {
    type: String,
    enum: ['SALARY', 'ALLOWANCE', 'ADVANCE', 'FUEL', 'PENALTY', 'SETTLEMENT'],
    required: true
  },
  amount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, default: 'NPR' },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'BANK_TRANSFER', 'ESEWA', 'KHALTI', 'FONEPAY', 'CONNECT_IPS', 'OTHER'],
    required: true
  },
  transactionRef: { type: String, default: '' },
  departureInstanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'DepartureInstance', default: null },
  paidDate: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

DriverStaffLedgerSchema.plugin(scopingPlugin);

const VehicleCostSchema = new mongoose.Schema({
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true }, // Vehicle resource
  departureInstanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'DepartureInstance', default: null },
  costType: {
    type: String,
    enum: ['INSURANCE', 'BLUEBOOK', 'TAX', 'FUEL', 'MAINTENANCE', 'REPAIR', 'TYRES', 'SERVICE'],
    required: true
  },
  amount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, default: 'NPR' },
  mileageKm: { type: Number, default: 0 },
  vendorName: { type: String, default: '' },
  incurredDate: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

VehicleCostSchema.plugin(scopingPlugin);

const DriverStaffLedger = mongoose.model('DriverStaffLedger', DriverStaffLedgerSchema);
const VehicleCost = mongoose.model('VehicleCost', VehicleCostSchema);

module.exports = {
  DriverStaffLedger,
  VehicleCost
};
