const { z } = require('zod');

// We explicitly reject server-derived fields by using `.strict()` and omitting them from the schema.
// A Zod strict schema will throw a validation error (400) if ANY unknown keys are provided.

const createLeadSchema = {
  body: z.object({
    customerId: z.string().length(24),
    status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'CONVERTED']).optional()
  }).strict()
};

const updateLeadSchema = {
  body: z.object({
    status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'CONVERTED']).optional()
  }).strict()
};

const createInquirySchema = {
  body: z.object({
    customerId: z.string().length(24),
    status: z.enum(['NEW', 'IN_PROGRESS', 'QUOTED', 'CLOSED', 'CONVERTED']).optional()
  }).strict()
};

const updateInquirySchema = {
  body: z.object({
    status: z.enum(['NEW', 'IN_PROGRESS', 'QUOTED', 'CLOSED', 'CONVERTED']).optional()
  }).strict()
};

const updateQuotationSchema = {
  body: z.object({
    packageId: z.string().length(24).optional(),
    totalAmount: z.number().positive().optional()
  }).strict()
};

const acceptRejectQuotationSchema = {
  // Empty body strict forces the client to send {} and nothing else (preventing injection of fields)
  body: z.object({}).strict()
};

module.exports = {
  createLeadSchema,
  updateLeadSchema,
  createInquirySchema,
  updateInquirySchema,
  updateQuotationSchema,
  acceptRejectQuotationSchema
};
