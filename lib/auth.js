/**
 * Serverless Auth Utilities
 * Shared authentication functions for Vercel API routes
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Hash password
 */
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

/**
 * Compare password
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Extract and verify authorization token from request
 */
function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Verify user from token
 */
async function verifyUserFromToken(req) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) {
    return null;
  }

  // Get user from database
  const user = await db.getOne(
    'SELECT id, name, email, profile_picture_url, preferred_currency, location, created_at FROM auth_users WHERE id = $1 AND is_active = true',
    [decoded.id]
  );

  return user;
}

/**
 * Hash reset token
 */
function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate reset token
 */
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create user in database
 */
async function createUser({ name, email, passwordHash, preferredCurrency = 'USD' }) {
  const result = await db.query(
    `INSERT INTO auth_users (name, email, password_hash, preferred_currency, created_at, updated_at)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING id, name, email, preferred_currency, created_at`,
    [name, email, passwordHash, preferredCurrency]
  );
  return result.rows[0];
}

/**
 * Find user by email
 */
async function findUserByEmail(email) {
  return db.getOne(
    'SELECT * FROM auth_users WHERE email = $1',
    [email]
  );
}

/**
 * Find user by ID
 */
async function findUserById(id) {
  return db.getOne(
    'SELECT id, name, email, profile_picture_url, preferred_currency, location, created_at FROM auth_users WHERE id = $1 AND is_active = true',
    [id]
  );
}

/**
 * Update user
 */
async function updateUser(id, updates) {
  const { name, profilePictureUrl, preferredCurrency, location } = updates;
  
  const result = await db.query(
    `UPDATE auth_users 
     SET name = COALESCE($1, name),
         profile_picture_url = COALESCE($2, profile_picture_url),
         preferred_currency = COALESCE($3, preferred_currency),
         location = COALESCE($4, location),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $5
     RETURNING id, name, email, profile_picture_url, preferred_currency, location`,
    [name, profilePictureUrl, preferredCurrency, location, id]
  );
  
  return result.rows[0] || null;
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  getTokenFromRequest,
  verifyUserFromToken,
  hashResetToken,
  generateResetToken,
  createUser,
  findUserByEmail,
  findUserById,
  updateUser
};
