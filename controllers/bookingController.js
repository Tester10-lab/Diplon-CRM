const { Booking } = require('../models/Pipeline');
const { createBooking, cancelBooking, promoteWaitlist } = require('../services/bookingService');
const { buildViewQuery, buildOperationsViewQuery } = require('../utils/rbac');
const { bookingCreateSchema } = require('../schemas/module3Schemas');

exports.createBooking = async (req, res) => {
  const parsed = bookingCreateSchema.parse(req.body);
  const booking = await createBooking(parsed.quotationId, parsed.departureInstanceId, parsed.seatsReserved, req.user);
  res.status(201).json({ data: booking });
};

exports.listBookings = async (req, res) => {
  // If the user is OPERATIONS, they need to see bookings for the manifest via Operations query.
  // Otherwise, use the standard CRM view query (which respects AGENT ownership)
  const query = req.user.role === 'OPERATIONS' 
    ? buildOperationsViewQuery(req.user) 
    : buildViewQuery(req.user);

  if (req.query.status) {
    query.status = req.query.status;
  }
  if (req.query.departureInstanceId) {
    query.departureInstanceId = req.query.departureInstanceId;
  }

  const bookings = await Booking.find(query).sort({ createdAt: -1 });
  res.json({ data: bookings });
};

exports.getBooking = async (req, res) => {
  const query = req.user.role === 'OPERATIONS'
    ? { _id: req.params.id, ...buildOperationsViewQuery(req.user) }
    : { _id: req.params.id, ...buildViewQuery(req.user) };

  const booking = await Booking.findOne(query);
  if (!booking) {
    const err = new Error('Booking not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }
  res.json({ data: booking });
};

exports.cancelBooking = async (req, res) => {
  const query = { _id: req.params.id, ...buildViewQuery(req.user) };
  const booking = await Booking.findOne(query);
  if (!booking) {
    const err = new Error('Booking not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }
  
  const cancelledBooking = await cancelBooking(booking._id, req.user);
  res.json({ data: cancelledBooking });
};

exports.promoteWaitlist = async (req, res) => {
  const query = { _id: req.params.id, ...buildViewQuery(req.user) };
  const booking = await Booking.findOne(query);
  if (!booking) {
    const err = new Error('Booking not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }
  
  const promotedBooking = await promoteWaitlist(booking._id, req.user);
  res.json({ data: promotedBooking });
};
