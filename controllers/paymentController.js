const { recordCustomerPayment } = require('../services/financialService');
const { Payment } = require('../models/PaymentInvoice');
const { serializeDoc, serializeList } = require('../services/serialization');

async function createPayment(req, res) {
  const payment = await recordCustomerPayment(req.body, req.user);
  res.status(201).json({
    message: 'Payment recorded successfully',
    data: serializeDoc(payment)
  });
}

async function getPaymentsByBooking(req, res) {
  const payments = await Payment.find({ bookingId: req.params.bookingId }).sort({ createdAt: -1 });
  res.json({
    data: serializeList(payments)
  });
}

module.exports = {
  createPayment,
  getPaymentsByBooking
};
