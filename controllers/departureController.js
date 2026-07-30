const { DepartureInstance } = require('../models/Product');
const { buildOperationsViewQuery } = require('../utils/rbac');
const { adjustCapacity } = require('../services/departureService');
const { logActivity } = require('../services/activityService');

exports.createDeparture = async (req, res) => {
  const user = req.user;

  // Validation rule: Date must not be in the past
  const startDate = new Date(req.body.startDate);
  if (startDate < new Date()) {
    const err = new Error('Departure start date cannot be in the past');
    err.isAppError = true;
    err.statusCode = 400;
    throw err;
  }

  const endDate = new Date(req.body.endDate);
  if (endDate < startDate) {
    const err = new Error('Departure end date must be after start date');
    err.isAppError = true;
    err.statusCode = 400;
    throw err;
  }

  const departure = new DepartureInstance({
    ...req.body,
    seatsAvailable: req.body.seatsTotal, // Initially seatsAvailable = seatsTotal
    branchId: user.branchId,
    companyId: user.companyId
  });

  await departure.save();
  await logActivity(departure._id, 'DepartureInstance', 'create', 'Departure instance created', user);

  res.status(201).json({ data: departure });
};

exports.listDepartures = async (req, res) => {
  const query = buildOperationsViewQuery(req.user);
  
  if (req.query.status) {
    query.status = req.query.status;
  }
  
  // Date filters for upcoming/history
  if (req.query.fromDate || req.query.toDate) {
    query.startDate = {};
    if (req.query.fromDate) query.startDate.$gte = new Date(req.query.fromDate);
    if (req.query.toDate) query.startDate.$lte = new Date(req.query.toDate);
  }

  const departures = await DepartureInstance.find(query).sort({ startDate: 1 });
  res.json({ data: departures });
};

exports.getDeparture = async (req, res) => {
  const query = { _id: req.params.id, ...buildOperationsViewQuery(req.user) };
  const departure = await DepartureInstance.findOne(query).populate('packageId');
  if (!departure) {
    const err = new Error('DepartureInstance not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }
  res.json({ data: departure });
};

exports.updateStatus = async (req, res) => {
  const query = { _id: req.params.id, ...buildOperationsViewQuery(req.user) };
  const departure = await DepartureInstance.findOne(query);

  if (!departure) {
    const err = new Error('DepartureInstance not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }

  if (departure.status === 'Cancelled' || departure.status === 'Completed') {
    const err = new Error('Terminal status cannot be changed');
    err.isAppError = true;
    err.statusCode = 400;
    throw err;
  }

  departure.status = req.body.status;
  await departure.save();

  await logActivity(departure._id, 'DepartureInstance', 'update_status', `Status changed to ${departure.status}`, req.user);

  res.json({ data: departure });
};

exports.adjustCapacity = async (req, res) => {
  // Check if they can view it first
  const query = { _id: req.params.id, ...buildOperationsViewQuery(req.user) };
  const departure = await DepartureInstance.findOne(query);

  if (!departure) {
    const err = new Error('DepartureInstance not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }

  await adjustCapacity(departure._id, req.body.seatsTotal, req.user);

  const updatedDeparture = await DepartureInstance.findById(departure._id);
  res.json({ data: updatedDeparture });
};
