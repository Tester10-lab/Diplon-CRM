const { Quotation } = require('../models/Pipeline');
const { buildViewQuery, hasWriteAccess } = require('../utils/rbac');
const { logActivity } = require('../services/activityService');
const { serializeCustomerOrTraveler } = require('../services/serialization');

exports.listQuotations = async (req, res) => {
  const query = buildViewQuery(req.user);
  
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const quotations = await Quotation.find(query)
    .populate('customerId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const masked = await Promise.all(quotations.map(async (q) => {
    const qObj = q.toObject();
    if (qObj.customerId) {
      qObj.customerId = await serializeCustomerOrTraveler(qObj.customerId, 'Customer', false);
    }
    return qObj;
  }));

  res.json({ data: masked, page, limit });
};

exports.getQuotation = async (req, res) => {
  const query = { _id: req.params.id, ...buildViewQuery(req.user) };
  const quotation = await Quotation.findOne(query).populate('customerId');

  if (!quotation) {
    const err = new Error('Quotation not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }

  const qObj = quotation.toObject();
  if (qObj.customerId) {
    qObj.customerId = await serializeCustomerOrTraveler(qObj.customerId, 'Customer', true);
  }

  res.json({ data: qObj });
};

exports.updateQuotation = async (req, res) => {
  const query = { _id: req.params.id, ...buildViewQuery(req.user) };
  const quotation = await Quotation.findOne(query);

  if (!quotation) {
    const err = new Error('Quotation not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }

  if (!hasWriteAccess(req.user, quotation)) {
    const err = new Error('Forbidden: You do not have write access to this Quotation');
    err.isAppError = true;
    err.statusCode = 403;
    throw err;
  }

  Object.assign(quotation, req.body);
  await quotation.save();

  await logActivity(quotation._id, 'Quotation', 'update', 'Quotation updated', req.user);

  res.json({ data: quotation });
};

exports.acceptQuotation = async (req, res) => {
  const query = { _id: req.params.id, ...buildViewQuery(req.user) };
  const quotation = await Quotation.findOne(query);

  if (!quotation) {
    const err = new Error('Quotation not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }

  if (quotation.status !== 'DRAFT' && quotation.status !== 'SENT') {
    const err = new Error('Only DRAFT or SENT quotations can be accepted');
    err.isAppError = true;
    err.statusCode = 400;
    throw err;
  }

  quotation.status = 'ACCEPTED';
  await quotation.save();

  await logActivity(quotation._id, 'Quotation', 'update', 'Quotation accepted', req.user);

  res.json({ data: quotation });
};

exports.rejectQuotation = async (req, res) => {
  const query = { _id: req.params.id, ...buildViewQuery(req.user) };
  const quotation = await Quotation.findOne(query);

  if (!quotation) {
    const err = new Error('Quotation not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }

  if (quotation.status !== 'DRAFT' && quotation.status !== 'SENT') {
    const err = new Error('Only DRAFT or SENT quotations can be rejected');
    err.isAppError = true;
    err.statusCode = 400;
    throw err;
  }

  quotation.status = 'REJECTED';
  await quotation.save();

  await logActivity(quotation._id, 'Quotation', 'update', 'Quotation rejected', req.user);

  res.json({ data: quotation });
};
