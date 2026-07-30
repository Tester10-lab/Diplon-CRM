const mongoose = require('mongoose');
const { Resource } = require('../models/Resource');
const { VehicleProfile } = require('../models/VehicleProfile');
const { logActivity } = require('./activityService');
const { getContext } = require('../utils/context');
const { buildOperationsViewQuery } = require('../utils/rbac');

async function createVehicle(vehicleData, profileData, user) {
  const context = getContext();
  const session = await mongoose.startSession();
  let result;

  try {
    session.startTransaction();

    // Check unique registration number per company
    const existing = await VehicleProfile.findOne({
      companyId: context.companyId,
      registrationNumber: profileData.registrationNumber
    }).session(session);

    if (existing) {
      const err = new Error(`Vehicle with registration ${profileData.registrationNumber} already exists`);
      err.isAppError = true;
      err.statusCode = 409;
      throw err;
    }

    const [resource] = await Resource.create([{
      type: 'Vehicle',
      name: vehicleData.name,
      status: vehicleData.status || 'Active',
      availability: vehicleData.availability !== undefined ? vehicleData.availability : true,
      branchId: context.branchId,
      companyId: context.companyId
    }], { session });

    const [profile] = await VehicleProfile.create([{
      resourceId: resource._id,
      registrationNumber: profileData.registrationNumber,
      seatingCapacity: profileData.seatingCapacity,
      bluebookExpiry: profileData.bluebookExpiry ? new Date(profileData.bluebookExpiry) : undefined,
      insuranceExpiry: profileData.insuranceExpiry ? new Date(profileData.insuranceExpiry) : undefined,
      taxExpiry: profileData.taxExpiry ? new Date(profileData.taxExpiry) : undefined,
      branchId: context.branchId,
      companyId: context.companyId
    }], { session });

    await logActivity(resource._id, 'Resource', 'create', `Created Vehicle ${resource.name} (${profile.registrationNumber})`, user, session);

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

async function updateVehicle(resourceId, vehicleData, profileData, user) {
  const context = getContext();
  const session = await mongoose.startSession();
  let result;

  try {
    session.startTransaction();

    const query = { _id: resourceId, type: 'Vehicle', ...buildOperationsViewQuery(user) };
    const resource = await Resource.findOne(query).session(session);

    if (!resource) {
      const err = new Error('Vehicle resource not found');
      err.isAppError = true;
      err.statusCode = 404;
      throw err;
    }

    if (vehicleData.name) resource.name = vehicleData.name;
    if (vehicleData.status) resource.status = vehicleData.status;
    if (vehicleData.availability !== undefined) resource.availability = vehicleData.availability;
    await resource.save({ session });

    let profile = await VehicleProfile.findOne({ resourceId: resource._id }).session(session);
    if (!profile) {
      [profile] = await VehicleProfile.create([{
        resourceId: resource._id,
        registrationNumber: profileData.registrationNumber || 'N/A',
        seatingCapacity: profileData.seatingCapacity || 1,
        branchId: context.branchId,
        companyId: context.companyId
      }], { session });
    }

    if (profileData.registrationNumber) profile.registrationNumber = profileData.registrationNumber;
    if (profileData.seatingCapacity) profile.seatingCapacity = profileData.seatingCapacity;
    if (profileData.bluebookExpiry) profile.bluebookExpiry = new Date(profileData.bluebookExpiry);
    if (profileData.insuranceExpiry) profile.insuranceExpiry = new Date(profileData.insuranceExpiry);
    if (profileData.taxExpiry) profile.taxExpiry = new Date(profileData.taxExpiry);

    await profile.save({ session });
    await logActivity(resource._id, 'Resource', 'update', `Updated Vehicle ${resource.name}`, user, session);

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

async function getVehicle(resourceId, user) {
  const query = { _id: resourceId, type: 'Vehicle', ...buildOperationsViewQuery(user) };
  const resource = await Resource.findOne(query).lean();
  if (!resource) {
    const err = new Error('Vehicle resource not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }
  const profile = await VehicleProfile.findOne({ resourceId: resource._id }).lean();
  return { ...resource, profile: profile || null };
}

async function listVehicles(user) {
  const query = { type: 'Vehicle', ...buildOperationsViewQuery(user) };
  const resources = await Resource.find(query).sort({ name: 1 }).lean();
  const resourceIds = resources.map(r => r._id);
  const profiles = await VehicleProfile.find({ resourceId: { $in: resourceIds } }).lean();

  const profileMap = new Map(profiles.map(p => [p.resourceId.toString(), p]));
  return resources.map(r => ({
    ...r,
    profile: profileMap.get(r._id.toString()) || null
  }));
}

module.exports = {
  createVehicle,
  updateVehicle,
  getVehicle,
  listVehicles
};
