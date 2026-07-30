const { Package } = require('../models/Product');
const { buildOperationsViewQuery } = require('../utils/rbac');

exports.createPackage = async (req, res) => {
  const user = req.user;

  const pkg = new Package({
    ...req.body,
    branchId: user.branchId,
    companyId: user.companyId
  });

  await pkg.save();
  res.status(201).json({ data: pkg });
};

exports.updatePackage = async (req, res) => {
  const query = { _id: req.params.id, ...buildOperationsViewQuery(req.user) };
  const pkg = await Package.findOne(query);

  if (!pkg) {
    const err = new Error('Package not found');
    err.isAppError = true;
    err.statusCode = 404;
    throw err;
  }

  // Manager must be within company, which buildViewQuery handles
  Object.assign(pkg, req.body);
  await pkg.save();

  res.json({ data: pkg });
};

exports.listPackages = async (req, res) => {
  const query = buildOperationsViewQuery(req.user);
  
  const packages = await Package.find(query).sort({ createdAt: -1 });

  res.json({ data: packages });
};
