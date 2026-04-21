// POST /api/auth/reset-password
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    // Validate inputs
    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Reset token is required'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!password || password.length < 6) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Password must be at least 6 characters'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const resetTokenHash = hashResetToken(token);
    const pool = getPool();

    // Find user with valid reset token
    const userResult = await pool.query(
      `SELECT id
       FROM users
       WHERE reset_token_hash = $1
         AND reset_token_expiry > CURRENT_TIMESTAMP
         AND is_active = true`,
      [resetTokenHash]
    );

    if (userResult.rows.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid or expired reset token'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const userId = userResult.rows[0].id;

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    await pool.query(
      `UPDATE users
       SET password_hash = $1,
           reset_token_hash = NULL,
           reset_token_expiry = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [passwordHash, userId]
    );

    console.log('[PASSWORD_RESET_CONFIRM] Password reset successfully for user:', userId);

    return new Response(JSON.stringify({
      success: true,
      message: 'Password reset successfully'
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('[PASSWORD_RESET_CONFIRM] Error:', err.message);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to reset password',
      details: err.message
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
