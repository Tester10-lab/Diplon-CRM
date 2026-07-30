const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const invoiceController = require('../controllers/invoiceController');
const supplierPayableController = require('../controllers/supplierPayableController');
const commissionPayoutController = require('../controllers/commissionPayoutController');
const receiptCreditDebitController = require('../controllers/receiptCreditDebitController');
const expenseVehicleController = require('../controllers/expenseVehicleController');
const approvalWorkflowController = require('../controllers/approvalWorkflowController');
const financeReportController = require('../controllers/financeReportController');
const { requireRole } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const {
  paymentCreateSchema,
  invoiceCreateSchema,
  supplierPayableCreateSchema,
  supplierPaymentExecuteSchema,
  commissionPayoutCreateSchema
} = require('../schemas/module4Schemas');

const {
  creditDebitNoteCreateSchema,
  expenseCreateSchema,
  approvalActionSchema
} = require('../schemas/financialRefinementsSchemas');

// 1. Payments
router.post('/payments', requireRole(['ADMIN', 'MANAGER', 'FINANCE', 'AGENT']), paymentController.createPayment);
router.get('/payments/booking/:bookingId', requireRole(['ADMIN', 'MANAGER', 'FINANCE', 'AGENT']), paymentController.getPaymentsByBooking);

// 2. Invoices
router.post('/invoices', requireRole(['ADMIN', 'MANAGER', 'FINANCE', 'AGENT']), validate(invoiceCreateSchema), invoiceController.createInvoice);
router.get('/invoices/:id', requireRole(['ADMIN', 'MANAGER', 'FINANCE', 'AGENT']), invoiceController.getInvoiceById);
router.get('/invoices/booking/:bookingId', requireRole(['ADMIN', 'MANAGER', 'FINANCE', 'AGENT']), invoiceController.getInvoiceByBooking);

// 3. Receipts
router.get('/receipts', requireRole(['ADMIN', 'MANAGER', 'FINANCE', 'AGENT']), receiptCreditDebitController.getReceipts);

// 4. Credit & Debit Notes
router.post('/credit-notes', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), validate(creditDebitNoteCreateSchema), receiptCreditDebitController.addCreditNote);
router.post('/debit-notes', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), validate(creditDebitNoteCreateSchema), receiptCreditDebitController.addDebitNote);
router.get('/credit-notes', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), receiptCreditDebitController.getCreditNotes);

// 5. Supplier Payables
router.post('/supplier-payables', requireRole(['ADMIN', 'MANAGER', 'FINANCE', 'OPERATIONS']), validate(supplierPayableCreateSchema), supplierPayableController.createPayable);
router.post('/supplier-payables/:id/pay', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), validate(supplierPaymentExecuteSchema), supplierPayableController.payPayable);
router.get('/supplier-payables', requireRole(['ADMIN', 'MANAGER', 'FINANCE', 'OPERATIONS']), supplierPayableController.getPayables);

// 6. Commission Payouts
router.post('/commissions/payout', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), validate(commissionPayoutCreateSchema), commissionPayoutController.createCommissionPayout);
router.get('/commissions', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), commissionPayoutController.getCommissionPayouts);

// 7. Operational Expenses
router.post('/expenses', requireRole(['ADMIN', 'MANAGER', 'FINANCE', 'OPERATIONS']), validate(expenseCreateSchema), expenseVehicleController.createExpense);
router.get('/expenses', requireRole(['ADMIN', 'MANAGER', 'FINANCE', 'OPERATIONS']), expenseVehicleController.getExpenses);

// 8. Approvals Engine
router.post('/approvals/:entityType/:id/approve', requireRole(['ADMIN', 'MANAGER']), approvalWorkflowController.approveItem);
router.post('/approvals/:entityType/:id/reject', requireRole(['ADMIN', 'MANAGER']), validate(approvalActionSchema), approvalWorkflowController.rejectItem);
router.get('/approvals/pending', requireRole(['ADMIN', 'MANAGER']), approvalWorkflowController.listPendingApprovals);

// 9. Financial Reports & Dashboard Cards
router.get('/reports/executive-dashboard', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), financeReportController.getExecutiveDashboard);
router.get('/reports/summary', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), financeReportController.getFinancialSummaryReport);
router.get('/reports/bookings/:bookingId/summary', requireRole(['ADMIN', 'MANAGER', 'FINANCE', 'AGENT']), financeReportController.getBookingSummary);
router.get('/reports/departures/:departureInstanceId/profitability', requireRole(['ADMIN', 'MANAGER', 'FINANCE', 'OPERATIONS']), financeReportController.getDepartureProfitabilityReport);

module.exports = router;
