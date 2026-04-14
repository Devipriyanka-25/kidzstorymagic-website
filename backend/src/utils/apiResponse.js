// API Response Wrapper Utility
class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    this.timestamp = new Date().toISOString();
  }
}

class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
    this.success = false;
  }
}

// Helper functions for standard responses
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = new ApiResponse(statusCode, data, message);
  return res.status(statusCode).json(response);
};

const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const error = new ApiError(statusCode, message, errors);
  return res.status(statusCode).json(error);
};

const sendPaginatedResponse = (res, data, total, page, limit, message = 'Success') => {
  const response = {
    statusCode: 200,
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    },
    timestamp: new Date().toISOString()
  };
  return res.status(200).json(response);
};

// Input validation helper
const validateRequired = (fields, data) => {
  const errors = [];
  fields.forEach(field => {
    if (!data[field]) {
      errors.push(`${field} is required`);
    }
  });
  return errors.length > 0 ? errors : null;
};

module.exports = {
  ApiResponse,
  ApiError,
  sendSuccess,
  sendError,
  sendPaginatedResponse,
  validateRequired
};
