import { NextResponse } from 'next/server';
import {
  findAuthUserByEmail,
  findAuthUserById,
  isPersistentAuthAvailable,
  normalizeEmail,
} from '../../shared/authUsers.js';
import {
  sendTransactionalEmail,
  isAutomatedEmailConfigured,
  isResendSandboxSender,
} from '../../../../lib/email.js';

const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUPPORT_NOTIFICATION_EMAIL =
  process.env.PREVIEW_REQUEST_NOTIFICATION_EMAIL ||
  'support@kidzstorymagic.com';

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

function isValidEmail(email) {
  return EMAIL_PATTERN.test(String(email || '').trim());
}

function shouldBccSupport(recipientEmail) {
  if (isResendSandboxSender()) {
    return false;
  }

  return normalizeEmail(recipientEmail) !== normalizeEmail(SUPPORT_NOTIFICATION_EMAIL);
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

async function getAuthenticatedUser(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const token = authHeader.substring(7);
  const jwtSecret =
    process.env.JWT_SECRET ||
    'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345';

  let decoded;
  try {
    decoded = jwt.verify(token, jwtSecret);
  } catch (error) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  let user = null;
  if (isPersistentAuthAvailable()) {
    if (decoded.id !== undefined && decoded.id !== null) {
      user = await findAuthUserById(decoded.id);
    }

    if (!user && decoded.email) {
      user = await findAuthUserByEmail(normalizeEmail(decoded.email));
    }
  }

  return { decoded, user };
}

function buildPreviewEmail({
  childName,
  pageCount,
  projectId,
  recipientEmail,
  theme,
  previewUrl,
  dashboardUrl,
  checkoutUrl,
}) {
  const safeChildName = childName || 'your child';
  const safeTheme = theme || 'storybook';
  const safePageCount = pageCount || '10';

  return {
    subject: `Your Kidz Story Magic preview link for ${safeChildName}`,
    text: [
      `Hi,`,
      ``,
      `Here is your Kidz Story Magic preview link for ${safeChildName}.`,
      `Recipient: ${recipientEmail}`,
      `Project ID: ${projectId || 'Unavailable'}`,
      `Theme: ${safeTheme}`,
      `Page count: ${safePageCount}`,
      ``,
      `Continue preview: ${previewUrl}`,
      `Open dashboard: ${dashboardUrl}`,
      `Return to checkout: ${checkoutUrl}`,
      ``,
      `If the artwork is still being prepared, reopen the project from your dashboard and the preview can continue from there.`,
      ``,
      `Kidz Story Magic`,
    ].join('\n'),
    html: `
      <div style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,sans-serif;color:#10213a;">
        <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
          <div style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 50px rgba(15,23,42,0.08);">
            <div style="padding:32px;background:linear-gradient(135deg,#0f766e 0%,#1d4ed8 100%);color:#ffffff;">
              <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;font-weight:700;opacity:0.85;">
                Kidz Story Magic
              </p>
              <h1 style="margin:0;font-size:32px;line-height:1.2;">
                Your preview link is ready
              </h1>
              <p style="margin:14px 0 0;font-size:16px;line-height:1.6;opacity:0.92;">
                We saved the project details for ${safeChildName} so you can reopen the preview later without losing your place.
              </p>
            </div>

            <div style="padding:32px;">
              <div style="margin-bottom:24px;padding:20px;border-radius:18px;background:#f8fafc;border:1px solid #dbeafe;">
                <p style="margin:0 0 10px;font-size:14px;color:#475569;"><strong>Recipient:</strong> ${recipientEmail}</p>
                <p style="margin:0 0 10px;font-size:14px;color:#475569;"><strong>Project ID:</strong> ${projectId || 'Unavailable'}</p>
                <p style="margin:0 0 10px;font-size:14px;color:#475569;"><strong>Theme:</strong> ${safeTheme}</p>
                <p style="margin:0;font-size:14px;color:#475569;"><strong>Page count:</strong> ${safePageCount}</p>
              </div>

              <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#334155;">
                If the artwork is still being painted, reopen your project from the link below and the preview flow can continue from there.
              </p>

              <div style="margin:28px 0 14px;">
                <a href="${previewUrl}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;">
                  Continue Preview
                </a>
              </div>

              <div style="margin:0 0 14px;">
                <a href="${dashboardUrl}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#e2e8f0;color:#10213a;text-decoration:none;font-weight:700;">
                  Open Dashboard
                </a>
              </div>

              <div style="margin:0 0 24px;">
                <a href="${checkoutUrl}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#ecfeff;color:#0f766e;text-decoration:none;font-weight:700;border:1px solid #99f6e4;">
                  Return to Checkout
                </a>
              </div>

              <p style="margin:0;font-size:13px;line-height:1.7;color:#64748b;">
                Need help? Reply to this email and our team will jump in.
              </p>
            </div>
          </div>
        </div>
      </div>
    `,
  };
}

export async function POST(request) {
  try {
    if (!isAutomatedEmailConfigured()) {
      return NextResponse.json(
        {
          error: 'Automated email is not configured yet.',
          details:
            'Add RESEND_API_KEY in Vercel and optionally RESEND_FROM_EMAIL before sending preview emails.',
        },
        { status: 503 }
      );
    }

    const { error, decoded, user } = await getAuthenticatedUser(request);
    if (error) {
      return error;
    }

    const body = await request.json();
    const {
      childName,
      pageCount,
      projectId,
      previewUrl,
      recipientEmail,
      theme,
    } = body || {};

    const normalizedRecipient = normalizeEmail(
      recipientEmail || user?.email || decoded?.email
    );

    if (!isValidEmail(normalizedRecipient)) {
      return NextResponse.json(
        {
          error: 'A valid recipient email is required before sending the preview.',
        },
        { status: 400 }
      );
    }

    const siteBaseUrl = getSiteBaseUrl(request);
    const safePreviewUrl =
      typeof previewUrl === 'string' && /^https?:\/\//.test(previewUrl)
        ? previewUrl
        : `${siteBaseUrl}/wizard?step=6`;
    const dashboardUrl = `${siteBaseUrl}/dashboard`;
    const checkoutUrl = `${siteBaseUrl}/wizard?step=6`;
    const emailContent = buildPreviewEmail({
      childName,
      pageCount,
      projectId,
      recipientEmail: normalizedRecipient,
      theme,
      previewUrl: safePreviewUrl,
      dashboardUrl,
      checkoutUrl,
    });

    const result = await sendTransactionalEmail({
      to: normalizedRecipient,
      ...(shouldBccSupport(normalizedRecipient)
        ? { bcc: SUPPORT_NOTIFICATION_EMAIL }
        : {}),
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      idempotencyKey: `preview-email-${projectId || 'unknown'}-${normalizedRecipient}`,
    });

    return NextResponse.json(
      {
        success: true,
        emailId: result?.id || result?.data?.id || null,
        recipientEmail: normalizedRecipient,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PREVIEW_EMAIL] Failed to send preview email:', error);

    const errorMessage = error?.message || 'Unknown email delivery error.';
    if (isResendTestingModeMessage(errorMessage)) {
      const allowedEmail = extractResendTestingAddress(errorMessage);
      const details = [
        'Resend is still in test mode, so automated emails can only be delivered to the account owner right now.',
        allowedEmail ? `Current allowed testing address: ${allowedEmail}.` : null,
        'To send preview emails to any parent email address, verify your domain in Resend and change RESEND_FROM_EMAIL to an address on that verified domain.',
      ]
        .filter(Boolean)
        .join(' ');

      return NextResponse.json(
        {
          error: 'Automated preview email is still in Resend test mode.',
          details,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to send preview email.',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
