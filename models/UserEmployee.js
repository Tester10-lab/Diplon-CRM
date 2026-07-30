const mongoose = require('mongoose');
const { scopingPlugin, restrictFields, assertNotSelfEdit } = require('../plugins/scoping');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['SUPER_ADMIN', 'SUPER ADMIN', 'ADMIN', 'MANAGER', 'AGENT', 'OPERATIONS', 'FINANCE', 'AGENCY', 'DRIVER'], required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.plugin(scopingPlugin);
const User = mongoose.model('User', userSchema);

const employeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Nullable
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true },
  designation: { type: String, required: true },
  salesTarget: { type: Number, default: 0 },
  commissionRate: { type: Number, default: 0 },
  leaveBalance: { type: Number, default: 0 }
}, { timestamps: true });

employeeSchema.plugin(scopingPlugin);
employeeSchema.plugin(restrictFields, { fields: ['salesTarget', 'commissionRate'], allowedRoles: ['SUPER_ADMIN', 'SUPER ADMIN', 'ADMIN', 'MANAGER'] });
employeeSchema.plugin(assertNotSelfEdit, { fields: ['salesTarget', 'commissionRate'] });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = { User, Employee };
