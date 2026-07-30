const { generateInvoice } = require('../services/financialService');
const { Invoice } = require('../models/PaymentInvoice');
const { serializeDoc } = require('../services/serialization');

async function createInvoice(req, res) {
  const invoice = await generateInvoice(req.body.bookingId, req.body, req.user);
  res.status(201).json({
    message: 'Invoice created successfully',
    data: serializeDoc(invoice)
  });
}

async function getInvoiceById(req, res) {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    const err = new Error('Invoice not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }
  res.json({
    data: serializeDoc(invoice)
  });
}

async function getInvoiceByBooking(req, res) {
  const invoice = await Invoice.findOne({ bookingId: req.params.bookingId });
  if (!invoice) {
    const err = new Error('Invoice not found for this booking');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }
  res.json({
    data: serializeDoc(invoice)
  });
}

module.exports = {
  createInvoice,
  getInvoiceById,
  getInvoiceByBooking
};
