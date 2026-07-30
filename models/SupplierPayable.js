const mongoose = require('mongoose');
const { scopingPlugin } = require('../plugins/scoping');

const SupplierPayableSchema = new mongoose.Schema({
  supplierName: { type: String, required: true },
  supplierCategory: {
    type: String,
    enum: ['HOTEL', 'TRANSPORT', 'AIRLINE', 'GUIDE', 'ENTRANCE_FEES', 'OTHER'],
    required: true
  },
  departureInstanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'DepartureInstance', default: null },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  amount: { type: Number, required: true, min: 0.01 },
  paidAmount: { type: Number, default: 0, min: 0 },
  balanceDue: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'NPR' },
  exchangeRate: { type: Number, default: 1 },
  baseAmount: { type: Number, required: true },
  dueDate: { type: Date },
  status: {
    type: String,
    enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID', 'CANCELLED'],
    default: 'UNPAID'
  },
  payments: [{
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'BANK_TRANSFER', 'ESEWA', 'KHALTI', 'FONEPAY', 'CONNECT_IPS', 'OTHER'],
      required: true
    },
    transactionRef: { type: String, default: '' },
    paidAt: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  notes: { type: String, default: '' },
  approvalStatus: {
    type: String,
    enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED'],
    default: 'APPROVED'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approvedAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

SupplierPayableSchema.plugin(scopingPlugin);

SupplierPayableSchema.pre('validate', function() {
  if (this.amount != null && this.exchangeRate != null) {
    this.baseAmount = Math.round((this.amount * this.exchangeRate) * 100) / 100;
  }
  if (this.balanceDue == null) {
    this.balanceDue = this.amount - (this.paidAmount || 0);
  }
});

const SupplierPayable = mongoose.model('SupplierPayable', SupplierPayableSchema);

module.exports = {
  SupplierPayable
};
