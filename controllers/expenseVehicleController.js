const {
  recordOperationalExpense,
  recordDriverStaffLedger,
  recordVehicleCost,
  getVehicleProfitability
} = require('../services/expenseVehicleService');
const { Expense } = require('../models/OperationalExpense');
const { DriverStaffLedger, VehicleCost } = require('../models/StaffVehicleLedger');
const { serializeDoc, serializeList } = require('../services/serialization');

async function createExpense(req, res) {
  const expense = await recordOperationalExpense(req.body, req.user);
  res.status(201).json({ message: 'Expense recorded', data: serializeDoc(expense) });
}

async function getExpenses(req, res) {
  const query = {};
  if (req.query.category) query.category = req.query.category;
  if (req.query.approvalStatus) query.approvalStatus = req.query.approvalStatus;
  const expenses = await Expense.find(query).sort({ createdAt: -1 });
  res.json({ data: serializeList(expenses) });
}

async function createStaffLedger(req, res) {
  const ledger = await recordDriverStaffLedger(req.body, req.user);
  res.status(201).json({ message: 'Staff/Driver ledger recorded', data: serializeDoc(ledger) });
}

async function getStaffLedgers(req, res) {
  const query = {};
  if (req.query.staffId) query.staffId = req.query.staffId;
  const ledgers = await DriverStaffLedger.find(query).sort({ createdAt: -1 });
  res.json({ data: serializeList(ledgers) });
}

async function createVehicleCost(req, res) {
  const cost = await recordVehicleCost(req.body, req.user);
  res.status(201).json({ message: 'Vehicle cost logged', data: serializeDoc(cost) });
}

async function getVehicleCosts(req, res) {
  const query = {};
  if (req.query.resourceId) query.resourceId = req.query.resourceId;
  const costs = await VehicleCost.find(query).sort({ createdAt: -1 });
  res.json({ data: serializeList(costs) });
}

async function getVehicleProfitabilityReport(req, res) {
  const report = await getVehicleProfitability(req.params.resourceId);
  res.json({ data: report });
}

module.exports = {
  createExpense,
  getExpenses,
  createStaffLedger,
  getStaffLedgers,
  createVehicleCost,
  getVehicleCosts,
  getVehicleProfitabilityReport
};
