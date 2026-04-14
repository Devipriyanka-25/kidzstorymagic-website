// Authentication Routes
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const config = require('../config/config');

const router = express.Router();

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
    // Log incoming request for debugging
    console.log('[REGISTER] Incoming request:', {
      body: req.body,
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
      body: req.body,
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
