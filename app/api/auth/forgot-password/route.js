import crypto from 'crypto';
import { NextResponse } from 'next/server';
import {
  findAuthUserByEmail,
  isPersistentAuthAvailable,
  normalizeEmail,
  saveAuthUserResetToken,
} from '../../shared/authUsers.js';
import {
  getEmailFromAddress,
  isAutomatedEmailConfigured,
  sendTransactionalEmail,
} from '../../../../lib/email.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESET_TOKEN_WINDOW_MS = 60 * 60 * 1000;

function isValidEmail(email) {
  return EMAIL_PATTERN.test(String(email || '').trim());
}

function hashResetToken(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

function getSiteBaseUrl(request) {
  const configuredUrl = String(process.env.NEXT_PUBLIC_APP_URL || '').trim();
  if (
    configuredUrl &&
    /^https?:\/\//.test(configuredUrl) &&
    !configuredUrl.includes('localhost')
  ) {
    return configuredUrl.replace(/\/$/, '');
  }

  const requestOrigin = String(request.nextUrl?.origin || '').trim();
  if (requestOrigin) {
    return requestOrigin.replace(/\/$/, '');
  }

  return 'https://www.kidzstorymagic.org';
}

function buildForgotPasswordEmail({ recipientName, resetUrl }) {
  const safeName = recipientName || 'there';

  return {
    subject: 'Reset your Kidz Story Magic password',
    text: [
      `Hi ${safeName},`,
      '',
      'We received a request to reset your Kidz Story Magic password.',
      `Reset your password here: ${resetUrl}`,
      '',
      'This link expires in 1 hour.',
      'If you did not request this, you can ignore this email.',
      '',
      'Kidz Story Magic',
    ].join('\n'),
    html: `
      <div style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,sans-serif;color:#10213a;">
        <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
          <div style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 50px rgba(15,23,42,0.08);">
            <div style="padding:32px;background:linear-gradient(135deg,#0f766e 0%,#1d4ed8 100%);color:#ffffff;">
              <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;font-weight:700;opacity:0.85;">
                Kidz Story Magic
              </p>
              <h1 style="margin:0;font-size:30px;line-height:1.2;">
                Reset your password
              </h1>
              <p style="margin:14px 0 0;font-size:16px;line-height:1.6;opacity:0.92;">
                Hi ${safeName}, click below to create a new password for your account.
              </p>
            </div>

            <div style="padding:32px;">
              <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#334155;">
                This secure link expires in 1 hour.
              </p>

              <div style="margin:28px 0 24px;">
                <a href="${resetUrl}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;">
                  Reset Password
                </a>
              </div>

              <p style="margin:0;font-size:13px;line-height:1.7;color:#64748b;">
                If you did not request this reset, you can safely ignore this email.
              </p>
            </div>
          </div>
        </div>
      </div>
    `,
  };
}

function isResendTestingModeMessage(message) {
  const normalizedMessage = String(message || '').toLowerCase();
  return (
    normalizedMessage.includes('testing emails') ||
    normalizedMessage.includes('verify a domain') ||
    normalizedMessage.includes('own email address')
  );
}

function extractResendTestingAddress(message) {
  const match = String(message || '').match(/\(([^)]+@[^)]+)\)/);
  return match ? match[1] : '';
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
    const email = normalizeEmail(body?.email);

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required.' },
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

    if (!isAutomatedEmailConfigured()) {
      return NextResponse.json(
        {
          error: 'Password reset email is not configured yet.',
          details: 'Add RESEND_API_KEY before sending password reset emails.',
        },
        { status: 503 }
      );
    }

    const user = await findAuthUserByEmail(email);
    const message = 'If an account exists, a reset link has been sent.';

    if (!user) {
      return NextResponse.json({ success: true, message }, { status: 200 });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = hashResetToken(resetToken);
    const resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_WINDOW_MS).toISOString();
    const siteBaseUrl = getSiteBaseUrl(request);
    const resetUrl = `${siteBaseUrl}/auth/reset-password?token=${resetToken}`;

    await saveAuthUserResetToken({
      userId: user.id,
      resetTokenHash,
      resetTokenExpiry,
    });

    const emailContent = buildForgotPasswordEmail({
      recipientName: user.name,
      resetUrl,
    });

    await sendTransactionalEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      idempotencyKey: `forgot-password-${user.id}-${resetTokenHash}`,
    });

    const response = {
      success: true,
      message,
    };

    if (
      process.env.NODE_ENV !== 'production' ||
      getEmailFromAddress().includes('resend.dev')
    ) {
      response.resetUrl = resetUrl;
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[FORGOT_PASSWORD] Error:', error);

    if (isMissingResetColumnsError(error)) {
      return NextResponse.json(
        {
          error: 'Password reset storage is not ready yet.',
          details:
            'The users table is missing reset_token_hash/reset_token_expiry columns. Run the password-reset DB migration before using forgot password.',
        },
        { status: 503 }
      );
    }

    if (isResendTestingModeMessage(error?.message)) {
      const allowedEmail = extractResendTestingAddress(error?.message);
      const details = [
        'Resend is still in test mode, so password reset emails can only be delivered to the account owner right now.',
        allowedEmail ? `Current allowed testing address: ${allowedEmail}.` : null,
        'To send reset links to customer email addresses, verify your domain in Resend and change RESEND_FROM_EMAIL to an address on that verified domain.',
      ]
        .filter(Boolean)
        .join(' ');

      return NextResponse.json(
        {
          error: 'Password reset email is still in Resend test mode.',
          details,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to request password reset.',
        details: error?.message || 'Unknown password reset error.',
      },
      { status: 500 }
    );
  }
}
