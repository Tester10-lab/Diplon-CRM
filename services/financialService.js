const mongoose = require('mongoose');
const { Booking } = require('../models/Pipeline');
const { Payment, Invoice } = require('../models/PaymentInvoice');
const { SupplierPayable } = require('../models/SupplierPayable');
const { CommissionPayout } = require('../models/CommissionPayout');
const { FinancialLedger, CommissionLedger } = require('../models/Ledger');
const { getContext } = require('../utils/context');
const { logActivity } = require('./activityService');

async function generateInvoice(bookingId, invoiceData = {}, user) {
  const context = getContext();
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const err = new Error('Booking not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }

  // Check if invoice already exists
  const existing = await Invoice.findOne({ bookingId });
  if (existing) {
    return existing;
  }

  const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const totalAmount = booking.totalAmount || booking.totalPrice || 0;

  const invoice = await Invoice.create({
    invoiceNumber,
    bookingId: booking._id,
    totalAmount,
    paidAmount: 0,
    balanceDue: totalAmount,
    currency: invoiceData.currency || 'NPR',
    dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    status: 'ISSUED',
    notes: invoiceData.notes || '',
    createdBy: context.employeeId,
    branchId: context.branchId,
    companyId: context.companyId
  });

  return invoice;
}

async function recordCustomerPayment(paymentData, user) {
  const context = getContext();
  const session = await mongoose.startSession();
  let paymentResult;

  try {
    session.startTransaction();

    let booking;
    if (paymentData.bookingId) {
      booking = await Booking.findById(paymentData.bookingId).session(session);
    }

    const exchangeRate = paymentData.exchangeRate || 1;
    const baseAmount = Math.round((paymentData.amount * exchangeRate) * 100) / 100;

    // 1. Create Payment
    const [payment] = await Payment.create([{
      ...paymentData,
      baseAmount,
      createdBy: context.employeeId,
      branchId: context.branchId,
      companyId: context.companyId
    }], { session });

    // 2. Handle Multi-Invoice Allocations if provided, otherwise apply to single booking invoice
    if (paymentData.allocations && paymentData.allocations.length > 0) {
      for (const alloc of paymentData.allocations) {
        const inv = await Invoice.findById(alloc.invoiceId).session(session);
        if (inv) {
          const allocBase = Math.round((alloc.allocatedAmount * exchangeRate) * 100) / 100;
          const newPaid = Math.round((inv.paidAmount + allocBase) * 100) / 100;
          const newBal = Math.max(0, Math.round((inv.totalAmount - newPaid) * 100) / 100);
          inv.paidAmount = newPaid;
          inv.balanceDue = newBal;
          inv.status = newBal === 0 ? 'PAID' : 'PARTIALLY_PAID';
          await inv.save({ session });

          if (inv.bookingId) {
            const b = await Booking.findById(inv.bookingId).session(session);
            if (b) {
              b.paymentStatus = newBal === 0 ? 'PAID' : 'PARTIALLY_PAID';
              await b.save({ session });
            }
          }
        }
      }
    } else if (booking) {
      let invoice = await Invoice.findOne({ bookingId: booking._id }).session(session);
      if (!invoice) {
        const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const totalAmount = booking.totalAmount || booking.totalPrice || baseAmount;
        [invoice] = await Invoice.create([{
          invoiceNumber,
          bookingId: booking._id,
          totalAmount,
          paidAmount: 0,
          balanceDue: totalAmount,
          currency: paymentData.currency || 'NPR',
          status: 'ISSUED',
          createdBy: context.employeeId,
          branchId: context.branchId,
          companyId: context.companyId
        }], { session });
      }

      const newPaidAmount = Math.round((invoice.paidAmount + baseAmount) * 100) / 100;
      const newBalanceDue = Math.max(0, Math.round((invoice.totalAmount - newPaidAmount) * 100) / 100);
      const newStatus = newBalanceDue === 0 ? 'PAID' : 'PARTIALLY_PAID';

      invoice.paidAmount = newPaidAmount;
      invoice.balanceDue = newBalanceDue;
      invoice.status = newStatus;
      await invoice.save({ session });

      booking.paymentStatus = newStatus;
      await booking.save({ session });
    }

    // 3. Financial Ledger Entry
    await FinancialLedger.create([{
      amount: baseAmount,
      type: 'credit',
      category: 'CUSTOMER_PAYMENT',
      reason: `Customer Payment ${paymentData.bookingId ? `for Booking ${paymentData.bookingId}` : ''}`,
      refId: payment._id,
      currency: paymentData.currency || 'NPR',
      createdBy: context.employeeId,
      branchId: context.branchId,
      companyId: context.companyId
    }], { session });

    await session.commitTransaction();
    paymentResult = payment;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  // 4. Auto-generate Customer Receipt
  try {
    const { createReceiptForPayment } = require('./receiptCreditDebitService');
    await createReceiptForPayment(paymentResult, user);
  } catch (e) {
    console.warn('Auto receipt creation warning:', e.message);
  }

  if (paymentData.bookingId) {
    await logActivity(
      paymentData.bookingId,
      'Booking',
      'payment_received',
      `Customer payment of ${paymentData.amount} (${paymentData.paymentMethod}) recorded`,
      user
    );
  }

  return paymentResult;
}

async function recordSupplierPayable(payableData, user) {
  const context = getContext();
  const exchangeRate = payableData.exchangeRate || 1;
  const baseAmount = Math.round((payableData.amount * exchangeRate) * 100) / 100;

  const payable = await SupplierPayable.create({
    ...payableData,
    baseAmount,
    paidAmount: 0,
    balanceDue: payableData.amount,
    status: 'UNPAID',
    createdBy: context.employeeId,
    branchId: context.branchId,
    companyId: context.companyId
  });

  const refEntityId = payable.departureInstanceId || payable.bookingId;
  if (refEntityId) {
    await logActivity(
      refEntityId,
      payable.departureInstanceId ? 'DepartureInstance' : 'Booking',
      'payable_created',
      `Supplier payable of ${payable.amount} created for ${payable.supplierName}`,
      user
    );
  }

  return payable;
}

async function paySupplierBill(payableId, paymentData, user) {
  const context = getContext();
  const session = await mongoose.startSession();
  let updatedPayable;

  try {
    session.startTransaction();

    const payable = await SupplierPayable.findById(payableId).session(session);
    if (!payable) {
      const err = new Error('Supplier payable not found');
      err.isAppError = true;
      err.statusCode = 404;
      throw err;
    }

    if (paymentData.amount > payable.balanceDue) {
      const err = new Error(`Payment amount (${paymentData.amount}) exceeds remaining balance due (${payable.balanceDue})`);
      err.isAppError = true;
      err.statusCode = 400;
      throw err;
    }

    const newPaidAmount = Math.round((payable.paidAmount + paymentData.amount) * 100) / 100;
    const newBalanceDue = Math.round((payable.amount - newPaidAmount) * 100) / 100;
    const newStatus = newBalanceDue === 0 ? 'PAID' : 'PARTIALLY_PAID';

    payable.payments.push({
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      transactionRef: paymentData.transactionRef || '',
      notes: paymentData.notes || '',
      paidBy: context.employeeId,
      paidAt: new Date()
    });

    payable.paidAmount = newPaidAmount;
    payable.balanceDue = newBalanceDue;
    payable.status = newStatus;

    await payable.save({ session });

    // Financial Ledger Debit Entry
    await FinancialLedger.create([{
      amount: paymentData.amount,
      type: 'debit',
      category: 'SUPPLIER_PAYMENT',
      reason: `Supplier Payment to ${payable.supplierName} (${payable.supplierCategory})`,
      refId: payable._id,
      currency: payable.currency || 'NPR',
      createdBy: context.employeeId,
      branchId: context.branchId,
      companyId: context.companyId
    }], { session });

    await session.commitTransaction();
    updatedPayable = payable;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  const refEntityId = updatedPayable.departureInstanceId || updatedPayable.bookingId;
  if (refEntityId) {
    await logActivity(
      refEntityId,
      updatedPayable.departureInstanceId ? 'DepartureInstance' : 'Booking',
      'payable_paid',
      `Paid ${paymentData.amount} to supplier ${updatedPayable.supplierName}`,
      user
    );
  }

  return updatedPayable;
}

async function processCommissionPayout(payoutData, user) {
  const context = getContext();
  const session = await mongoose.startSession();
  let payoutResult;

  try {
    session.startTransaction();

    // Fetch commission ledgers
    const ledgers = await CommissionLedger.find({
      _id: { $in: payoutData.commissionLedgerIds },
      entityId: payoutData.payeeId
    }).session(session);

    if (ledgers.length !== payoutData.commissionLedgerIds.length) {
      const err = new Error('One or more commission ledger records were not found');
      err.isAppError = true;
      err.statusCode = 404;
      throw err;
    }

    const totalPaid = ledgers.reduce((sum, item) => sum + item.amount, 0);
    const payoutRef = `PAYOUT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const [payout] = await CommissionPayout.create([{
      payoutRef,
      payeeType: payoutData.payeeType,
      payeeId: payoutData.payeeId,
      totalPaid,
      commissionLedgerIds: payoutData.commissionLedgerIds,
      paymentMethod: payoutData.paymentMethod,
      transactionRef: payoutData.transactionRef || '',
      notes: payoutData.notes || '',
      createdBy: context.employeeId,
      branchId: context.branchId,
      companyId: context.companyId
    }], { session });

    // Financial Ledger Debit Entry for Payout
    await FinancialLedger.create([{
      amount: totalPaid,
      type: 'debit',
      category: 'COMMISSION_PAYOUT',
      reason: `Commission payout (${payoutRef}) to ${payoutData.payeeType} ${payoutData.payeeId}`,
      refId: payout._id,
      createdBy: context.employeeId,
      branchId: context.branchId,
      companyId: context.companyId
    }], { session });

    await session.commitTransaction();
    payoutResult = payout;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  return payoutResult;
}

module.exports = {
  generateInvoice,
  recordCustomerPayment,
  recordSupplierPayable,
  paySupplierBill,
  processCommissionPayout
};
