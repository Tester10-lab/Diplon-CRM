const { DocumentMetadata } = require('../models/DocumentMetadata');
const { Invoice, Payment } = require('../models/PaymentInvoice');
const { Booking } = require('../models/Pipeline');
const { DepartureInstance } = require('../models/Product');
const { Receipt } = require('../models/ReceiptCreditDebit');
const { getContext } = require('../utils/context');

async function generateOrGetDocument(docType, refId, user) {
  const context = getContext();

  const existing = await DocumentMetadata.findOne({ docType, refId });
  if (existing) {
    return existing;
  }

  let docNumber = `${docType.slice(0, 3)}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  let qrPayload = `https://diploncrm.internal/verify-doc/${docType}/${refId}`;
  let barcodePayload = `*${docNumber}*`;

  if (docType === 'INVOICE') {
    const inv = await Invoice.findById(refId);
    if (inv) docNumber = inv.invoiceNumber;
  } else if (docType === 'RECEIPT') {
    const rec = await Receipt.findById(refId);
    if (rec) docNumber = rec.receiptNumber;
  }

  const pdfUrl = `/api/documents/${docType.toLowerCase()}s/${refId}/pdf`;
  const downloadUrl = `/api/documents/${docType.toLowerCase()}s/${refId}/download`;

  const metadata = await DocumentMetadata.create({
    docNumber,
    docType,
    refId,
    pdfUrl,
    downloadUrl,
    qrPayload,
    barcodePayload,
    status: 'GENERATED',
    createdBy: context.employeeId,
    branchId: context.branchId,
    companyId: context.companyId
  });

  return metadata;
}

async function renderInvoiceDocument(invoiceId) {
  const invoice = await Invoice.findById(invoiceId).populate('bookingId');
  if (!invoice) {
    const err = new Error('Invoice not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }
  const metadata = await generateOrGetDocument('INVOICE', invoice._id);
  return {
    document: metadata,
    invoice,
    htmlTemplateStub: `<html><body><h1>INVOICE ${invoice.invoiceNumber}</h1><p>Total: NPR ${invoice.totalAmount}</p><p>Paid: NPR ${invoice.paidAmount}</p><p>Balance Due: NPR ${invoice.balanceDue}</p></body></html>`
  };
}

async function renderReceiptDocument(receiptId) {
  const receipt = await Receipt.findById(receiptId).populate('paymentId');
  if (!receipt) {
    const err = new Error('Receipt not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }
  const metadata = await generateOrGetDocument('RECEIPT', receipt._id);
  return {
    document: metadata,
    receipt,
    htmlTemplateStub: `<html><body><h1>RECEIPT ${receipt.receiptNumber}</h1><p>Amount Paid: NPR ${receipt.amount}</p><p>Payment Date: ${receipt.issuedAt}</p></body></html>`
  };
}

async function renderManifestDocument(departureInstanceId) {
  const departure = await DepartureInstance.findById(departureInstanceId).populate('packageId');
  if (!departure) {
    const err = new Error('Departure instance not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }
  const metadata = await generateOrGetDocument('MANIFEST', departure._id);
  return {
    document: metadata,
    departure,
    htmlTemplateStub: `<html><body><h1>TOUR MANIFEST - ${departure.packageId ? departure.packageId.name : 'Tour'}</h1><p>Departure Date: ${departure.startDate}</p></body></html>`
  };
}

async function renderVoucherDocument(bookingId) {
  const booking = await Booking.findById(bookingId).populate('packageId').populate('customerId');
  if (!booking) {
    const err = new Error('Booking not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }
  const metadata = await generateOrGetDocument('VOUCHER', booking._id);
  return {
    document: metadata,
    booking,
    htmlTemplateStub: `<html><body><h1>TOUR CONFIRMATION VOUCHER</h1><p>Booking ID: ${booking._id}</p><p>Seats Reserved: ${booking.seatsReserved}</p></body></html>`
  };
}

module.exports = {
  generateOrGetDocument,
  renderInvoiceDocument,
  renderReceiptDocument,
  renderManifestDocument,
  renderVoucherDocument
};
