const { Expense } = require('../models/OperationalExpense');
const { SupplierPayable } = require('../models/SupplierPayable');
const { FinancialLedger } = require('../models/Ledger');
const { getContext } = require('../utils/context');

async function approveFinancialEntity(entityType, id, user) {
  const context = getContext();
  let entity;

  if (entityType === 'EXPENSE') {
    entity = await Expense.findById(id);
    if (!entity) {
      const err = new Error('Expense not found');
      err.isAppError = true;
      err.statusCode = 404;
      throw err;
    }
    entity.approvalStatus = 'APPROVED';
    entity.approvedBy = context.employeeId;
    entity.approvedAt = new Date();
    await entity.save();

    // Post to FinancialLedger upon approval
    await FinancialLedger.create({
      amount: entity.amount,
      type: 'debit',
      category: 'OTHER',
      reason: `Operational Expense Approved (${entity.category}): ${entity.expenseNumber}`,
      refId: entity._id,
      currency: entity.currency || 'NPR',
      createdBy: context.employeeId,
      branchId: context.branchId,
      companyId: context.companyId
    });
  } else if (entityType === 'SUPPLIER_PAYABLE') {
    entity = await SupplierPayable.findById(id);
    if (!entity) {
      const err = new Error('Supplier payable not found');
      err.isAppError = true;
      err.statusCode = 404;
      throw err;
    }
    entity.approvalStatus = 'APPROVED';
    entity.approvedBy = context.employeeId;
    entity.approvedAt = new Date();
    await entity.save();
  } else {
    const err = new Error(`Unsupported entityType for approval: ${entityType}`);
    err.isAppError = true;
    err.statusCode = 400;
    throw err;
  }

  return entity;
}

async function rejectFinancialEntity(entityType, id, comments, user) {
  const context = getContext();
  let entity;

  if (entityType === 'EXPENSE') {
    entity = await Expense.findById(id);
    if (!entity) {
      const err = new Error('Expense not found');
      err.isAppError = true;
      err.statusCode = 404;
      throw err;
    }
    entity.approvalStatus = 'REJECTED';
    entity.notes = entity.notes ? `${entity.notes} | Rejection comment: ${comments}` : comments;
    await entity.save();
  } else if (entityType === 'SUPPLIER_PAYABLE') {
    entity = await SupplierPayable.findById(id);
    if (!entity) {
      const err = new Error('Supplier payable not found');
      err.isAppError = true;
      err.statusCode = 404;
      throw err;
    }
    entity.approvalStatus = 'REJECTED';
    entity.notes = entity.notes ? `${entity.notes} | Rejection comment: ${comments}` : comments;
    await entity.save();
  } else {
    const err = new Error(`Unsupported entityType for rejection: ${entityType}`);
    err.isAppError = true;
    err.statusCode = 400;
    throw err;
  }

  return entity;
}

async function getPendingApprovals() {
  const pendingExpenses = await Expense.find({ approvalStatus: 'PENDING_APPROVAL' });
  const pendingPayables = await SupplierPayable.find({ approvalStatus: 'PENDING_APPROVAL' });

  return {
    pendingExpenses,
    pendingPayables,
    totalPendingCount: pendingExpenses.length + pendingPayables.length
  };
}

module.exports = {
  approveFinancialEntity,
  rejectFinancialEntity,
  getPendingApprovals
};
