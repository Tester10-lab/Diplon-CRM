module.exports = (err, req, res, next) => {
  console.error(err);

  // Zod Validation Errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.errors
      }
    });
  }

  // Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message
      }
    });
  }

  // Custom Application Errors (e.g., from services)
  if (err.isAppError) {
    return res.status(err.statusCode || 400).json({
      error: {
        code: err.code || 'BAD_REQUEST',
        message: err.message
      }
    });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    return res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'Duplicate entry detected'
      }
    });
  }



  // Fallback 500
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.'
    }
  });
};
