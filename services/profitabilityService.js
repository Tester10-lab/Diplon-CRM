const { DepartureInstance } = require('../models/Product');
const { Booking } = require('../models/Pipeline');
const { SupplierPayable } = require('../models/SupplierPayable');
const { Payment, Invoice } = require('../models/PaymentInvoice');
const { FinancialLedger } = require('../models/Ledger');

async function getDepartureProfitability(departureInstanceId) {
  const departure = await DepartureInstance.findById(departureInstanceId).populate('packageId');
  if (!departure) {
    const err = new Error('Departure instance not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }

  // 1. Fetch Bookings for this departure
  const bookings = await Booking.find({
    departureInstanceId,
    status: { $ne: 'CANCELLED' }
  });

  const totalBookings = bookings.length;
  const bookingIds = bookings.map(b => b._id);

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || b.totalPrice || 0), 0);

  // Payments collected for these bookings
  const payments = await Payment.find({
    bookingId: { $in: bookingIds },
    status: 'COMPLETED'
  });
  const totalReceived = payments.reduce((sum, p) => sum + p.baseAmount, 0);

  // 2. Fetch Supplier Payables (Departure-level + Booking-level)
  const supplierPayables = await SupplierPayable.find({
    $or: [
      { departureInstanceId },
      { bookingId: { $in: bookingIds } }
    ],
    status: { $ne: 'CANCELLED' }
  });

  const totalSupplierCost = supplierPayables.reduce((sum, sp) => sum + sp.baseAmount, 0);
  const totalSupplierPaid = supplierPayables.reduce((sum, sp) => sum + sp.paidAmount, 0);
  const supplierBalanceDue = supplierPayables.reduce((sum, sp) => sum + sp.balanceDue, 0);

  // Group supplier costs by category
  const costsByCategory = {};
  supplierPayables.forEach(sp => {
    costsByCategory[sp.supplierCategory] = (costsByCategory[sp.supplierCategory] || 0) + sp.baseAmount;
  });

  // 3. Profitability Calculations
  const grossProfit = Math.round((totalRevenue - totalSupplierCost) * 100) / 100;
  const profitMarginPercent = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 10000) / 100 : 0;
  const netCashFlow = Math.round((totalReceived - totalSupplierPaid) * 100) / 100;

  return {
    departureInstanceId,
    packageName: departure.packageId ? (departure.packageId.name || departure.packageId.title) : 'N/A',
    startDate: departure.startDate,
    endDate: departure.endDate,
    capacity: {
      seatsTotal: departure.seatsTotal,
      seatsBooked: departure.seatsBooked,
      seatsAvailable: departure.seatsAvailable
    },
    financials: {
      totalBookings,
      totalRevenue,
      totalReceived,
      totalPendingReceivables: Math.round((totalRevenue - totalReceived) * 100) / 100,
      totalSupplierCost,
      totalSupplierPaid,
      supplierBalanceDue,
      costsByCategory,
      grossProfit,
      profitMarginPercent,
      netCashFlow
    }
  };
}

async function getFinancialSummary() {
  const ledgerEntries = await FinancialLedger.find();

  let totalCredit = 0;
  let totalDebit = 0;

  ledgerEntries.forEach(entry => {
    if (entry.type === 'credit') {
      totalCredit += entry.amount;
    } else if (entry.type === 'debit') {
      totalDebit += entry.amount;
    }
  });

  const invoices = await Invoice.find({ status: { $in: ['ISSUED', 'PARTIALLY_PAID'] } });
  const totalPendingReceivables = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  const supplierPayables = await SupplierPayable.find({ status: { $in: ['UNPAID', 'PARTIALLY_PAID'] } });
  const totalPendingPayables = supplierPayables.reduce((sum, sp) => sum + sp.balanceDue, 0);

  return {
    totalCashCollected: Math.round(totalCredit * 100) / 100,
    totalCashDisbursed: Math.round(totalDebit * 100) / 100,
    netCashBalance: Math.round((totalCredit - totalDebit) * 100) / 100,
    totalPendingReceivables: Math.round(totalPendingReceivables * 100) / 100,
    totalPendingPayables: Math.round(totalPendingPayables * 100) / 100
  };
}

