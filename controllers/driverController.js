const driverService = require('../services/driverService');
const { driverProfileCreateSchema, driverProfileUpdateSchema } = require('../schemas/module5Schemas');
const { serializeDoc, serializeList } = require('../services/serialization');

async function createDriver(req, res, next) {
  try {
    const validated = driverProfileCreateSchema.parse(req.body);
    const { name, status, availability, ...profileData } = validated;
    const driver = await driverService.createDriver({ name, status, availability }, profileData, req.user);
    res.status(201).json(serializeDoc(driver));
  } catch (err) {
    next(err);
  }
}

async function updateDriver(req, res, next) {
  try {
    const validated = driverProfileUpdateSchema.parse(req.body);
    const { name, status, availability, ...profileData } = validated;
    const driver = await driverService.updateDriver(req.params.id, { name, status, availability }, profileData, req.user);
    res.status(200).json(serializeDoc(driver));
  } catch (err) {
    next(err);
  }
}

async function getDriver(req, res, next) {
  try {
    const driver = await driverService.getDriver(req.params.id, req.user);
    res.status(200).json(serializeDoc(driver));
  } catch (err) {
    next(err);
  }
}

async function listDrivers(req, res, next) {
  try {
    const drivers = await driverService.listDrivers(req.user);
    res.status(200).json(serializeList(drivers));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createDriver,
  updateDriver,
  getDriver,
  listDrivers
};
