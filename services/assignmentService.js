const mongoose = require('mongoose');
const { Assignment, Resource } = require('../models/Resource');
const { DepartureInstance } = require('../models/Product');
const { logActivity } = require('./activityService');

async function assignResource(resourceId, departureInstanceId, user, role = 'UNSPECIFIED') {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const resource = await Resource.findById(resourceId).session(session);
    if (!resource) {
      const err = new Error('Resource not found');
      err.isAppError = true;
      err.statusCode = 404;
      throw err;
    }
    
    if (!resource.availability || resource.status !== 'Active') {
      const err = new Error('Resource is not active or available');
      err.isAppError = true;
      err.statusCode = 400;
      throw err;
    }

    const targetDeparture = await DepartureInstance.findById(departureInstanceId).session(session);
    if (!targetDeparture) {
      const err = new Error('DepartureInstance not found');
      err.isAppError = true;
      err.statusCode = 404;
      throw err;
    }

    if (targetDeparture.status === 'Cancelled' || targetDeparture.status === 'Completed') {
      const err = new Error(`Cannot assign resource to a ${targetDeparture.status} departure`);
      err.isAppError = true;
      err.statusCode = 400;
      throw err;
    }

    // Overlap Check
    // Find all active assignments for this resource
    const existingAssignments = await Assignment.find({ resourceId: resource._id, status: { $ne: 'CANCELLED' } }).session(session);
    
    if (existingAssignments.length > 0) {
      const existingInstanceIds = existingAssignments.map(a => a.departureInstanceId);
      // Check if any of these instances overlap with the target departure's date range
      // Overlap condition: (StartA <= EndB) and (EndA >= StartB)
      const overlappingInstances = await DepartureInstance.find({
        _id: { $in: existingInstanceIds },
        status: { $nin: ['Cancelled'] }, // Ignored if cancelled
        startDate: { $lte: targetDeparture.endDate },
        endDate: { $gte: targetDeparture.startDate }
      }).session(session);

      if (overlappingInstances.length > 0) {
        const err = new Error(`Resource is double-booked. Overlaps with departure ${overlappingInstances[0]._id}`);
        err.isAppError = true;
        err.statusCode = 409;
        throw err;
      }
    }

    const assignment = new Assignment({
      resourceId: resource._id,
      departureInstanceId: targetDeparture._id,
      role,
      status: 'ASSIGNED',
      createdBy: user.employeeId || user._id,
      branchId: user.branchId,
      companyId: user.companyId
    });

    await assignment.save({ session });

    await logActivity(targetDeparture._id, 'DepartureInstance', 'assign_resource', `Assigned resource ${resource.name}`, user, session);
    
    await session.commitTransaction();
    return assignment;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

module.exports = {
  assignResource
};
