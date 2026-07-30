const mongoose = require('mongoose');
const { scopingPlugin } = require('../plugins/scoping');

const commonLedgerFields = {
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  reason: { type: String, required: true },
  refId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Could be Booking ID, Payment ID, etc.
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true },
  partnerId: { type: mongoose.Schema.Types.ObjectId, default: null } // Optional, for PartnerLedger it's explicit
};

// Disallow updates and deletes on ledger schemas to enforce append-only
function appendOnlyPlugin(schema) {
  const prevent = async function () {
    throw new Error('Ledger records are append-only. Updates and deletes are not allowed.');
  };
  ['update', 'updateOne', 'updateMany', 'findOneAndUpdate', 'delete', 'deleteOne', 'deleteMany', 'findOneAndDelete'].forEach(op => {
    schema.pre(op, prevent);
  });
  // Also prevent doc.save() on existing documents
  schema.pre('save', async function () {
    if (!this.isNew) {
      throw new Error('Ledger records are append-only. Modifying existing records is not allowed.');
    }
  });
}

const tourLedgerSchema = new mongoose.Schema({
  ...commonLedgerFields,
  entityId: { type: mongoose.Schema.Types.ObjectId, ref: 'DepartureInstance', required: true }
}, { timestamps: true });
tourLedgerSchema.plugin(scopingPlugin);
tourLedgerSchema.plugin(appendOnlyPlugin);

const customerLedgerSchema = new mongoose.Schema({
  ...commonLedgerFields,
  entityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true }
}, { timestamps: true });
customerLedgerSchema.plugin(scopingPlugin);
customerLedgerSchema.plugin(appendOnlyPlugin);

const partnerLedgerSchema = new mongoose.Schema({
  ...commonLedgerFields,
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true } // Reference to Partner model (not fully defined here but assumed)
}, { timestamps: true });
partnerLedgerSchema.plugin(scopingPlugin);
partnerLedgerSchema.plugin(appendOnlyPlugin);

const commissionLedgerSchema = new mongoose.Schema({
  ...commonLedgerFields,
  entityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  status: { type: String, enum: ['UNSETTLED', 'SETTLED'], default: 'UNSETTLED' }
}, { timestamps: true });
commissionLedgerSchema.plugin(scopingPlugin);
commissionLedgerSchema.plugin(appendOnlyPlugin);

const financialLedgerSchema = new mongoose.Schema({
  ...commonLedgerFields,
  category: {
    type: String,
    enum: ['CUSTOMER_PAYMENT', 'SUPPLIER_PAYMENT', 'COMMISSION_PAYOUT', 'REFUND', 'OTHER'],
    required: true
  },
  currency: { type: String, default: 'NPR' }
}, { timestamps: true });
financialLedgerSchema.plugin(scopingPlugin);
financialLedgerSchema.plugin(appendOnlyPlugin);

const TourLedger = mongoose.model('TourLedger', tourLedgerSchema);
const CustomerLedger = mongoose.model('CustomerLedger', customerLedgerSchema);
const PartnerLedger = mongoose.model('PartnerLedger', partnerLedgerSchema);
const CommissionLedger = mongoose.model('CommissionLedger', commissionLedgerSchema);
const FinancialLedger = mongoose.model('FinancialLedger', financialLedgerSchema);

module.exports = { TourLedger, CustomerLedger, PartnerLedger, CommissionLedger, FinancialLedger };

