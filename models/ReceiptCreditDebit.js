const mongoose = require('mongoose');
const { scopingPlugin } = require('../plugins/scoping');

const ReceiptSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  amount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, default: 'NPR' },
  issuedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['ISSUED', 'SENT', 'VOID'], default: 'ISSUED' },
  qrPayload: { type: String, default: '' },
  receiptUrl: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

ReceiptSchema.plugin(scopingPlugin);

const CreditNoteSchema = new mongoose.Schema({
  noteNumber: { type: String, required: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  amount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, default: 'NPR' },
  reason: { type: String, required: true },
  status: { type: String, enum: ['ISSUED', 'APPLIED', 'CANCELLED'], default: 'ISSUED' },
  issuedDate: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

CreditNoteSchema.plugin(scopingPlugin);

const DebitNoteSchema = new mongoose.Schema({
  noteNumber: { type: String, required: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  amount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, default: 'NPR' },
  reason: { type: String, required: true },
  status: { type: String, enum: ['ISSUED', 'APPLIED', 'CANCELLED'], default: 'ISSUED' },
  issuedDate: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

DebitNoteSchema.plugin(scopingPlugin);

const Receipt = mongoose.model('Receipt', ReceiptSchema);
const CreditNote = mongoose.model('CreditNote', CreditNoteSchema);
const DebitNote = mongoose.model('DebitNote', DebitNoteSchema);

module.exports = {
  Receipt,
  CreditNote,
  DebitNote
};
