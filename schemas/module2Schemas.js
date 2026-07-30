const { z } = require('zod');

const createPackageSchema = {
  body: z.object({
    name: z.string().min(1),
    itinerary: z.string().optional(),
    basePricing: z.number().nonnegative(),
    cancellationPolicyId: z.string().length(24).optional(),
    refundPolicyId: z.string().length(24).optional()
  }).strict()
};

const updatePackageSchema = {
  body: z.object({
    name: z.string().min(1).optional(),
    itinerary: z.string().optional(),
    basePricing: z.number().nonnegative().optional(),
    cancellationPolicyId: z.string().length(24).optional(),
    refundPolicyId: z.string().length(24).optional()
  }).strict()
};

const createDepartureSchema = {
  body: z.object({
    packageId: z.string().length(24),
    seatsTotal: z.number().int().positive(),
    startDate: z.string().datetime(), // ISO string
    endDate: z.string().datetime(),
    cancellationPolicyIdOverride: z.string().length(24).optional()
  }).strict()
};

const updateDepartureStatusSchema = {
  body: z.object({
    status: z.enum(['Active', 'Completed', 'Cancelled'])
  }).strict()
};

const updateDepartureCapacitySchema = {
  body: z.object({
    seatsTotal: z.number().int().positive()
  }).strict()
};

const createResourceSchema = {
  body: z.object({
    type: z.enum(['Vehicle', 'Guide', 'Driver']),
    name: z.string().min(1),
    status: z.enum(['Active', 'Inactive']).optional(),
    availability: z.boolean().optional(),
    details: z.record(z.any()).optional()
  }).strict()
};

const updateResourceSchema = {
  body: z.object({
    name: z.string().min(1).optional(),
    status: z.enum(['Active', 'Inactive']).optional(),
    availability: z.boolean().optional(),
    details: z.record(z.any()).optional()
  }).strict()
};

const createAssignmentSchema = {
  body: z.object({
    resourceId: z.string().length(24),
    departureInstanceId: z.string().length(24)
  }).strict()
};

module.exports = {
  createPackageSchema,
  updatePackageSchema,
  createDepartureSchema,
  updateDepartureStatusSchema,
  updateDepartureCapacitySchema,
  createResourceSchema,
  updateResourceSchema,
  createAssignmentSchema
};
