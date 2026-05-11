import { NextResponse } from 'next/server';
import {
  createAuthUser,
  findAuthUserByEmail,
  isDuplicateAuthUserError,
  isPersistentAuthAvailable,
  normalizeEmail,
} from '../../shared/authUsers.js';
import { buildClientAuthUser } from '../../shared/authRoles.js';
import { getRequiredJwtSecret } from '../../shared/jwt.js';
import { userStore } from '../../shared/userStore.js';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, preferredCurrency } = body;

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

    const normalizedEmail = normalizeEmail(email);
    let jwtSecret;
    try {
      jwtSecret = getRequiredJwtSecret();
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Registration is temporarily unavailable.',
          details: error.message,
        },
        { status: 503 }
      );
    }
    const passwordHash = await bcrypt.hash(password, 10);

    console.log('[REGISTER] Processing registration for:', normalizedEmail);

    if (isPersistentAuthAvailable()) {
      try {
        const existingUser = await findAuthUserByEmail(normalizedEmail);
        if (existingUser) {
          return NextResponse.json(
            { error: 'Email already registered' },
            { status: 409 }
          );
        }

        const userData = await createAuthUser({
          name,
          email: normalizedEmail,
          passwordHash,
          preferredCurrency,
        });

        const clientUser = buildClientAuthUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          passwordHash,
          preferredCurrency: userData.preferred_currency,
          createdAt: userData.created_at,
        });
        userStore.addUser(normalizedEmail, clientUser);

        const token = jwt.sign(
          { id: userData.id, email: userData.email, name: userData.name },
          jwtSecret,
          { expiresIn: '7d' }
        );

        return NextResponse.json(
          {
            message: 'User registered successfully',
            user: clientUser,
            token,
            source: 'supabase',
          },
          { status: 201 }
        );
      } catch (persistentError) {
        console.error(
          '[REGISTER] Persistent registration failed:',
          persistentError.message
        );

        if (isDuplicateAuthUserError(persistentError)) {
          return NextResponse.json(
            { error: 'Email already registered' },
            { status: 409 }
          );
        }

        return NextResponse.json(
          {
            error: 'Registration failed',
            details:
              'Persistent registration is temporarily unavailable. Please try again.',
          },
          { status: 503 }
        );
      }
    }

    console.log('[REGISTER] Persistent auth unavailable - using shared store');

    if (userStore.userExists(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userData = {
      id: userId,
      name,
      email: normalizedEmail,
      passwordHash,
      preferredCurrency: preferredCurrency || 'USD',
      createdAt: new Date().toISOString(),
    };

    const clientUser = buildClientAuthUser(userData);
    userStore.addUser(normalizedEmail, clientUser);

    const token = jwt.sign(
      { id: userId, email: normalizedEmail, name },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: clientUser,
        token,
        source: 'shared-store',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[REGISTER] Unexpected error:', error.message);
    return NextResponse.json(
      {
        error: 'Registration failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
