const mongoose = require('mongoose');
const { Booking, Quotation } = require('../models/Pipeline');
const { DepartureInstance } = require('../models/Product');
const { createBookingWithTransaction } = require('./transaction');
const { logActivity } = require('./activityService');

async function createBooking(quotationId, departureInstanceId, seatsReserved, user) {
  const quotation = await Quotation.findById(quotationId).lean();
  
  if (!quotation) {
    const err = new Error('Quotation not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }

  if (quotation.status !== 'ACCEPTED') {
    const err = new Error('Cannot create a Booking from a Quotation that is not ACCEPTED');
    err.isAppError = true;
    err.statusCode = 409;
    throw err;
  }

  const bookingData = {
    customerId: quotation.customerId,
    partnerId: quotation.partnerId,
    assignedTo: quotation.assignedTo,
    convertedFromQuotationId: quotation._id,
    packageId: quotation.packageId,
    departureInstanceId,
    status: 'PENDING'
  };

  const booking = await createBookingWithTransaction(bookingData, seatsReserved, quotation.totalAmount);
  
  await logActivity(
    booking._id,
    'Booking',
    'create',
    `Booking created from Quotation ${quotationId} with ${seatsReserved} reserved seats`,
    user
  );

  return booking;
}

async function cancelBooking(bookingId, user) {
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

    if (booking.status === 'CANCELLED') {
      const err = new Error('Booking is already cancelled');
      err.isAppError = true;
      err.statusCode = 400;
      throw err;
    }

    // 1. Release seats atomically
    // Using increment of booking.seatsReserved (not a hardcoded +1)
    const wasWaitlisted = booking.status === 'WAITLISTED';

    if (!wasWaitlisted) {
      await DepartureInstance.updateOne(
        { _id: booking.departureInstanceId },
        { $inc: { seatsAvailable: booking.seatsReserved } },
        { session }
      );
    }

    // 2. Mark as Cancelled
    booking.status = 'CANCELLED';
    await booking.save({ session });

    // 3. (Optional) Log activity inside transaction
    await logActivity(
      booking._id,
      'Booking',
      'cancel',
      `Booking cancelled. Released ${wasWaitlisted ? 0 : booking.seatsReserved} seats.`,
      user,
      session
    );

    await session.commitTransaction();
    return booking;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function promoteWaitlist(bookingId, user) {
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

    if (booking.status !== 'WAITLISTED') {
      const err = new Error('Only WAITLISTED bookings can be promoted');
      err.isAppError = true;
      err.statusCode = 400;
      throw err;
    }

    // Atomic conditional decrement against DepartureInstance
    const departure = await DepartureInstance.findOneAndUpdate(
      { _id: booking.departureInstanceId, seatsAvailable: { $gte: booking.seatsReserved } },
      { $inc: { seatsAvailable: -booking.seatsReserved } },
      { session, new: true }
    );

    if (!departure) {
      const err = new Error('Not enough seats available to promote this waitlisted booking');
      err.isAppError = true;
      err.statusCode = 409;
      throw err;
    }

    booking.status = 'PENDING';
    await booking.save({ session });

    await logActivity(
      booking._id,
      'Booking',
      'promote',
      `Booking promoted from Waitlist. Reserved ${booking.seatsReserved} seats.`,
      user,
      session
    );

    await session.commitTransaction();
    return booking;
  } catch (error) {
    await session.abortTransaction();
    if (error.code === 112 || (error.errorLabels && error.errorLabels.includes('TransientTransactionError'))) {
      const err = new Error('Concurrent promotion attempt detected. Please try again.');
      err.isAppError = true;
      err.statusCode = 409;
      throw err;
    }
    throw error;
  } finally {
    session.endSession();
  }
}

module.exports = {
  createBooking,
  cancelBooking,
  promoteWaitlist
};
