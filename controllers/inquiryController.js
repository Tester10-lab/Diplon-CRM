const { Inquiry } = require('../models/Pipeline');
const { buildViewQuery, hasWriteAccess } = require('../utils/rbac');
const { logActivity } = require('../services/activityService');
const { convertInquiryToQuotation } = require('../services/crmService');
const { serializeCustomerOrTraveler } = require('../services/serialization');

exports.createInquiry = async (req, res) => {
  const user = req.user;
  
  const inquiryData = {
    ...req.body,
    branchId: user.branchId,
    companyId: user.companyId,
    assignedTo: user.employeeId,
    status: req.body.status || 'NEW'
  };

  const inquiry = new Inquiry(inquiryData);
  await inquiry.save();

  await logActivity(inquiry._id, 'Inquiry', 'create', 'Inquiry created manually', user);

  res.status(201).json({ data: inquiry });
};

exports.listInquiries = async (req, res) => {
  const query = buildViewQuery(req.user);
  
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const inquiries = await Inquiry.find(query)
    .populate('customerId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const maskedInquiries = await Promise.all(inquiries.map(async (inq) => {
    const inqObj = inq.toObject();
    if (inqObj.customerId) {
      inqObj.customerId = await serializeCustomerOrTraveler(inqObj.customerId, 'Customer', false);
    }
    return inqObj;
  }));

  res.json({ data: maskedInquiries, page, limit });
};

exports.getInquiry = async (req, res) => {
  const query = { _id: req.params.id, ...buildViewQuery(req.user) };
  const inquiry = await Inquiry.findOne(query).populate('customerId');

  if (!inquiry) {
    const err = new Error('Inquiry not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }

  const inqObj = inquiry.toObject();
  if (inqObj.customerId) {
    inqObj.customerId = await serializeCustomerOrTraveler(inqObj.customerId, 'Customer', true);
  }

  res.json({ data: inqObj });
};

exports.updateInquiry = async (req, res) => {
  const query = { _id: req.params.id, ...buildViewQuery(req.user) };
  const inquiry = await Inquiry.findOne(query);

  if (!inquiry) {
    const err = new Error('Inquiry not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }

  if (!hasWriteAccess(req.user, inquiry)) {
    const err = new Error('Forbidden: You do not have write access to this Inquiry');
    err.isAppError = true;
    err.statusCode = 403;
    throw err;
  }

  Object.assign(inquiry, req.body);
  await inquiry.save();

  await logActivity(inquiry._id, 'Inquiry', 'update', 'Inquiry updated', req.user);

  res.json({ data: inquiry });
};

exports.convertToQuotation = async (req, res) => {
  const query = { _id: req.params.id, ...buildViewQuery(req.user) };
  const inquiry = await Inquiry.findOne(query);

  if (!inquiry) {
    const err = new Error('Inquiry not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }

  if (!hasWriteAccess(req.user, inquiry)) {
    const err = new Error('Forbidden: You do not have write access to this Inquiry');
    err.isAppError = true;
    err.statusCode = 403;
    throw err;
  }

  const quotation = await convertInquiryToQuotation(inquiry._id, req.user);
  res.status(201).json({ data: quotation });
};
