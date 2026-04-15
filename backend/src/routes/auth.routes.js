// Authentication Routes
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const config = require('../config/config');
const pool = require('../config/database');

const router = express.Router();

const hashResetToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const sendPasswordResetEmail = async ({ email, resetUrl }) => {
  if (!config.email.user || !config.email.password) {
    console.warn('[PASSWORD_RESET] Email credentials are not configured; reset email was not sent.');
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
      user: config.email.user,
      pass: config.email.password
    }
  });

  try {
    await transporter.sendMail({
      from: config.email.from,
      to: email,
      subject: 'Reset your Kidz Story Magic password',
      text: `Use this link to reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
      html: `<p>Use this link to reset your password:</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in 1 hour.</p>`
    });

    return true;
  } catch (error) {
    console.warn('[PASSWORD_RESET] Reset email failed to send:', error.message);
    return false;
  }
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Register endpoint
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('preferredCurrency').optional().isIn(['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'INR'])
], async (req, res) => {
  try {
    console.log('[REGISTER] Incoming request:', {
      email: req.body.email,
      contentType: req.headers['content-type'],
      timestamp: new Date().toISOString()
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('[REGISTER] Validation errors:', errors.array());
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { name, email, password, preferredCurrency } = req.body;

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log('[REGISTER] Email already registered:', email);
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password_hash: passwordHash,
      preferred_currency: preferredCurrency || 'USD'
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn || '24h' }
    );

    console.log('[REGISTER] User registered successfully:', {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        preferredCurrency: user.preferred_currency
      }
    });
  } catch (err) {
    console.error('[REGISTER] Error:', {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    
    // Return detailed error information
    res.status(500).json({ 
      error: 'Registration failed',
      details: err.message,
      code: err.code 
    });
  }
});

// Forgot password endpoint
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const email = req.body.email.toLowerCase();
    const user = await User.findByEmail(email);
    const message = 'If an account exists, a reset link has been sent.';
    const response = { success: true, message };

    if (!user) {
      return res.json(response);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = hashResetToken(resetToken);
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    const resetUrl = `${config.app.frontendUrl.replace(/\/$/, '')}/auth/reset-password?token=${resetToken}`;

    await pool.query(
      `UPDATE users
       SET reset_token_hash = $1,
           reset_token_expiry = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [resetTokenHash, resetTokenExpiry, user.id]
    );

    await sendPasswordResetEmail({ email: user.email, resetUrl });

    if (config.app.environment !== 'production') {
      response.resetToken = resetToken;
      response.resetUrl = resetUrl;
    }

    res.json(response);
  } catch (err) {
    console.error('[PASSWORD_RESET_REQUEST] Error:', err.message);
    res.status(500).json({ error: 'Failed to request password reset' });
  }
});

// Reset password endpoint
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { token, password } = req.body;
    const resetTokenHash = hashResetToken(token);

    const userResult = await pool.query(
      `SELECT id
       FROM users
       WHERE reset_token_hash = $1
         AND reset_token_expiry > CURRENT_TIMESTAMP
         AND is_active = true`,
      [resetTokenHash]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      `UPDATE users
       SET password_hash = $1,
           reset_token_hash = NULL,
           reset_token_expiry = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [passwordHash, userResult.rows[0].id]
    );

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (err) {
    console.error('[PASSWORD_RESET_CONFIRM] Error:', err.message);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Login endpoint
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        preferred_currency: user.preferred_currency
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
router.put('/me', verifyToken, [
  body('name').optional().trim().notEmpty(),
  body('preferredCurrency').optional().isIn(['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'INR'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, profilePictureUrl, preferredCurrency, location } = req.body;

    const user = await User.update(req.userId, {
      name,
      profile_picture_url: profilePictureUrl,
      preferred_currency: preferredCurrency,
      location
    });

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
module.exports.verifyToken = verifyToken;
