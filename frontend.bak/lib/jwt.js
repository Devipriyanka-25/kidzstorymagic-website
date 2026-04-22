// JWT utilities for API routes
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function extractTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
}

function authenticateRequest(req) {
  const token = extractTokenFromRequest(req);
  if (!token) return null;

  const decoded = verifyToken(token);
  return decoded;
}

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromRequest,
  authenticateRequest,
  JWT_SECRET,
  JWT_EXPIRES_IN
};
