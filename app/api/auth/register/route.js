/**
 * Auth Register Endpoint
 * Serverless implementation: POST /api/auth/register
 */

import { NextResponse } from 'next/server';
import { hashPassword, findUserByEmail, createUser, generateToken } from '@/lib/auth';

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

    console.log('[REGISTER] Processing registration for:', email);

    // Check if user exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      console.log('[REGISTER] Email already registered:', email);
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await createUser({
      name,
      email,
      passwordHash,
      preferredCurrency: preferredCurrency || 'USD'
    });

    console.log('[REGISTER] User created:', user.id);

    // Generate token
    const token = generateToken(user.id);

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          preferredCurrency: user.preferred_currency
        },
        token
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[REGISTER] Error:', error.message);
    return NextResponse.json(
      { error: 'Registration failed', details: error.message },
      { status: 500 }
    );
  }
}
