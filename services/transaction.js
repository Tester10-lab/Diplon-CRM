const mongoose = require('mongoose');
const { Booking } = require('../models/Pipeline');
const { BookingTraveler } = require('../models/BookingTraveler');
const { DepartureInstance } = require('../models/Product');
const { TourLedger } = require('../models/Ledger');
const { getContext } = require('../utils/context');

async function createBookingWithTransaction(bookingData, seatsReserved, amount) {
  const context = getContext();
  const session = await mongoose.startSession();
  
  let result;
  
  try {
    session.startTransaction();
    
    // 1. Decrement seats atomically
    const departure = await DepartureInstance.findOneAndUpdate(
      { _id: bookingData.departureInstanceId, seatsAvailable: { $gte: seatsReserved } },
      { $inc: { seatsAvailable: -seatsReserved } },
      { session, new: true }
    );
    
    if (!departure) {
      const err = new Error('No seats available for this departure');
      err.isAppError = true;
      err.statusCode = 409;
      throw err;
    }

    // 2. Create Booking
    const [booking] = await Booking.create([{
      ...bookingData,
      seatsReserved,
      travelerCount: 0,
      branchId: context.branchId,
      companyId: context.companyId,
    }], { session });

    // 3. Ledger Entry
    await TourLedger.create([{
      entityId: departure._id,
      amount,
      type: 'credit',
      reason: 'Booking Creation',
      refId: booking._id,
      createdBy: context.employeeId,
      branchId: context.branchId,
      companyId: context.companyId,
    }], { session });
    
    await session.commitTransaction();
    result = booking;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
  
  return result;
}

module.exports = { createBookingWithTransaction };
