const mongoose = require('mongoose');
const crypto = require('crypto');
const { scopingPlugin } = require('../plugins/scoping');

const isTestEnv = process.env.NODE_ENV === 'test';
if (!process.env.ENCRYPTION_KEY && !isTestEnv) {
  throw new Error('FATAL: ENCRYPTION_KEY environment variable is not defined.');
}

const encKey = process.env.ENCRYPTION_KEY || (isTestEnv ? 'MdIPFuzCwuEFWqYuigCs9FJlKWkuXs4SAHD1ZSH/R/Q=' : '');

const customerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

customerSchema.plugin(scopingPlugin);
const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

const travelerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  passportNumber: { type: String },
  phone: { type: String },
  nationality: { type: String },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

travelerSchema.plugin(scopingPlugin);

function encryptField(val) {
  if (!val || typeof val !== 'string' || val.startsWith('enc:')) return val;
  const key = Buffer.from(encKey, 'base64').subarray(0, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(val, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `enc:${iv.toString('hex')}:${encrypted}`;
}

function decryptField(val) {
  if (!val || typeof val !== 'string' || !val.startsWith('enc:')) return val;
  try {
    const parts = val.split(':');
    const iv = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];
    const key = Buffer.from(encKey, 'base64').subarray(0, 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    return val;
  }
}

travelerSchema.pre('save', function() {
  if (this.isModified('passportNumber') && this.passportNumber) {
    this.passportNumber = encryptField(this.passportNumber);
  }
});

travelerSchema.post('init', function(doc) {
  if (doc && doc.passportNumber) {
    doc.passportNumber = decryptField(doc.passportNumber);
  }
});

const Traveler = mongoose.models.Traveler || mongoose.model('Traveler', travelerSchema);

module.exports = { Customer, Traveler };
