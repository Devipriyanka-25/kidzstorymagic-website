/**
 * Email Verification API
 * POST /api/auth/verify-email - Verify email with token
 * GET /api/auth/verify-email?token=XXX - Verify via query parameter
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Store verification tokens in memory (in production, use database)
const verificationTokens = new Map();

/**
 * Generate verification token
 */
export function generateVerificationToken(email) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + (parseInt(process.env.EMAIL_VERIFICATION_TOKEN_EXPIRY) || 86400) * 1000;
  
  verificationTokens.set(token, {
    email,
    expiresAt,
    verified: false,
  });
  
  return token;
}

/**
 * Verify email token
 */
export function verifyEmailToken(token) {
  const verification = verificationTokens.get(token);
  
  if (!verification) {
    return { valid: false, reason: 'Token not found' };
  }
  
  if (Date.now() > verification.expiresAt) {
    verificationTokens.delete(token);
    return { valid: false, reason: 'Token expired' };
  }
  
  if (verification.verified) {
    return { valid: false, reason: 'Token already used' };
  }
  
  return { valid: true, email: verification.email };
}

/**
 * Mark token as verified
 */
export function markTokenAsVerified(token) {
  const verification = verificationTokens.get(token);
  if (verification) {
    verification.verified = true;
  }
}

// GET: Verify email via link click
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const verification = verifyEmailToken(token);
    
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.reason || 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Mark as verified
    markTokenAsVerified(token);

    // In production, update user's email_verified status in database
    console.log(`[EMAIL_VERIFIED] Email ${verification.email} verified successfully`);

    // Redirect to success page or return JSON
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      email: verification.email,
    });
  } catch (error) {
    console.error('[VERIFY_EMAIL_ERROR]:', error);
    return NextResponse.json(
      { error: 'Email verification failed', message: error.message },
      { status: 500 }
    );
  }
}

// POST: Verify email with token in body
export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const verification = verifyEmailToken(token);
    
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.reason || 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Mark as verified
    markTokenAsVerified(token);

    console.log(`[EMAIL_VERIFIED] Email ${verification.email} verified successfully`);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      email: verification.email,
    });
  } catch (error) {
    console.error('[VERIFY_EMAIL_ERROR]:', error);
    return NextResponse.json(
      { error: 'Email verification failed', message: error.message },
      { status: 500 }
    );
  }
}
