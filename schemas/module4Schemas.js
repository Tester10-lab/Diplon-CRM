const { z } = require('zod');

const paymentCreateSchema = z.object({
  bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid bookingId'),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'ESEWA', 'KHALTI', 'FONEPAY', 'CONNECT_IPS', 'OTHER']),
  transactionRef: z.string().optional(),
  currency: z.string().default('NPR'),
  exchangeRate: z.number().positive().default(1),
  notes: z.string().optional()
});

const invoiceCreateSchema = z.object({
  bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid bookingId'),
  dueDate: z.string().optional(),
  currency: z.string().default('NPR'),
  notes: z.string().optional()
});

const supplierPayableCreateSchema = z.object({
  supplierName: z.string().min(1, 'Supplier name is required'),
  supplierCategory: z.enum(['HOTEL', 'TRANSPORT', 'AIRLINE', 'GUIDE', 'ENTRANCE_FEES', 'OTHER']),
  departureInstanceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid departureInstanceId').optional(),
  bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid bookingId').optional(),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.string().optional(),
  currency: z.string().default('NPR'),
  notes: z.string().optional()
}).refine(data => data.departureInstanceId || data.bookingId, {
  message: 'Either departureInstanceId or bookingId must be provided for supplier payable'
});

const supplierPaymentExecuteSchema = z.object({
  amount: z.number().positive('Payment amount must be positive'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'ESEWA', 'KHALTI', 'FONEPAY', 'CONNECT_IPS', 'OTHER']),
  transactionRef: z.string().optional(),
  notes: z.string().optional()
});

const commissionPayoutCreateSchema = z.object({
  payeeType: z.enum(['EMPLOYEE', 'PARTNER']),
  payeeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid payeeId'),
  commissionLedgerIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1, 'At least one commission ledger ID is required'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'ESEWA', 'KHALTI', 'FONEPAY', 'CONNECT_IPS', 'OTHER']),
  transactionRef: z.string().optional(),
  notes: z.string().optional()
});

module.exports = {
  paymentCreateSchema,
  invoiceCreateSchema,
  supplierPayableCreateSchema,
  supplierPaymentExecuteSchema,
  commissionPayoutCreateSchema
};
