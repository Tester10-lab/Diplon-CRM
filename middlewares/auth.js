const { verifyToken } = require('../utils/auth');

// Role Permission Matrix for Fine-Grained Authorization
const PERMISSION_MATRIX = {
  MANAGE_USERS: ['SUPER_ADMIN', 'ADMIN'],
  CREATE_PACKAGE: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  MANAGE_OPERATIONS: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATIONS'],
  MANAGE_FINANCE: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FINANCE'],
  EXECUTE_PAYOUT: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FINANCE'],
  CREATE_BOOKING: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'AGENT', 'FINANCE', 'AGENCY'],
  VIEW_REPORTS: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FINANCE']
};

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = {
        userId: decoded.userId,
        employeeId: decoded.employeeId || decoded.userId,
        role: decoded.role,
        branchId: decoded.branchId,
        companyId: decoded.companyId,
        email: decoded.email
      };
      return next();
    } else {
      req.user = null;
      return next();
    }
  }

  // Test environment fallbacks (strictly isolated to NODE_ENV === 'test')
  if (process.env.NODE_ENV === 'test') {
    // 1. Mock header path for test suites
    if (req.headers['x-mock-role'] || req.headers['x-mock-employee-id'] || req.headers['x-mock-branch-id'] || req.headers['x-mock-company-id']) {
      req.user = {
        employeeId: req.headers['x-mock-employee-id'] || '60d5ecb74d6bb8928a314221',
        role: req.headers['x-mock-role'] || 'MANAGER',
        branchId: req.headers['x-mock-branch-id'] || '60d5ecb74d6bb8928a314111',
        companyId: req.headers['x-mock-company-id'] || '60d5ecb74d6bb8928a314000',
      };
      return next();
    }

    // 2. Default fallback user in test environment when no auth/mock header is specified
    req.user = {
      employeeId: '60d5ecb74d6bb8928a314221',
      role: 'MANAGER',
      branchId: '60d5ecb74d6bb8928a314111',
      companyId: '60d5ecb74d6bb8928a314000',
    };
    return next();
  }

  // Outside test environment: unauthenticated request
  req.user = null;
  next();
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please log in.'
      }
    });
  }
  next();
};

const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please log in.'
        }
      });
    }

    // SUPER_ADMIN, SUPER ADMIN, and ADMIN always have administrative access
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    const userRole = (req.user.role || '').toUpperCase().replace(' ', '_');
    const isAllowed = allowedRoles.some(r => r.toUpperCase().replace(' ', '_') === userRole) || userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

    if (!isAllowed) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have the required role to perform this action.'
        }
      });
    }
    next();
  };
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please log in.'
        }
      });
    }

    const allowedRoles = PERMISSION_MATRIX[permission] || [];
    const userRole = (req.user.role || '').toUpperCase().replace(' ', '_');
    const isAllowed = allowedRoles.some(r => r.toUpperCase().replace(' ', '_') === userRole) || userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

    if (!isAllowed) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `You lack the required permission (${permission}) for this operation.`
        }
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  requireAuth,
  requireRole,
  requirePermission
};
