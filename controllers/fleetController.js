const fleetService = require('../services/fleetService');
const expenseVehicleService = require('../services/expenseVehicleService');
const { vehicleProfileCreateSchema, vehicleProfileUpdateSchema } = require('../schemas/module5Schemas');
const { serializeDoc, serializeList } = require('../services/serialization');

async function createVehicle(req, res, next) {
  try {
    const validated = vehicleProfileCreateSchema.parse(req.body);
    const { name, status, availability, ...profileData } = validated;
    const vehicle = await fleetService.createVehicle({ name, status, availability }, profileData, req.user);
    res.status(201).json(serializeDoc(vehicle));
  } catch (err) {
    next(err);
  }
}

async function updateVehicle(req, res, next) {
  try {
    const validated = vehicleProfileUpdateSchema.parse(req.body);
    const { name, status, availability, ...profileData } = validated;
    const vehicle = await fleetService.updateVehicle(req.params.id, { name, status, availability }, profileData, req.user);
    res.status(200).json(serializeDoc(vehicle));
  } catch (err) {
    next(err);
  }
}

async function getVehicle(req, res, next) {
  try {
    const vehicle = await fleetService.getVehicle(req.params.id, req.user);
    res.status(200).json(serializeDoc(vehicle));
  } catch (err) {
    next(err);
  }
}

async function listVehicles(req, res, next) {
  try {
    const vehicles = await fleetService.listVehicles(req.user);
    res.status(200).json(serializeList(vehicles));
  } catch (err) {
    next(err);
  }
}

async function getVehicleProfitability(req, res, next) {
  try {
    const profitability = await expenseVehicleService.getVehicleProfitability(req.params.id);
    res.status(200).json(serializeDoc(profitability));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createVehicle,
  updateVehicle,
  getVehicle,
  listVehicles,
  getVehicleProfitability
};
