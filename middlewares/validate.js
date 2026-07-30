const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    if (schema.body) {
      // Zod parse throws a ZodError if validation fails
      req.body = schema.body.parse(req.body);
    }
    if (schema.query) {
      req.query = schema.query.parse(req.query);
    }
    if (schema.params) {
      req.params = schema.params.parse(req.params);
    }
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      next(error);
    } else {
      next(error);
    }
  }
};

module.exports = validate;
