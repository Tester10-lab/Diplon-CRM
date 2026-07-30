const mongoose = require('mongoose');
const { scopingPlugin } = require('../plugins/scoping');

const guideProfileSchema = new mongoose.Schema({
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true, unique: true },
  certifications: [{ type: String }],
  languages: [{ type: String }],
  rating: { type: Number, default: 5.0, min: 0, max: 5 },
  availability: { type: Boolean, default: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

guideProfileSchema.plugin(scopingPlugin);

const GuideProfile = mongoose.model('GuideProfile', guideProfileSchema);

module.exports = { GuideProfile };
