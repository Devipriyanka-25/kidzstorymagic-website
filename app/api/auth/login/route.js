/**
 * Auth Login Endpoint
 * Serverless implementation: POST /api/auth/login
 */

import { NextResponse } from 'next/server';
import { findUserByEmail, comparePassword, generateToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('[LOGIN] Processing login for:', email);

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      console.log('[LOGIN] User not found:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare password
    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      console.log('[LOGIN] Invalid password for:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('[LOGIN] User authenticated:', user.id);

    // Generate token
    const token = generateToken(user.id);

    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          preferredCurrency: user.preferred_currency
        },
        token
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[LOGIN] Error:', error.message);
    return NextResponse.json(
      { error: 'Login failed', details: error.message },
      { status: 500 }
    );
  }
}
