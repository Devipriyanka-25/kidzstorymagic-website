// POST /api/auth/forgot-password
import crypto from 'crypto';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body.email?.toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Valid email is required'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const pool = getPool();
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    // Always return success for security (don't reveal if email exists)
    const message = 'If an account exists, a reset link has been sent.';
    const response = { success: true, message };

    if (userResult.rows.length === 0) {
      return new Response(JSON.stringify(response), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const user = userResult.rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = hashResetToken(resetToken);
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Get frontend URL from environment or use default
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://www.kidzstorymagic.org';
    const resetUrl = `${frontendUrl.replace(/\/$/, '')}/auth/reset-password?token=${resetToken}`;

    await pool.query(
      `UPDATE users
       SET reset_token_hash = $1,
           reset_token_expiry = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [resetTokenHash, resetTokenExpiry, user.id]
    );

    console.log('[PASSWORD_RESET_REQUEST] Token created for:', email);

    // In development mode, include the reset URL and token
    if (process.env.NODE_ENV !== 'production') {
      response.resetToken = resetToken;
      response.resetUrl = resetUrl;
    }

    // TODO: Send email with reset link
    // For now, we just log and return success

    return new Response(JSON.stringify(response), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (err) {
    console.error('[PASSWORD_RESET_REQUEST] Error:', err.message);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to request password reset',
      details: err.message
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
