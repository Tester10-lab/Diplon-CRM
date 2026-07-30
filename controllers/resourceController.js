const { Resource } = require('../models/Resource');
const { buildOperationsViewQuery } = require('../utils/rbac');
const { logActivity } = require('../services/activityService');

exports.createResource = async (req, res) => {
  const user = req.user;

  const resource = new Resource({
    ...req.body,
    branchId: user.branchId,
    companyId: user.companyId
  });

  await resource.save();
  await logActivity(resource._id, 'Resource', 'create', `Resource ${resource.name} created`, user);

  res.status(201).json({ data: resource });
};

exports.updateResource = async (req, res) => {
  const query = { _id: req.params.id, ...buildOperationsViewQuery(req.user) };
  const resource = await Resource.findOne(query);

  if (!resource) {
    const err = new Error('Resource not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }

  Object.assign(resource, req.body);
  await resource.save();

  await logActivity(resource._id, 'Resource', 'update', `Resource updated`, req.user);

  res.json({ data: resource });
};

exports.listResources = async (req, res) => {
  const query = buildOperationsViewQuery(req.user);
  
  if (req.query.type) {
    query.type = req.query.type;
  }
  
  if (req.query.status) {
    query.status = req.query.status;
  }

  if (req.query.availability !== undefined) {
    query.availability = req.query.availability === 'true';
  }

  const resources = await Resource.find(query).sort({ createdAt: -1 });

  res.json({ data: resources });
};
