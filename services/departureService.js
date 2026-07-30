const { DepartureInstance } = require('../models/Product');
const { logActivity } = require('./activityService');
const mongoose = require('mongoose');

async function adjustCapacity(departureInstanceId, newSeatsTotal, user) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const instance = await DepartureInstance.findById(departureInstanceId).session(session);

    if (!instance) {
      const err = new Error('DepartureInstance not found');
      err.isAppError = true;
      err.statusCode = 404;
      throw err;
    }

    if (instance.status === 'Cancelled' || instance.status === 'Completed') {
      const err = new Error(`Cannot adjust capacity on a ${instance.status} departure`);
      err.isAppError = true;
      err.statusCode = 400;
      throw err;
    }

    const seatsBooked = instance.seatsTotal - instance.seatsAvailable;
    
    // HARD BLOCK: Cannot reduce capacity below currently booked seats
    if (newSeatsTotal < seatsBooked) {
      const err = new Error(`Cannot reduce capacity below currently booked seats (${seatsBooked})`);
      err.isAppError = true;
      err.statusCode = 400;
      throw err;
    }

    // Atomic update to ensure no race conditions change seatsAvailable during this logic.
    // Known Limitation: `difference` is computed against a stale `instance.seatsTotal`.
    // If two admins simultaneously adjust capacity, both `$inc` values apply, resulting 
    // in a final capacity that neither admin explicitly requested (though it will still remain safe/positive).
    const difference = newSeatsTotal - instance.seatsTotal;
    
    // updateOne filter guarantees seatsAvailable at the moment of write must be able to absorb this change without going negative
    const result = await DepartureInstance.updateOne(
      { _id: instance._id, seatsAvailable: { $gte: -difference } }, 
      { 
        $inc: { 
          seatsTotal: difference, 
          seatsAvailable: difference 
        } 
      },
      { session }
    );

    if (result.modifiedCount === 0) {
      const err = new Error('Concurrent modification detected. Please try again.');
      err.isAppError = true;
      err.statusCode = 409;
      throw err;
    }

    await logActivity(
      instance._id, 
      'DepartureInstance', 
      'update_capacity', 
      `Adjusted capacity from ${instance.seatsTotal} to ${newSeatsTotal}`, 
      user, 
      session
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

module.exports = {
  adjustCapacity
};
