const { z } = require('zod');

const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  }).strict()
};

const registerUserSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'AGENT', 'OPERATIONS', 'FINANCE', 'DRIVER', 'AGENCY']),
    branchId: z.string().length(24),
    companyId: z.string().length(24),
    designation: z.string().optional().default('Staff Member'),
    salesTarget: z.number().nonnegative().optional().default(0),
    commissionRate: z.number().nonnegative().optional().default(0)
  }).strict()
};

module.exports = {
  loginSchema,
  registerUserSchema
};
