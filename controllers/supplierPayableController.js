const { recordSupplierPayable, paySupplierBill } = require('../services/financialService');
const { SupplierPayable } = require('../models/SupplierPayable');
const { serializeDoc, serializeList } = require('../services/serialization');

async function createPayable(req, res) {
  const payable = await recordSupplierPayable(req.body, req.user);
  res.status(201).json({
    message: 'Supplier payable registered successfully',
    data: serializeDoc(payable)
  });
}

async function payPayable(req, res) {
  const updatedPayable = await paySupplierBill(req.params.id, req.body, req.user);
  res.json({
    message: 'Supplier payment recorded successfully',
    data: serializeDoc(updatedPayable)
  });
}

async function getPayables(req, res) {
  const query = {};
  if (req.query.departureInstanceId) {
    query.departureInstanceId = req.query.departureInstanceId;
  }
  if (req.query.bookingId) {
    query.bookingId = req.query.bookingId;
  }
  if (req.query.status) {
    query.status = req.query.status;
  }

  const payables = await SupplierPayable.find(query).sort({ createdAt: -1 });
  res.json({
    data: serializeList(payables)
  });
}

module.exports = {
  createPayable,
  payPayable,
  getPayables
};
