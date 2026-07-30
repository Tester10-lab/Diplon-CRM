const { User, Employee } = require('../models/UserEmployee');
const { hashPassword, verifyPassword, signToken } = require('../utils/auth');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Find user by email (skip tenant scoping during initial credential check)
  const user = await User.findOne({ email: email.toLowerCase().trim() }).setOptions({ skipScoping: true });
  if (!user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password.'
      }
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'User account is deactivated.'
      }
    });
  }

  const isPasswordValid = verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password.'
      }
    });
  }

  // Find associated employee profile
  const employee = await Employee.findOne({ userId: user._id }).setOptions({ skipScoping: true });

  const tokenPayload = {
    userId: user._id.toString(),
    employeeId: employee ? employee._id.toString() : user._id.toString(),
    role: user.role,
    branchId: user.branchId.toString(),
    companyId: user.companyId.toString(),
    email: user.email
  };

  const token = signToken(tokenPayload);

  res.status(200).json({
    status: 'success',
    data: {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        companyId: user.companyId,
        employeeId: employee ? employee._id : null
      }
    }
  });
};

exports.register = async (req, res) => {
  const { email, password, role, branchId, companyId, designation, salesTarget, commissionRate } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() }).setOptions({ skipScoping: true });
  if (existingUser) {
    return res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'User with this email already exists.'
      }
    });
  }

  const passwordHash = hashPassword(password);

  const user = new User({
    email: email.toLowerCase().trim(),
    passwordHash,
    role,
    branchId,
    companyId,
    isActive: true
  });
  await user.save();

  const employee = new Employee({
    userId: user._id,
    branchId,
    companyId,
    designation: designation || 'Staff Member',
    salesTarget: salesTarget || 0,
    commissionRate: commissionRate || 0
  });
  await employee.save();

  res.status(201).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        companyId: user.companyId
      },
      employee: {
        id: employee._id,
        designation: employee.designation,
        salesTarget: employee.salesTarget,
        commissionRate: employee.commissionRate
      }
    }
  });
};

exports.me = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Not authenticated.'
      }
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
};
