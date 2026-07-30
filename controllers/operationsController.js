const { Booking } = require('../models/Pipeline');
const { BookingTraveler } = require('../models/BookingTraveler');
const { Assignment } = require('../models/Resource');
const { DepartureInstance } = require('../models/Product');
const { buildOperationsViewQuery } = require('../utils/rbac');
const { logActivity } = require('../services/activityService');

exports.getManifest = async (req, res) => {
  const departureInstanceId = req.params.departureInstanceId;
  const query = buildOperationsViewQuery(req.user);

  // 1. Verify access to this departure instance
  const departureQuery = { _id: departureInstanceId, ...query };
  const departure = await DepartureInstance.findOne(departureQuery);
  
  if (!departure) {
    const err = new Error('DepartureInstance not found or access denied');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }

  // 2. Fetch all Bookings for this departure (that are not cancelled)
  const bookings = await Booking.find({
    departureInstanceId,
    status: { $in: ['PENDING', 'CONFIRMED', 'COMPLETED', 'WAITLISTED'] },
    ...query
  }).lean();

  const bookingIds = bookings.map(b => b._id);

  // 3. Fetch BookingTravelers for those bookings
  const travelers = await BookingTraveler.find({
    bookingId: { $in: bookingIds },
    status: 'Active'
  }).populate('travelerId').lean();

  // 4. Fetch Assigned Resources
  const assignments = await Assignment.find({
    departureInstanceId,
    ...query
  }).populate('resourceId').lean();

  // Map travelers back to their bookings, stripping encrypted sensitive PII
  const bookingsWithTravelers = bookings.map(booking => {
    return {
      ...booking,
      travelers: travelers
        .filter(t => String(t.bookingId) === String(booking._id))
        .map(t => ({
          _id: t._id,
          bookingId: t.bookingId,
          seatAssignment: t.seatAssignment,
          roomAssignment: t.roomAssignment,
          status: t.status,
          boardingStatus: t.boardingStatus || 'NOT_BOARDED',
          boardedAt: t.boardedAt || null,
          traveler: t.travelerId ? {
            _id: t.travelerId._id,
            name: t.travelerId.name || `${t.travelerId.firstName || ''} ${t.travelerId.lastName || ''}`.trim(),
            email: t.travelerId.email,
            phone: t.travelerId.phone
          } : null
        }))
    };
  });

  res.json({
    data: {
      departure,
      bookings: bookingsWithTravelers,
      assignments
    }
  });
};

exports.boardTraveler = async (req, res) => {
  const { departureInstanceId, travelerId } = req.params;
  const query = buildOperationsViewQuery(req.user);

  // Verify access to departure
  const departure = await DepartureInstance.findOne({ _id: departureInstanceId, ...query });
  if (!departure) {
    const err = new Error('DepartureInstance not found or access denied');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }

  // Find active bookings for departure
  const bookings = await Booking.find({
    departureInstanceId,
    status: { $in: ['PENDING', 'CONFIRMED', 'COMPLETED', 'WAITLISTED'] }
  }).select('_id').lean();

  const bookingIds = bookings.map(b => b._id);

  // Find matching BookingTraveler document
  const bookingTraveler = await BookingTraveler.findOne({
    bookingId: { $in: bookingIds },
    $or: [{ _id: travelerId }, { travelerId: travelerId }],
    status: 'Active'
  }).populate('travelerId');

  if (!bookingTraveler) {
    const err = new Error('Traveler not found on this departure manifest');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }

  // Idempotent boarding check
  if (bookingTraveler.boardingStatus === 'BOARDED') {
    return res.status(200).json({
      message: 'Traveler already boarded',
      data: {
        _id: bookingTraveler._id,
        boardingStatus: bookingTraveler.boardingStatus,
        boardedAt: bookingTraveler.boardedAt,
        traveler: bookingTraveler.travelerId ? {
          _id: bookingTraveler.travelerId._id,
          name: bookingTraveler.travelerId.name || `${bookingTraveler.travelerId.firstName || ''} ${bookingTraveler.travelerId.lastName || ''}`.trim()
        } : null
      }
    });
  }

  bookingTraveler.boardingStatus = 'BOARDED';
  bookingTraveler.boardedAt = new Date();
  await bookingTraveler.save();

  const travelerName = bookingTraveler.travelerId ? (bookingTraveler.travelerId.name || bookingTraveler.travelerId.firstName || travelerId) : travelerId;
  await logActivity(departure._id, 'DepartureInstance', 'board_traveler', `Boarded traveler ${travelerName}`, req.user);

  return res.status(200).json({
    message: 'Traveler boarded successfully',
    data: {
      _id: bookingTraveler._id,
      boardingStatus: bookingTraveler.boardingStatus,
      boardedAt: bookingTraveler.boardedAt,
      traveler: bookingTraveler.travelerId ? {
        _id: bookingTraveler.travelerId._id,
        name: bookingTraveler.travelerId.name || `${bookingTraveler.travelerId.firstName || ''} ${bookingTraveler.travelerId.lastName || ''}`.trim()
      } : null
    }
  });
};
