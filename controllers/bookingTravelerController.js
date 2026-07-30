const { addTravelerToBooking, removeTravelerFromBooking } = require('../services/bookingTravelerService');
const { bookingTravelerCreateSchema } = require('../schemas/module3Schemas');
const { Booking } = require('../models/Pipeline');
const { buildViewQuery, buildOperationsViewQuery } = require('../utils/rbac');

exports.addTraveler = async (req, res) => {
  const parsed = bookingTravelerCreateSchema.parse(req.body);
  
  // Verify access to the Booking before manipulating travelers
  const query = req.user.role === 'OPERATIONS'
    ? { _id: parsed.bookingId, ...buildOperationsViewQuery(req.user) }
    : { _id: parsed.bookingId, ...buildViewQuery(req.user) };

  const booking = await Booking.findOne(query);
  if (!booking) {
    const err = new Error('Booking not found or access denied');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }

  const traveler = await addTravelerToBooking(
    parsed.bookingId,
    parsed.travelerId,
    parsed.seatAssignment,
    parsed.roomAssignment,
    req.user
  );
  
  res.status(201).json({ data: traveler });
};

exports.removeTraveler = async (req, res) => {
  const result = await removeTravelerFromBooking(req.params.id, req.user);
  res.json({ data: result });
};
