import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

import { resolveAuthenticatedStoryUser } from './storyProjects.js';

export function getJwtSecret() {
  return (
    process.env.JWT_SECRET ||
    'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345'
  );
}

export async function resolveRequestUser(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const token = authHeader.substring(7);

  let decoded;
  try {
    decoded = jwt.verify(token, getJwtSecret());
  } catch (error) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const authUser =
    (await resolveAuthenticatedStoryUser(decoded)) ||
    (decoded?.id
      ? {
          id: decoded.id,
          email: decoded.email || '',
          name: decoded.name || decoded.email || '',
        }
      : null);

  if (!authUser?.id) {
    return {
      error: NextResponse.json(
        { error: 'Authenticated user could not be resolved.' },
        { status: 401 }
      ),
    };
  }

  return { authUser, decoded, token };
}
