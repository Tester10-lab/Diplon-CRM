const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const vehicleProfileCreateSchema = z.object({
  name: z.string().min(1, 'Vehicle name is required'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  seatingCapacity: z.number().int().positive('Seating capacity must be a positive integer'),
  bluebookExpiry: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  taxExpiry: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).default('Active'),
  availability: z.boolean().default(true)
}).strict();

const vehicleProfileUpdateSchema = z.object({
  name: z.string().optional(),
  registrationNumber: z.string().optional(),
  seatingCapacity: z.number().int().positive().optional(),
  bluebookExpiry: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  taxExpiry: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
  availability: z.boolean().optional()
}).strict();

const driverProfileCreateSchema = z.object({
  name: z.string().min(1, 'Driver name is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseExpiry: z.string().optional(),
  leaveBalance: z.number().default(0),
  performanceRating: z.number().min(0).max(5).default(5.0),
  documents: z.array(z.object({
    type: z.string(),
    url: z.string(),
    expiryDate: z.string().optional()
  })).optional(),
  status: z.enum(['Active', 'Inactive']).default('Active'),
  availability: z.boolean().default(true)
}).strict();

const driverProfileUpdateSchema = z.object({
  name: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.string().optional(),
  leaveBalance: z.number().optional(),
  performanceRating: z.number().min(0).max(5).optional(),
  documents: z.array(z.object({
    type: z.string(),
    url: z.string(),
    expiryDate: z.string().optional()
  })).optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
  availability: z.boolean().optional()
}).strict();

const guideProfileCreateSchema = z.object({
  name: z.string().min(1, 'Guide name is required'),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).default(5.0),
  status: z.enum(['Active', 'Inactive']).default('Active'),
  availability: z.boolean().default(true)
}).strict();

const guideProfileUpdateSchema = z.object({
  name: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
  availability: z.boolean().optional()
}).strict();

const dispatchAssignSchema = z.object({
  resourceId: z.string().regex(objectIdRegex, 'Invalid resourceId'),
  role: z.enum(['DRIVER', 'GUIDE', 'VEHICLE', 'BACKUP_VEHICLE', 'UNSPECIFIED']).default('UNSPECIFIED')
}).strict();

const operationsNoteCreateSchema = z.object({
  type: z.enum(['NOTE', 'ALERT']).default('NOTE'),
  message: z.string().min(1, 'Message is required')
}).strict();

module.exports = {
  vehicleProfileCreateSchema,
  vehicleProfileUpdateSchema,
  driverProfileCreateSchema,
  driverProfileUpdateSchema,
  guideProfileCreateSchema,
  guideProfileUpdateSchema,
  dispatchAssignSchema,
  operationsNoteCreateSchema
};
