const mongoose = require('mongoose');
const { Booking } = require('../models/Pipeline');
const { BookingTraveler } = require('../models/BookingTraveler');
const { logActivity } = require('./activityService');
const { getContext } = require('../utils/context');

async function addTravelerToBooking(bookingId, travelerId, seatAssignment, roomAssignment, user) {
  const context = getContext();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      const err = new Error('Booking not found');
      err.isAppError = true;
      err.statusCode = 404;
      throw err;
    }

    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      const err = new Error(`Cannot add travelers to a ${booking.status} booking`);
      err.isAppError = true;
      err.statusCode = 400;
      throw err;
    }

    // Atomic guard: increment travelerCount only if it's less than seatsReserved
    const result = await Booking.updateOne(
      { _id: bookingId, travelerCount: { $lt: booking.seatsReserved } },
      { $inc: { travelerCount: 1 } },
      { session }
    );

    if (result.modifiedCount === 0) {
      const err = new Error('Cannot add traveler: booking seat limit reached.');
      err.isAppError = true;
      err.statusCode = 409;
      throw err;
    }

    // Now safe to create the BookingTraveler
    const [bookingTraveler] = await BookingTraveler.create([{
      bookingId,
      travelerId,
      seatAssignment,
      roomAssignment,
      branchId: context.branchId,
      companyId: context.companyId
    }], { session });

    await logActivity(
      bookingId,
      'Booking',
      'add_traveler',
      `Added traveler ${travelerId} to booking.`,
      user,
      session
    );

    await session.commitTransaction();
    return bookingTraveler;
  } catch (error) {
    await session.abortTransaction();
    if (error.code === 112 || (error.errorLabels && error.errorLabels.includes('TransientTransactionError'))) {
      const err = new Error('Concurrent traveler addition detected. Please try again.');
      err.isAppError = true;
      err.statusCode = 409;
      throw err;
    }
    throw error;
  } finally {
    session.endSession();
  }
}

async function removeTravelerFromBooking(bookingTravelerId, user) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bookingTraveler = await BookingTraveler.findById(bookingTravelerId).session(session);
    if (!bookingTraveler) {
      const err = new Error('BookingTraveler not found');
      err.isAppError = true;
      err.statusCode = 404;
      throw err;
    }

    if (bookingTraveler.status === 'Cancelled') {
      const err = new Error('Traveler is already cancelled from this booking');
      err.isAppError = true;
      err.statusCode = 400;
      throw err;
    }

    bookingTraveler.status = 'Cancelled';
    await bookingTraveler.save({ session });

    // Decrement travelerCount atomically
    await Booking.updateOne(
      { _id: bookingTraveler.bookingId },
      { $inc: { travelerCount: -1 } },
      { session }
    );

    await logActivity(
      bookingTraveler.bookingId,
      'Booking',
      'remove_traveler',
      `Removed traveler ${bookingTraveler.travelerId} from booking.`,
      user,
      session
    );

    await session.commitTransaction();
    return bookingTraveler;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

module.exports = {
  addTravelerToBooking,
  removeTravelerFromBooking
};
