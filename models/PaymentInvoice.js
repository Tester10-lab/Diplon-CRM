const mongoose = require('mongoose');
const { scopingPlugin } = require('../plugins/scoping');

const PaymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  amount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, default: 'NPR' },
  exchangeRate: { type: Number, default: 1 },
  baseAmount: { type: Number, required: true }, // amount in base currency (amount * exchangeRate)
  paymentMethod: {
    type: String,
    enum: ['CASH', 'BANK_TRANSFER', 'ESEWA', 'KHALTI', 'FONEPAY', 'CONNECT_IPS', 'OTHER'],
    required: true
  },
  transactionRef: { type: String, default: '' },
  allocations: [{
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    allocatedAmount: { type: Number, required: true, min: 0.01 }
  }],
  status: {
    type: String,
    enum: ['COMPLETED', 'REFUNDED', 'FAILED'],
    default: 'COMPLETED'
  },
  paidAt: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

PaymentSchema.plugin(scopingPlugin);

PaymentSchema.pre('validate', function() {
  if (this.amount != null && this.exchangeRate != null) {
    this.baseAmount = Math.round((this.amount * this.exchangeRate) * 100) / 100;
  }
});

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  totalAmount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, default: 0, min: 0 },
  balanceDue: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'NPR' },
  dueDate: { type: Date },
  status: {
    type: String,
    enum: ['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'REFUNDED', 'CANCELLED'],
    default: 'ISSUED'
  },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

InvoiceSchema.plugin(scopingPlugin);

const Payment = mongoose.model('Payment', PaymentSchema);
const Invoice = mongoose.model('Invoice', InvoiceSchema);

module.exports = {
  Payment,
  Invoice
};
