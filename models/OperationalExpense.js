const mongoose = require('mongoose');
const { scopingPlugin } = require('../plugins/scoping');

const ExpenseSchema = new mongoose.Schema({
  expenseNumber: { type: String, required: true },
  category: {
    type: String,
    enum: ['FUEL', 'OFFICE', 'MARKETING', 'INTERNET', 'SALARY', 'MAINTENANCE', 'MISC'],
    required: true
  },
  subCategory: { type: String, default: '' },
  amount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, default: 'NPR' },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'BANK_TRANSFER', 'ESEWA', 'KHALTI', 'FONEPAY', 'CONNECT_IPS', 'OTHER'],
    required: true
  },
  transactionRef: { type: String, default: '' },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', default: null },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserEmployee', default: null },
  paidDate: { type: Date, default: Date.now },
  receiptUrl: { type: String, default: '' },
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

ExpenseSchema.plugin(scopingPlugin);

const Expense = mongoose.model('Expense', ExpenseSchema);

module.exports = {
  Expense
};
