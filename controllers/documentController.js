const {
  renderInvoiceDocument,
  renderReceiptDocument,
  renderManifestDocument,
  renderVoucherDocument
} = require('../services/documentService');

async function getInvoiceDocument(req, res) {
  const data = await renderInvoiceDocument(req.params.id);
  res.json({ data });
}

async function getReceiptDocument(req, res) {
  const data = await renderReceiptDocument(req.params.id);
  res.json({ data });
}

async function getManifestDocument(req, res) {
  const data = await renderManifestDocument(req.params.departureInstanceId);
  res.json({ data });
}

async function getVoucherDocument(req, res) {
  const data = await renderVoucherDocument(req.params.bookingId);
  res.json({ data });
}

module.exports = {
  getInvoiceDocument,
  getReceiptDocument,
  getManifestDocument,
  getVoucherDocument
};
