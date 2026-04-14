const fs = require('fs');
const path = require('path');

// API Response helper
const sendResponse = (res, statusCode, success, message, data = null) => {
  res.status(statusCode).json({
    success,
    message,
    ...(data && { data }),
  });
};

// Pagination helper
const getPaginationParams = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const offset = (pageNum - 1) * limitNum;

  return { page: pageNum, limit: limitNum, offset };
};

// Pagination response helper
const getPaginatedResponse = (items, total, page, limit) => {
  return {
    items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

// File upload validator
const validateFileUpload = (file, allowedMimes, maxSize) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (allowedMimes && !allowedMimes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedMimes.join(', ')}`,
    };
  }

  if (maxSize && file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Max size: ${maxSize / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
};

// Generate JWT payload
const generateJWTPayload = (user) => {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role || 'user',
  };
};

// Format currency for display
const formatPrice = (price, currency) => {
  const symbols = {
    USD: '$',
    CAD: 'C$',
    GBP: '£',
    EUR: '€',
    AUD: 'A$',
    INR: '₹',
  };

  return `${symbols[currency] || '$'}${price.toFixed(2)} ${currency}`;
};

// Create directory if doesn't exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Delete file if exists
const deleteFileIfExists = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Generate random string
const generateRandomString = (length = 16) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Safe JSON parse
const safeJSONParse = (jsonString, defaultValue = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('JSON parse error:', error);
    return defaultValue;
  }
};

// Delay function for testing
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  sendResponse,
  getPaginationParams,
  getPaginatedResponse,
  validateFileUpload,
  generateJWTPayload,
  formatPrice,
  ensureDirectoryExists,
  deleteFileIfExists,
  generateRandomString,
  safeJSONParse,
  delay,
};
