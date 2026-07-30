const { z } = require('zod');

const paymentAllocationSchema = z.object({
  invoiceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid invoiceId'),
  allocatedAmount: z.number().positive('Allocated amount must be positive')
});

const paymentWithAllocationsCreateSchema = z.object({
  bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid bookingId').optional(),
  customerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid customerId').optional(),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'ESEWA', 'KHALTI', 'FONEPAY', 'CONNECT_IPS', 'OTHER']),
  transactionRef: z.string().optional(),
  currency: z.string().default('NPR'),
  exchangeRate: z.number().positive().default(1),
  allocations: z.array(paymentAllocationSchema).optional(),
  notes: z.string().optional()
});

const creditDebitNoteCreateSchema = z.object({
  type: z.enum(['CREDIT', 'DEBIT']),
  invoiceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid invoiceId'),
  bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid bookingId').optional(),
  amount: z.number().positive('Amount must be positive'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional()
});

const expenseCreateSchema = z.object({
  category: z.enum(['FUEL', 'OFFICE', 'MARKETING', 'INTERNET', 'SALARY', 'MAINTENANCE', 'MISC']),
  subCategory: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'ESEWA', 'KHALTI', 'FONEPAY', 'CONNECT_IPS', 'OTHER']),
  vehicleId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  driverId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  transactionRef: z.string().optional(),
  notes: z.string().optional()
});

const staffLedgerCreateSchema = z.object({
  staffId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid staffId'),
  type: z.enum(['SALARY', 'ALLOWANCE', 'ADVANCE', 'FUEL', 'PENALTY', 'SETTLEMENT']),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'ESEWA', 'KHALTI', 'FONEPAY', 'CONNECT_IPS', 'OTHER']),
  transactionRef: z.string().optional(),
  notes: z.string().optional()
});

const vehicleCostCreateSchema = z.object({
  resourceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid resourceId (Vehicle)'),
  costType: z.enum(['INSURANCE', 'BLUEBOOK', 'TAX', 'FUEL', 'MAINTENANCE', 'REPAIR', 'TYRES', 'SERVICE']),
  amount: z.number().positive('Amount must be positive'),
  mileageKm: z.number().nonnegative().optional(),
  vendorName: z.string().optional(),
  notes: z.string().optional()
});

const approvalActionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  comments: z.string().optional()
});

module.exports = {
  paymentWithAllocationsCreateSchema,
  creditDebitNoteCreateSchema,
  expenseCreateSchema,
  staffLedgerCreateSchema,
  vehicleCostCreateSchema,
  approvalActionSchema
};