async function getBookingFinancialSummary(bookingId) {
  const { Receipt, CreditNote, DebitNote } = require('../models/ReceiptCreditDebit');

  const booking = await Booking.findById(bookingId).populate('customerId').populate('packageId');
  if (!booking) {
    const err = new Error('Booking not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }

  const invoice = await Invoice.findOne({ bookingId });
  const payments = await Payment.find({ bookingId });
  const receipts = await Receipt.find({ bookingId });
  const creditNotes = await CreditNote.find({ bookingId });
  const debitNotes = await DebitNote.find({ bookingId });

  const totalPaid = payments.reduce((sum, p) => sum + (p.status === 'COMPLETED' ? p.baseAmount : 0), 0);
  const totalCreditNotes = creditNotes.reduce((sum, cn) => sum + cn.amount, 0);
  const totalDebitNotes = debitNotes.reduce((sum, dn) => sum + dn.amount, 0);
  const netInvoiceAmount = invoice ? invoice.totalAmount : (booking.totalAmount || booking.totalPrice || 0);
  const balanceDue = invoice ? invoice.balanceDue : Math.max(0, netInvoiceAmount - totalPaid);

  return {
    bookingId,
    customerName: booking.customerId ? `${booking.customerId.firstName} ${booking.customerId.lastName}` : 'N/A',
    packageTitle: booking.packageId ? (booking.packageId.name || booking.packageId.title) : 'N/A',
    bookingStatus: booking.status,
    paymentStatus: booking.paymentStatus,
    invoice,
    payments,
    receipts,
    creditNotes,
    debitNotes,
    summary: {
      netInvoiceAmount,
      totalPaid,
      totalCreditNotes,
      totalDebitNotes,
      balanceDue
    }
  };
}

async function getTourFinancialSummary(departureInstanceId) {
  const baseProfitability = await getDepartureProfitability(departureInstanceId);
  const { Expense } = require('../models/OperationalExpense');
  const { DriverStaffLedger, VehicleCost } = require('../models/StaffVehicleLedger');
  const { Assignment } = require('../models/Resource');

  // Find assigned resources for this departure
  const assignments = await Assignment.find({ departureInstanceId, status: { $ne: 'CANCELLED' } }).lean();
  const resourceIds = assignments.map(a => a.resourceId);

  // Fetch driver staff ledger costs tagged to this departure or assigned staff resources
  const driverLedgers = await DriverStaffLedger.find({
    $or: [
      { departureInstanceId },
      { staffId: { $in: resourceIds } }
    ]
  }).lean();
  const totalDriverCost = driverLedgers.reduce((sum, d) => sum + d.amount, 0);

  // Fetch vehicle costs tagged to this departure or assigned vehicle resources
  const vehicleCosts = await VehicleCost.find({
    $or: [
      { departureInstanceId },
      { resourceId: { $in: resourceIds } }
    ]
  }).lean();
  const totalVehicleCost = vehicleCosts.reduce((sum, v) => sum + v.amount, 0);

  const fuelCost = vehicleCosts.filter(v => v.costType === 'FUEL').reduce((sum, v) => sum + v.amount, 0);

  // Fetch approved expenses linked to this departure
  const expenses = await Expense.find({ approvalStatus: 'APPROVED' }).lean();
  const tourExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const grossRevenue = baseProfitability.financials.totalRevenue;
  const supplierCosts = baseProfitability.financials.totalSupplierCost;
  const totalDirectCost = supplierCosts + totalDriverCost + totalVehicleCost + tourExpenses;
  const netTourProfit = Math.round((grossRevenue - totalDirectCost) * 100) / 100;
  const marginPercent = grossRevenue > 0 ? Math.round((netTourProfit / grossRevenue) * 10000) / 100 : 0;

  return {
    ...baseProfitability,
    tourExpenses,
    driverCosts: totalDriverCost,
    vehicleCosts: totalVehicleCost,
    fuelCosts: fuelCost,
    totalDirectCost,
    netTourProfit,
    marginPercent
  };
}

async function getExecutiveFinanceDashboard() {
  const { Expense } = require('../models/OperationalExpense');
  const { CommissionLedger } = require('../models/Ledger');

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // Today's collections
  const todayPayments = await Payment.find({
    status: 'COMPLETED',
    createdAt: { $gte: startOfDay }
  });
  const todaysCollection = todayPayments.reduce((sum, p) => sum + p.baseAmount, 0);

  // Today's expenses
  const todayExpenses = await Expense.find({
    approvalStatus: 'APPROVED',
    createdAt: { $gte: startOfDay }
  });
  const todaysExpense = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Outstanding Receivables
  const invoices = await Invoice.find({ status: { $in: ['ISSUED', 'PARTIALLY_PAID'] } });
  const outstandingReceivables = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  // Supplier Due
  const supplierPayables = await SupplierPayable.find({ status: { $in: ['UNPAID', 'PARTIALLY_PAID'] } });
  const supplierDue = supplierPayables.reduce((sum, sp) => sum + sp.balanceDue, 0);

  // Commission Due
  const openCommissions = await CommissionLedger.find({ status: 'UNSETTLED' });
  const commissionDue = openCommissions.reduce((sum, c) => sum + c.amount, 0);

  // Cash & Bank balances
  const allPayments = await Payment.find({ status: 'COMPLETED' });
  const cashCollected = allPayments.filter(p => p.paymentMethod === 'CASH').reduce((sum, p) => sum + p.baseAmount, 0);
  const bankCollected = allPayments.filter(p => p.paymentMethod !== 'CASH').reduce((sum, p) => sum + p.baseAmount, 0);

  return {
    todaysCollection: Math.round(todaysCollection * 100) / 100,
    todaysExpense: Math.round(todaysExpense * 100) / 100,
    outstandingReceivables: Math.round(outstandingReceivables * 100) / 100,
    supplierDue: Math.round(supplierDue * 100) / 100,
    commissionDue: Math.round(commissionDue * 100) / 100,
    cashBalance: Math.round(cashCollected * 100) / 100,
    bankBalance: Math.round(bankCollected * 100) / 100,
    netProfit: Math.round((todaysCollection - todaysExpense) * 100) / 100
  };
}

module.exports = {
  getDepartureProfitability,
  getFinancialSummary,
  getBookingFinancialSummary,
  getTourFinancialSummary,
  getExecutiveFinanceDashboard
};

