const mongoose = require('mongoose');
const { Resource } = require('../models/Resource');
const { DriverProfile } = require('../models/DriverProfile');
const { logActivity } = require('./activityService');
const { getContext } = require('../utils/context');
const { buildOperationsViewQuery } = require('../utils/rbac');

async function createDriver(driverData, profileData, user) {
  const context = getContext();
  const session = await mongoose.startSession();
  let result;

  try {
    session.startTransaction();

    // Unique license number per company
    const existing = await DriverProfile.findOne({
      companyId: context.companyId,
      licenseNumber: profileData.licenseNumber
    }).session(session);

    if (existing) {
      const err = new Error(`Driver with license ${profileData.licenseNumber} already exists`);
      err.isAppError = true;
      err.statusCode = 409;
      throw err;
    }

    const [resource] = await Resource.create([{
      type: 'Driver',
      name: driverData.name,
      status: driverData.status || 'Active',
      availability: driverData.availability !== undefined ? driverData.availability : true,
      branchId: context.branchId,
      companyId: context.companyId
    }], { session });

    const [profile] = await DriverProfile.create([{
      resourceId: resource._id,
      licenseNumber: profileData.licenseNumber,
      licenseExpiry: profileData.licenseExpiry ? new Date(profileData.licenseExpiry) : undefined,
      leaveBalance: profileData.leaveBalance || 0,
      performanceRating: profileData.performanceRating || 5.0,
      documents: profileData.documents || [],
      branchId: context.branchId,
      companyId: context.companyId
    }], { session });

    await logActivity(resource._id, 'Resource', 'create', `Created Driver ${resource.name} (${profile.licenseNumber})`, user, session);

    await session.commitTransaction();
    result = { ...resource.toObject(), profile: profile.toObject() };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  return result;
}

async function updateDriver(resourceId, driverData, profileData, user) {
  const session = await mongoose.startSession();
  let result;

  try {
    session.startTransaction();

    const query = { _id: resourceId, type: 'Driver', ...buildOperationsViewQuery(user) };
    const resource = await Resource.findOne(query).session(session);

    if (!resource) {
      const err = new Error('Driver resource not found');
      err.isAppError = true;
      err.statusCode = 404;
      throw err;
    }

    if (driverData.name) resource.name = driverData.name;
    if (driverData.status) resource.status = driverData.status;
    if (driverData.availability !== undefined) resource.availability = driverData.availability;
    await resource.save({ session });

    let profile = await DriverProfile.findOne({ resourceId: resource._id }).session(session);
    if (!profile) {
      [profile] = await DriverProfile.create([{
        resourceId: resource._id,
        licenseNumber: profileData.licenseNumber || 'N/A',
        branchId: resource.branchId,
        companyId: resource.companyId
      }], { session });
    }

    if (profileData.licenseNumber) profile.licenseNumber = profileData.licenseNumber;
    if (profileData.licenseExpiry) profile.licenseExpiry = new Date(profileData.licenseExpiry);
    if (profileData.leaveBalance !== undefined) profile.leaveBalance = profileData.leaveBalance;
    if (profileData.performanceRating !== undefined) profile.performanceRating = profileData.performanceRating;
    if (profileData.documents) profile.documents = profileData.documents;

    await profile.save({ session });
    await logActivity(resource._id, 'Resource', 'update', `Updated Driver ${resource.name}`, user, session);

    await session.commitTransaction();
    result = { ...resource.toObject(), profile: profile.toObject() };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  return result;
}

async function getDriver(resourceId, user) {
  const query = { _id: resourceId, type: 'Driver', ...buildOperationsViewQuery(user) };
  const resource = await Resource.findOne(query).lean();
  if (!resource) {
    const err = new Error('Driver resource not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }
  const profile = await DriverProfile.findOne({ resourceId: resource._id }).lean();
  return { ...resource, profile: profile || null };
}

async function listDrivers(user) {
  const query = { type: 'Driver', ...buildOperationsViewQuery(user) };
  const resources = await Resource.find(query).sort({ name: 1 }).lean();
  const resourceIds = resources.map(r => r._id);
  const profiles = await DriverProfile.find({ resourceId: { $in: resourceIds } }).lean();

  const profileMap = new Map(profiles.map(p => [p.resourceId.toString(), p]));
  return resources.map(r => ({
    ...r,
    profile: profileMap.get(r._id.toString()) || null
  }));
}

module.exports = {
  createDriver,
  updateDriver,
  getDriver,
  listDrivers
};
