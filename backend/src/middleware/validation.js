// Backend Request Validator Middleware
const { validationResult } = require('express-validator');
const { sendError, validateRequired } = require('../utils/apiResponse');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(
      res,
      400,
      'Validation failed',
      errors.array()
    );
  }
  next();
};

const validateJSON = (req, res, next) => {
  // Check if content-type is JSON
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req.headers['content-type'];
    if (contentType && !contentType.includes('application/json')) {
      return sendError(res, 400, 'Content-Type must be application/json');
    }
  }
  next();
};

const validatePagination = (req, res, next) => {
  let { page = 1, limit = 10 } = req.query;
  
  page = parseInt(page);
  limit = parseInt(limit);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1 || limit > 100) limit = 10;

  req.pagination = { page, limit };
  next();
};

module.exports = {
  validateRequest,
  validateJSON,
  validatePagination
};
