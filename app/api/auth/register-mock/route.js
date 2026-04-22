/**
 * Auth Register Endpoint - Mock Implementation
 * POST /api/auth/register-mock
 * For testing end-to-end flows without database dependencies
 */

import { NextResponse } from 'next/server';
import { mockDB } from '../lib/mock-db.js';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, preferredCurrency } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    console.log('[REGISTER-MOCK] Processing registration for:', email);

    // Check if email already exists
    if (mockDB.findUserByEmail(email)) {
      console.log('[REGISTER-MOCK] Email already registered:', email);
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    console.log('[REGISTER-MOCK] Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in mock database
    const user = mockDB.createUser(name, email, passwordHash, preferredCurrency);
    console.log('[REGISTER-MOCK] User created:', user.id);

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    const token = jwt.sign(
      { id: user.id, email: user.email },
      jwtSecret || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          preferredCurrency: user.preferred_currency
        },
        token,
        mode: 'mock-test'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[REGISTER-MOCK] Error:', error.message);
    return NextResponse.json(
      {
        error: 'Registration failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}
