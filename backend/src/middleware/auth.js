const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(' ')[1] ||
      req.cookies?.authToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided',
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    // JWT contains 'id', not 'userId'
    req.userId = decoded.id;
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

// Optional token middleware - doesn't fail if token is missing
const optionalToken = (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(' ')[1] ||
      req.cookies?.authToken;

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.userId = decoded.id;
      req.user = { id: decoded.id, email: decoded.email };
    }
  } catch (error) {
    // Silently fail - token is optional
  }
  next();
};

// Admin role check middleware
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
  next();
};

module.exports = {
  verifyToken,
  optionalToken,
  requireAdmin,
};
