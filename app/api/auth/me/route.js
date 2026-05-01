import { NextResponse } from 'next/server';
import {
  findAuthUserByEmail,
  findAuthUserById,
  isPersistentAuthAvailable,
  normalizeEmail,
} from '../../shared/authUsers.js';
import { buildClientAuthUser } from '../../shared/authRoles.js';
import { userStore } from '../../shared/userStore.js';

const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const jwtSecret =
      process.env.JWT_SECRET ||
      'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345';

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!decoded || (!decoded.id && !decoded.email)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (isPersistentAuthAvailable()) {
      try {
        let user = null;

        if (decoded.id !== undefined && decoded.id !== null) {
          user = await findAuthUserById(decoded.id);
        }

        if (!user && decoded.email) {
          user = await findAuthUserByEmail(normalizeEmail(decoded.email));
        }

        if (!user) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        return NextResponse.json(
          {
            user: buildClientAuthUser(user),
            source: 'supabase',
          },
          { status: 200 }
        );
      } catch (persistentError) {
        console.error('[ME] Persistent lookup failed:', persistentError.message);
        return NextResponse.json(
          {
            error: 'Failed to get user info',
            details: 'Persistent user lookup failed.',
          },
          { status: 503 }
        );
      }
    }

    if (!decoded.email) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const demoUser = userStore.getUser(decoded.email);
    if (!demoUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        user: buildClientAuthUser(demoUser),
        source: 'demo',
        note: 'Running in demo mode - Supabase not available',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ME] Unexpected error:', error.message);
    return NextResponse.json(
      { error: 'Failed to get user info', details: error.message },
      { status: 500 }
    );
  }
}
