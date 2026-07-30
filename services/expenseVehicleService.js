const mongoose = require('mongoose');
const { Expense } = require('../models/OperationalExpense');
const { DriverStaffLedger, VehicleCost } = require('../models/StaffVehicleLedger');
const { FinancialLedger } = require('../models/Ledger');
const { Assignment } = require('../models/Resource');
const { getContext } = require('../utils/context');

async function recordOperationalExpense(expenseData, user) {
  const context = getContext();
  const session = await mongoose.startSession();
  let resultExpense;

  try {
    session.startTransaction();

    const expenseNumber = `EXP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const [expense] = await Expense.create([{
      ...expenseData,
      expenseNumber,
      approvalStatus: expenseData.amount > 50000 ? 'PENDING_APPROVAL' : 'APPROVED',
      createdBy: context.employeeId,
      branchId: context.branchId,
      companyId: context.companyId
    }], { session });

    // If approved immediately, log to FinancialLedger
    if (expense.approvalStatus === 'APPROVED') {
      await FinancialLedger.create([{
        amount: expense.amount,
        type: 'debit',
        category: 'OTHER',
        reason: `Operational Expense (${expense.category}): ${expense.subCategory || expenseNumber}`,
        refId: expense._id,
        currency: expense.currency || 'NPR',
        createdBy: context.employeeId,
        branchId: context.branchId,
        companyId: context.companyId
      }], { session });
    }

    await session.commitTransaction();
    resultExpense = expense;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  return resultExpense;
}

async function recordDriverStaffLedger(staffData, user) {
  const context = getContext();
  const ledger = await DriverStaffLedger.create({
    ...staffData,
    createdBy: context.employeeId,
    branchId: context.branchId,
    companyId: context.companyId
  });

  // Post to FinancialLedger for cash flow tracking
  await FinancialLedger.create({
    amount: staffData.amount,
    type: 'debit',
    category: 'OTHER',
    reason: `Staff/Driver Ledger (${staffData.type}) for Staff ${staffData.staffId}`,
    refId: ledger._id,
    currency: staffData.currency || 'NPR',
    createdBy: context.employeeId,
    branchId: context.branchId,
    companyId: context.companyId
  });

  return ledger;
}

async function recordVehicleCost(costData, user) {
  const context = getContext();
  const cost = await VehicleCost.create({
    ...costData,
    createdBy: context.employeeId,
    branchId: context.branchId,
    companyId: context.companyId
  });

  // Also log under FinancialLedger
  await FinancialLedger.create({
    amount: costData.amount,
    type: 'debit',
    category: 'OTHER',
    reason: `Vehicle Cost (${costData.costType}) for Vehicle ${costData.resourceId}`,
    refId: cost._id,
    currency: costData.currency || 'NPR',
    createdBy: context.employeeId,
    branchId: context.branchId,
    companyId: context.companyId
  });

  return cost;
}

async function getVehicleProfitability(resourceId) {
  const vehicleCosts = await VehicleCost.find({ resourceId });
  const totalCost = vehicleCosts.reduce((sum, c) => sum + c.amount, 0);

  const assignments = await Assignment.find({ resourceId, status: { $ne: 'CANCELLED' } });
  const totalToursAssigned = assignments.length;

  const costsByType = {};
  vehicleCosts.forEach(c => {
    costsByType[c.costType] = (costsByType[c.costType] || 0) + c.amount;
  });

  return {
    resourceId,
    totalToursAssigned,
    totalCost: Math.round(totalCost * 100) / 100,
    costsByType,
    logsCount: vehicleCosts.length
  };
}

module.exports = {
  recordOperationalExpense,
  recordDriverStaffLedger,
  recordVehicleCost,
  getVehicleProfitability
};
