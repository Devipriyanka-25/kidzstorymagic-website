// Response utilities for consistent API responses
function successResponse(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

function errorResponse(res, error, statusCode = 500, details = null) {
  return res.status(statusCode).json({
    success: false,
    error,
    ...(details && { details })
  });
}

function validationErrorResponse(res, errors) {
  return res.status(400).json({
    success: false,
    error: 'Validation failed',
    details: errors
  });
}

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse
};
