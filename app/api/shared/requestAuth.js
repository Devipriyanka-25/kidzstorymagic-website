import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

import { resolveAuthenticatedStoryUser } from './storyProjects.js';
import { getRequiredJwtSecret } from './jwt.js';

function getBearerToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return '';
  }

  return authHeader.substring(7);
}

function buildFallbackAuthUser(decoded) {
  if (!decoded?.id) {
    return null;
  }

  return {
    id: decoded.id,
    email: decoded.email || '',
    name: decoded.name || decoded.email || '',
  };
}

async function resolveVerifiedUser(decoded) {
  return (await resolveAuthenticatedStoryUser(decoded)) || buildFallbackAuthUser(decoded);
}

function buildAuthConfigurationError(error) {
  return NextResponse.json(
    {
      error: 'Authentication is not configured.',
      details: error?.message || 'JWT secret is missing.',
    },
    { status: 503 }
  );
}

function getConfiguredJwtSecretOrError() {
  try {
    return { jwtSecret: getRequiredJwtSecret() };
  } catch (error) {
    return { error: buildAuthConfigurationError(error) };
  }
}

export async function resolveRequestUser(request) {
  const token = getBearerToken(request);
  if (!token) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const { jwtSecret, error: configurationError } = getConfiguredJwtSecretOrError();
  if (configurationError) {
    return { error: configurationError };
  }

  let decoded;
  try {
    decoded = jwt.verify(token, jwtSecret);
  } catch (error) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const authUser = await resolveVerifiedUser(decoded);

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

export async function resolveOptionalRequestUser(request) {
  const token = getBearerToken(request);
  if (!token) {
    return null;
  }

  const { jwtSecret } = getConfiguredJwtSecretOrError();
  if (!jwtSecret) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    return await resolveVerifiedUser(decoded);
  } catch (error) {
    return null;
  }
}
