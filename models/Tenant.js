const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true }
}, { timestamps: true });

const branchSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true }
}, { timestamps: true });

const Company = mongoose.model('Company', companySchema);
const Branch = mongoose.model('Branch', branchSchema);

module.exports = { Company, Branch };
