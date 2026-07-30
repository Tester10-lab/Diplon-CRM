const mongoose = require('mongoose');
const { scopingPlugin } = require('../plugins/scoping');

const DocumentMetadataSchema = new mongoose.Schema({
  docNumber: { type: String, required: true },
  docType: {
    type: String,
    enum: ['INVOICE', 'RECEIPT', 'MANIFEST', 'VOUCHER', 'CREDIT_NOTE', 'DEBIT_NOTE'],
    required: true
  },
  refId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Booking ID, Payment ID, DepartureInstance ID, etc.
  pdfUrl: { type: String, default: '' },
  downloadUrl: { type: String, default: '' },
  qrPayload: { type: String, default: '' },
  barcodePayload: { type: String, default: '' },
  status: { type: String, enum: ['GENERATED', 'VOID', 'ARCHIVED'], default: 'GENERATED' },
  generatedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

DocumentMetadataSchema.plugin(scopingPlugin);

const DocumentMetadata = mongoose.model('DocumentMetadata', DocumentMetadataSchema);

module.exports = {
  DocumentMetadata
};
