const guideService = require('../services/guideService');
const { guideProfileCreateSchema, guideProfileUpdateSchema } = require('../schemas/module5Schemas');
const { serializeDoc, serializeList } = require('../services/serialization');

async function createGuide(req, res, next) {
  try {
    const validated = guideProfileCreateSchema.parse(req.body);
    const { name, status, availability, ...profileData } = validated;
    const guide = await guideService.createGuide({ name, status, availability }, profileData, req.user);
    res.status(201).json(serializeDoc(guide));
  } catch (err) {
    next(err);
  }
}

async function updateGuide(req, res, next) {
  try {
    const validated = guideProfileUpdateSchema.parse(req.body);
    const { name, status, availability, ...profileData } = validated;
    const guide = await guideService.updateGuide(req.params.id, { name, status, availability }, profileData, req.user);
    res.status(200).json(serializeDoc(guide));
  } catch (err) {
    next(err);
  }
}

async function getGuide(req, res, next) {
  try {
    const guide = await guideService.getGuide(req.params.id, req.user);
    res.status(200).json(serializeDoc(guide));
  } catch (err) {
    next(err);
  }
}

async function listGuides(req, res, next) {
  try {
    const guides = await guideService.listGuides(req.user);
    res.status(200).json(serializeList(guides));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createGuide,
  updateGuide,
  getGuide,
  listGuides
};
