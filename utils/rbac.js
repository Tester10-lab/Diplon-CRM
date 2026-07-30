function buildViewQuery(user) {
  if (user.role === 'ADMIN') {
    return {};
  }
  if (user.role === 'MANAGER' || user.role === 'FINANCE') {
    return { companyId: user.companyId };
  }
  if (user.role === 'AGENT') {
    return { branchId: user.branchId };
  }
  return { _id: null }; // Fallback to block access if role is unknown
}

function buildOperationsViewQuery(user) {
  if (user.role === 'ADMIN') {
    return {};
  }
  if (user.role === 'MANAGER' || user.role === 'OPERATIONS' || user.role === 'FINANCE') {
    return { companyId: user.companyId };
  }
  if (user.role === 'AGENT') {
    return { branchId: user.branchId };
  }
  return { _id: null };
}

function hasWriteAccess(user, document) {
  if (user.role === 'ADMIN' || user.role === 'MANAGER') {
    // Basic tenancy check could be added here, assuming view query already filtered it, 
    // but for extra safety:
    if (user.role === 'MANAGER' && document.companyId.toString() !== user.companyId.toString()) return false;
    return true;
  }
  
  if (user.role === 'AGENT') {
    // Must belong to same branch and be assigned to this user
    if (document.branchId.toString() !== user.branchId.toString()) return false;
    return document.assignedTo && document.assignedTo.toString() === user.employeeId.toString();
  }
  
  return false;
}

module.exports = {
  buildViewQuery,
  buildOperationsViewQuery,
  hasWriteAccess
};
