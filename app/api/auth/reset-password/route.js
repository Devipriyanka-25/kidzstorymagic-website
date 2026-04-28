import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import {
  findAuthUserByResetTokenHash,
  isPersistentAuthAvailable,
  updateAuthUserPassword,
} from '../../shared/authUsers.js';
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

    if (!isPersistentAuthAvailable()) {
      return NextResponse.json(
        {
          error: 'Password reset is temporarily unavailable.',
          details: 'Persistent auth storage is not configured for this environment.',
        },
        { status: 503 }
      );
    }

    const resetTokenHash = hashResetToken(token);
    const user = await findAuthUserByResetTokenHash(resetTokenHash);

    if (!user?.id) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await updateAuthUserPassword({
      userId: user.id,
      passwordHash,
    });

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
