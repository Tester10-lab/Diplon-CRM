const { Lead } = require('../models/Pipeline');
const { buildViewQuery, hasWriteAccess } = require('../utils/rbac');
const { logActivity } = require('../services/activityService');
const { convertLeadToInquiry } = require('../services/crmService');
const { serializeCustomerOrTraveler } = require('../services/serialization');

exports.createLead = async (req, res) => {
  const user = req.user;
  
  const leadData = {
    ...req.body,
    branchId: user.branchId,
    companyId: user.companyId,
    assignedTo: user.employeeId,
    status: req.body.status || 'NEW'
  };

  const lead = new Lead(leadData);
  await lead.save();

  await logActivity(lead._id, 'Lead', 'create', 'Lead created manually', user);

  res.status(201).json({ data: lead });
};

exports.listLeads = async (req, res) => {
  const query = buildViewQuery(req.user);
  
  // Basic pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const leads = await Lead.find(query)
    .populate('customerId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Apply PII Masking
  const maskedLeads = await Promise.all(leads.map(async (lead) => {
    const leadObj = lead.toObject();
    if (leadObj.customerId) {
      // Allow viewing PII if the user has write access to this specific lead, or based on some other logic?
      // The prompt says: "List views use serializeCustomerOrTraveler masking where Customer data is embedded"
      // we'll default to canViewPII = false for list views to be safe, or conditionally true.
      leadObj.customerId = await serializeCustomerOrTraveler(leadObj.customerId, 'Customer', false);
    }
    return leadObj;
  }));

  res.json({ data: maskedLeads, page, limit });
};

exports.getLead = async (req, res) => {
  const query = { _id: req.params.id, ...buildViewQuery(req.user) };
  const lead = await Lead.findOne(query).populate('customerId');

  if (!lead) {
    const err = new Error('Lead not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }

  // Get view - show PII if they have full access? Let's just return the masked for consistency if needed, 
  // but usually GET /id shows full data if they have access.
  const leadObj = lead.toObject();
  if (leadObj.customerId) {
    leadObj.customerId = await serializeCustomerOrTraveler(leadObj.customerId, 'Customer', true);
  }

  res.json({ data: leadObj });
};

exports.updateLead = async (req, res) => {
  const query = { _id: req.params.id, ...buildViewQuery(req.user) };
  const lead = await Lead.findOne(query);

  if (!lead) {
    const err = new Error('Lead not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }

  if (!hasWriteAccess(req.user, lead)) {
    const err = new Error('Forbidden: You do not have write access to this Lead');
    err.isAppError = true;
    err.statusCode = 403;
    throw err;
  }

  Object.assign(lead, req.body);
  await lead.save();

  await logActivity(lead._id, 'Lead', 'update', 'Lead updated', req.user);

  res.json({ data: lead });
};

exports.convertToInquiry = async (req, res) => {
  const query = { _id: req.params.id, ...buildViewQuery(req.user) };
  const lead = await Lead.findOne(query);

  if (!lead) {
    const err = new Error('Lead not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }

  if (!hasWriteAccess(req.user, lead)) {
    const err = new Error('Forbidden: You do not have write access to this Lead');
    err.isAppError = true;
    err.statusCode = 403;
    throw err;
  }

  const inquiry = await convertLeadToInquiry(lead._id, req.user);
  res.status(201).json({ data: inquiry });
};
