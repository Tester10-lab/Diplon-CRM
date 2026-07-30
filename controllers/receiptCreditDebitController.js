const { createCreditNote, createDebitNote } = require('../services/receiptCreditDebitService');
const { Receipt, CreditNote, DebitNote } = require('../models/ReceiptCreditDebit');
const { serializeDoc, serializeList } = require('../services/serialization');

async function getReceipts(req, res) {
  const query = {};
  if (req.query.bookingId) query.bookingId = req.query.bookingId;
  if (req.query.paymentId) query.paymentId = req.query.paymentId;
  const receipts = await Receipt.find(query).sort({ createdAt: -1 });
  res.json({ data: serializeList(receipts) });
}

async function addCreditNote(req, res) {
  const note = await createCreditNote(req.body, req.user);
  res.status(201).json({ message: 'Credit note created and applied', data: serializeDoc(note) });
}

async function addDebitNote(req, res) {
  const note = await createDebitNote(req.body, req.user);
  res.status(201).json({ message: 'Debit note created and applied', data: serializeDoc(note) });
}

async function getCreditNotes(req, res) {
  const query = {};
  if (req.query.invoiceId) query.invoiceId = req.query.invoiceId;
  const notes = await CreditNote.find(query).sort({ createdAt: -1 });
  res.json({ data: serializeList(notes) });
}

module.exports = {
  getReceipts,
  addCreditNote,
  addDebitNote,
  getCreditNotes
};
