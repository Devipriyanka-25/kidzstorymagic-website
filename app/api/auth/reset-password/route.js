import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import {
  findAuthUserByResetTokenHash,
  isPersistentAuthAvailable,
  updateAuthUserPassword,
} from '../../shared/authUsers.js';
import { userStore } from '../../shared/userStore.js';
import { consumeEphemeralResetToken } from '../../shared/resetTokenStore.js';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function hashResetToken(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

function isMissingResetColumnsError(error) {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('reset_token_hash') ||
    message.includes('reset_token_expiry')
  );
}

export async function POST(request) {
  try {
    const body = await request.json();
    const token = String(body?.token || '').trim();
    const password = String(body?.password || '');

    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const resetTokenHash = hashResetToken(token);
    const isPersistentAuth = isPersistentAuthAvailable();
    const user = isPersistentAuth
      ? await findAuthUserByResetTokenHash(resetTokenHash)
      : { email: consumeEphemeralResetToken(resetTokenHash) };

    if ((isPersistentAuth && !user?.id) || (!isPersistentAuth && !user?.email)) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (isPersistentAuth) {
      await updateAuthUserPassword({
        userId: user.id,
        passwordHash,
      });
    } else {
      const normalizedEmail = String(user.email || '').toLowerCase().trim();
      const storedUser = userStore.getUser(normalizedEmail);
      if (!storedUser) {
        return NextResponse.json(
          { error: 'Invalid or expired reset token.' },
          { status: 400 }
        );
      }
      userStore.updateUser(normalizedEmail, { ...storedUser, passwordHash });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset successfully.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[RESET_PASSWORD] Error:', error);

    if (isMissingResetColumnsError(error)) {
      return NextResponse.json(
        {
          error: 'Password reset storage is not ready yet.',
          details:
            'The users table is missing reset_token_hash/reset_token_expiry columns. Run the password-reset DB migration before using reset password.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to reset password.',
        details: error?.message || 'Unknown reset password error.',
      },
      { status: 500 }
    );
  }
}
