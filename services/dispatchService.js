const { assignResource } = require('./assignmentService');
const { VehicleProfile } = require('../models/VehicleProfile');
const { DepartureInstance } = require('../models/Product');
const { Booking } = require('../models/Pipeline');
const { BookingTraveler } = require('../models/BookingTraveler');

async function assignDispatchResource(resourceId, departureInstanceId, role, user) {
  if (role === 'VEHICLE' || role === 'BACKUP_VEHICLE') {
    const vehicleProfile = await VehicleProfile.findOne({ resourceId }).lean();
    if (vehicleProfile && vehicleProfile.seatingCapacity) {
      // Calculate total travelers reserved for this departure
      const activeBookings = await Booking.find({
        departureInstanceId,
        status: { $nin: ['Cancelled'] }
      }).select('_id seatsReserved').lean();

      const bookingIds = activeBookings.map(b => b._id);

      // Count active travelers on these bookings, or fallback to seatsReserved sum
      const travelerCount = await BookingTraveler.countDocuments({
        bookingId: { $in: bookingIds },
        status: 'Active'
      });

      const totalSeatsReserved = activeBookings.reduce((sum, b) => sum + (b.seatsReserved || 1), 0);
      const effectiveTravelerCount = travelerCount > 0 ? travelerCount : totalSeatsReserved;

      if (effectiveTravelerCount > vehicleProfile.seatingCapacity) {
        const err = new Error(`Vehicle seating capacity (${vehicleProfile.seatingCapacity}) is less than departure traveler count (${effectiveTravelerCount})`);
        err.isAppError = true;
        err.statusCode = 409;
        throw err;
      }
    }
  }

  // Delegate to assignmentService for transactional availability and overlap check
  return await assignResource(resourceId, departureInstanceId, user, role);
}

module.exports = {
  assignDispatchResource
};
