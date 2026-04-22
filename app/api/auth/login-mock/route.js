/**
 * Auth Login Endpoint - Mock Implementation
 * POST /api/auth/login-mock
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
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('[LOGIN-MOCK] Processing login for:', email);

    // Find user
    const user = mockDB.findUserByEmail(email);
    if (!user) {
      console.log('[LOGIN-MOCK] User not found:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      console.log('[LOGIN-MOCK] Password mismatch for:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate token
    const jwtSecret = process.env.JWT_SECRET;
    const token = jwt.sign(
      { id: user.id, email: user.email },
      jwtSecret || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('[LOGIN-MOCK] Login successful for user:', user.id);

    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          preferredCurrency: user.preferred_currency
        },
        token,
        mode: 'mock-test'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[LOGIN-MOCK] Error:', error.message);
    return NextResponse.json(
      {
        error: 'Login failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}
