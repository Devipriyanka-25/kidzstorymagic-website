import { NextResponse } from 'next/server';
import {
  findAuthUserByEmail,
  isPersistentAuthAvailable,
  normalizeEmail,
} from '../../shared/authUsers.js';
import { buildClientAuthUser } from '../../shared/authRoles.js';
import { userStore } from '../../shared/userStore.js';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEMO_USER = {
  email: 'demo@example.com',
  password: 'Demo@123456',
  name: 'Demo User',
  id: 'demo_user_001',
};

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

    const normalizedEmail = normalizeEmail(email);
    const jwtSecret =
      process.env.JWT_SECRET ||
      'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345';

    console.log('[LOGIN] Login attempt for:', normalizedEmail);

    if (
      !isPersistentAuthAvailable() &&
      normalizedEmail === DEMO_USER.email &&
      password === DEMO_USER.password
    ) {
      const demoUser = buildClientAuthUser({
        id: DEMO_USER.id,
        name: DEMO_USER.name,
        email: DEMO_USER.email,
        preferredCurrency: 'USD',
        createdAt: new Date().toISOString(),
      });
      const demoPasswordHash = await bcrypt.hash(DEMO_USER.password, 10);
      userStore.addUser(DEMO_USER.email, {
        ...demoUser,
        passwordHash: demoPasswordHash,
      });

      const token = jwt.sign(
        { id: DEMO_USER.id, email: DEMO_USER.email, name: DEMO_USER.name },
        jwtSecret,
        { expiresIn: '7d' }
      );

      return NextResponse.json(
        {
          message: 'Login successful',
          user: demoUser,
          token,
          source: 'demo',
        },
        { status: 200 }
      );
    }

    if (isPersistentAuthAvailable()) {
      try {
        const user = await findAuthUserByEmail(normalizedEmail);

        if (!user || !user.password_hash) {
          return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
          );
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
          return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
          );
        }

        const token = jwt.sign(
          { id: user.id, email: user.email, name: user.name },
          jwtSecret,
          { expiresIn: '7d' }
        );

        const clientUser = buildClientAuthUser({
          id: user.id,
          name: user.name,
          email: user.email,
          passwordHash: user.password_hash,
          preferredCurrency: user.preferred_currency,
          createdAt: user.created_at,
        });
        userStore.addUser(normalizedEmail, {
          ...clientUser,
          passwordHash: user.password_hash,
        });

        return NextResponse.json(
          {
            message: 'Login successful',
            user: clientUser,
            token,
            source: 'supabase',
          },
          { status: 200 }
        );
      } catch (persistentError) {
        console.error('[LOGIN] Persistent login failed:', persistentError.message);
        return NextResponse.json(
          {
            error: 'Login failed',
            details:
              'Persistent login is temporarily unavailable. Please try again.',
          },
          { status: 503 }
        );
      }
    }

    const storedUser = userStore.getUser(normalizedEmail);
    if (!storedUser || !storedUser.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, storedUser.passwordHash);
    if (!match) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { id: storedUser.id, email: storedUser.email, name: storedUser.name },
      jwtSecret,
      { expiresIn: '7d' }
    );

    const clientUser = buildClientAuthUser(storedUser);

    return NextResponse.json(
      {
        message: 'Login successful',
        user: clientUser,
        token,
        source: 'store',
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
