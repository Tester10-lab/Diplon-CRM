const mongoose = require('mongoose');
const { scopingPlugin } = require('../plugins/scoping');

const CommissionPayoutSchema = new mongoose.Schema({
  payoutRef: { type: String, required: true },
  payeeType: { type: String, enum: ['EMPLOYEE', 'PARTNER'], required: true },
  payeeId: { type: mongoose.Schema.Types.ObjectId, required: true }, // User/Employee ID or Partner ID
  totalPaid: { type: Number, required: true, min: 0.01 },
  currency: { type: String, default: 'NPR' },
  commissionLedgerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CommissionLedger' }],
  paymentMethod: {
    type: String,
    enum: ['CASH', 'BANK_TRANSFER', 'ESEWA', 'KHALTI', 'FONEPAY', 'CONNECT_IPS', 'OTHER'],
    required: true
  },
  transactionRef: { type: String, default: '' },
  status: { type: String, enum: ['COMPLETED', 'CANCELLED'], default: 'COMPLETED' },
  paidAt: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

CommissionPayoutSchema.plugin(scopingPlugin);

const CommissionPayout = mongoose.model('CommissionPayout', CommissionPayoutSchema);

module.exports = {
  CommissionPayout
};
