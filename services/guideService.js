const mongoose = require('mongoose');
const { Resource } = require('../models/Resource');
const { GuideProfile } = require('../models/GuideProfile');
const { logActivity } = require('./activityService');
const { getContext } = require('../utils/context');
const { buildOperationsViewQuery } = require('../utils/rbac');

async function createGuide(guideData, profileData, user) {
  const context = getContext();
  const session = await mongoose.startSession();
  let result;

  try {
    session.startTransaction();

    const [resource] = await Resource.create([{
      type: 'Guide',
      name: guideData.name,
      status: guideData.status || 'Active',
      availability: guideData.availability !== undefined ? guideData.availability : true,
      branchId: context.branchId,
      companyId: context.companyId
    }], { session });

    const [profile] = await GuideProfile.create([{
      resourceId: resource._id,
      certifications: profileData.certifications || [],
      languages: profileData.languages || [],
      rating: profileData.rating || 5.0,
      availability: profileData.availability !== undefined ? profileData.availability : true,
      branchId: context.branchId,
      companyId: context.companyId
    }], { session });

    await logActivity(resource._id, 'Resource', 'create', `Created Guide ${resource.name}`, user, session);

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

async function updateGuide(resourceId, guideData, profileData, user) {
  const session = await mongoose.startSession();
  let result;

  try {
    session.startTransaction();

    const query = { _id: resourceId, type: 'Guide', ...buildOperationsViewQuery(user) };
    const resource = await Resource.findOne(query).session(session);

    if (!resource) {
      const err = new Error('Guide resource not found');
      err.isAppError = true;
      err.statusCode = 404;
      throw err;
    }

    if (guideData.name) resource.name = guideData.name;
    if (guideData.status) resource.status = guideData.status;
    if (guideData.availability !== undefined) resource.availability = guideData.availability;
    await resource.save({ session });

    let profile = await GuideProfile.findOne({ resourceId: resource._id }).session(session);
    if (!profile) {
      [profile] = await GuideProfile.create([{
        resourceId: resource._id,
        branchId: resource.branchId,
        companyId: resource.companyId
      }], { session });
    }

    if (profileData.certifications) profile.certifications = profileData.certifications;
    if (profileData.languages) profile.languages = profileData.languages;
    if (profileData.rating !== undefined) profile.rating = profileData.rating;
    if (profileData.availability !== undefined) profile.availability = profileData.availability;

    await profile.save({ session });
    await logActivity(resource._id, 'Resource', 'update', `Updated Guide ${resource.name}`, user, session);

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

async function getGuide(resourceId, user) {
  const query = { _id: resourceId, type: 'Guide', ...buildOperationsViewQuery(user) };
  const resource = await Resource.findOne(query).lean();
  if (!resource) {
    const err = new Error('Guide resource not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }
  const profile = await GuideProfile.findOne({ resourceId: resource._id }).lean();
  return { ...resource, profile: profile || null };
}

async function listGuides(user) {
  const query = { type: 'Guide', ...buildOperationsViewQuery(user) };
  const resources = await Resource.find(query).sort({ name: 1 }).lean();
  const resourceIds = resources.map(r => r._id);
  const profiles = await GuideProfile.find({ resourceId: { $in: resourceIds } }).lean();

  const profileMap = new Map(profiles.map(p => [p.resourceId.toString(), p]));
  return resources.map(r => ({
    ...r,
    profile: profileMap.get(r._id.toString()) || null
  }));
}

module.exports = {
  createGuide,
  updateGuide,
  getGuide,
  listGuides
};
