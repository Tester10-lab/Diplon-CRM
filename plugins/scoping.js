const { getContext } = require('../utils/context');

function scopingPlugin(schema, options) {
  const operations = [
    'find', 'findOne', 'countDocuments', 'update', 'updateOne', 'updateMany',
    'findOneAndUpdate', 'delete', 'deleteOne', 'deleteMany', 'findOneAndDelete'
  ];

  const injectScope = function (next) {
    if (this.options && this.options.skipScoping) {
      if (next) return next();
      return;
    }

    const context = getContext();
    const expectsScoping = schema.paths.branchId || schema.paths.companyId;
    
    // Fail loud if context is empty but schema expects tenant scoping
    if (expectsScoping && (!context || Object.keys(context).length === 0)) {
      const err = new Error('Tenant scoping expected but no context provided (empty getContext).');
      if (next) return next(err);
      throw err;
    }
    
    // Inject branchId or companyId if present in context
    if (context.branchId && schema.paths.branchId) {
      this.where({ branchId: context.branchId });
    } else if (context.companyId && schema.paths.companyId) {
      this.where({ companyId: context.companyId });
    }

    // Inject partnerId if applicable
    if (context.partnerId && schema.paths.partnerId) {
        this.where({ partnerId: context.partnerId });
    }
    
    if (next) next();
  };

  operations.forEach(op => {
    schema.pre(op, injectScope);
  });
}

function restrictFields(schema, options) {
  const { fields = [], allowedRoles = [] } = options;

  schema.pre('save', function () {
    const context = getContext();
    const isModified = fields.some(field => this.isModified(field));

    if (isModified) {
      const { currentUserRole } = context;
      if (!allowedRoles.includes(currentUserRole)) {
        throw new Error('Unauthorized to modify restricted fields');
      }
    }
  });
}

function assertNotSelfEdit(schema, options) {
  const { fields = [] } = options;
  
  schema.pre('save', function () {
    const context = getContext();
    const isModified = fields.some(field => this.isModified(field));

    if (isModified) {
      const { employeeId } = context;
      if (this.userId && employeeId && this.userId.toString() === employeeId.toString()) {
        throw new Error('Employees are not allowed to edit their own restricted fields');
      }
    }
  });
}

module.exports = { scopingPlugin, restrictFields, assertNotSelfEdit };
