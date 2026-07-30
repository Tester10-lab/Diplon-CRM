const mongoose = require('mongoose');
const { Receipt, CreditNote, DebitNote } = require('../models/ReceiptCreditDebit');
const { Invoice } = require('../models/PaymentInvoice');
const { FinancialLedger } = require('../models/Ledger');
const { getContext } = require('../utils/context');
const { logActivity } = require('./activityService');
const { generateOrGetDocument } = require('./documentService');

async function createReceiptForPayment(payment, user) {
  const context = getContext();
  const receiptNumber = `REC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const receiptId = new mongoose.Types.ObjectId();
  const receipt = await Receipt.create({
    _id: receiptId,
    receiptNumber,
    paymentId: payment._id,
    bookingId: payment.bookingId || null,
    customerId: payment.customerId || null,
    amount: payment.baseAmount || payment.amount,
    currency: payment.currency || 'NPR',
    status: 'ISSUED',
    qrPayload: `https://diploncrm.internal/verify-receipt/${receiptNumber}`,
    receiptUrl: `/api/documents/receipts/${receiptId}/pdf`,
    createdBy: context.employeeId,
    branchId: context.branchId,
    companyId: context.companyId
  });

  await generateOrGetDocument('RECEIPT', receipt._id, user);

  if (payment.bookingId) {
    await logActivity(
      payment.bookingId,
      'Booking',
      'receipt_issued',
      `Receipt ${receiptNumber} issued for payment of ${receipt.amount}`,
      user
    );
  }

  return receipt;
}

async function createCreditNote(data, user) {
  const context = getContext();
  const session = await mongoose.startSession();
  let resultNote;

  try {
    session.startTransaction();

    const invoice = await Invoice.findById(data.invoiceId).session(session);
    if (!invoice) {
      const err = new Error('Invoice not found');
      err.isAppError = true;
      err.statusCode = 404;
      throw err;
    }

    const noteNumber = `CN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const [creditNote] = await CreditNote.create([{
      noteNumber,
      invoiceId: invoice._id,
      bookingId: invoice.bookingId,
      amount: data.amount,
      currency: data.currency || 'NPR',
      reason: data.reason,
      status: 'APPLIED',
      notes: data.notes || '',
      createdBy: context.employeeId,
      branchId: context.branchId,
      companyId: context.companyId
    }], { session });

    // Adjust Invoice Balance Due
    const newBalanceDue = Math.max(0, Math.round((invoice.balanceDue - data.amount) * 100) / 100);
    invoice.balanceDue = newBalanceDue;
    if (newBalanceDue === 0 && invoice.status !== 'CANCELLED') {
      invoice.status = 'PAID';
    }
    await invoice.save({ session });

    // Financial Ledger Debit Entry (Adjustment / Refund credit)
    await FinancialLedger.create([{
      amount: data.amount,
      type: 'debit',
      category: 'REFUND',
      reason: `Credit Note ${noteNumber}: ${data.reason}`,
      refId: creditNote._id,
      currency: data.currency || 'NPR',
      createdBy: context.employeeId,
      branchId: context.branchId,
      companyId: context.companyId
    }], { session });

    await session.commitTransaction();
    resultNote = creditNote;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  await logActivity(
    resultNote.bookingId,
    'Booking',
    'credit_note_created',
    `Credit Note ${resultNote.noteNumber} issued for ${resultNote.amount} (${data.reason})`,
    user
  );

  return resultNote;
}

async function createDebitNote(data, user) {
  const context = getContext();
  const session = await mongoose.startSession();
  let resultNote;

  try {
    session.startTransaction();

    const invoice = await Invoice.findById(data.invoiceId).session(session);
    if (!invoice) {
      const err = new Error('Invoice not found');
      err.isAppError = true;
      err.statusCode = 404;
      throw err;
    }

    const noteNumber = `DN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const [debitNote] = await DebitNote.create([{
      noteNumber,
      invoiceId: invoice._id,
      bookingId: invoice.bookingId,
      amount: data.amount,
      currency: data.currency || 'NPR',
      reason: data.reason,
      status: 'APPLIED',
      notes: data.notes || '',
      createdBy: context.employeeId,
      branchId: context.branchId,
      companyId: context.companyId
    }], { session });

    // Increase Invoice Total & Balance Due
    invoice.totalAmount = Math.round((invoice.totalAmount + data.amount) * 100) / 100;
    invoice.balanceDue = Math.round((invoice.balanceDue + data.amount) * 100) / 100;
    if (invoice.status === 'PAID') {
      invoice.status = 'PARTIALLY_PAID';
    }
    await invoice.save({ session });

    // Financial Ledger Credit Entry (Additional Charge)
    await FinancialLedger.create([{
      amount: data.amount,
      type: 'credit',
      category: 'CUSTOMER_PAYMENT',
      reason: `Debit Note ${noteNumber}: ${data.reason}`,
      refId: debitNote._id,
      currency: data.currency || 'NPR',
      createdBy: context.employeeId,
      branchId: context.branchId,
      companyId: context.companyId
    }], { session });

    await session.commitTransaction();
    resultNote = debitNote;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  await logActivity(
    resultNote.bookingId,
    'Booking',
    'debit_note_created',
    `Debit Note ${resultNote.noteNumber} issued for ${resultNote.amount} (${data.reason})`,
    user
  );

  return resultNote;
}

module.exports = {
  createReceiptForPayment,
  createCreditNote,
  createDebitNote
};
