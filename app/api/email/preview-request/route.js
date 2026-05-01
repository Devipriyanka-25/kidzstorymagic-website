import { NextResponse } from 'next/server';
import {
  findAuthUserByEmail,
  findAuthUserById,
  isPersistentAuthAvailable,
  normalizeEmail,
} from '../../shared/authUsers.js';
import {
  getStoryProjectById,
  listStoryProjectPages,
  updateStoryProjectRecord,
} from '../../shared/storyProjects.js';
import {
  isAutomatedEmailConfigured,
} from '../../../../lib/email.js';
import {
  getPreviewEmailSiteBaseUrl,
  sendPreviewReadyEmail,
} from '../../../../lib/previewEmail.js';

const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PREVIEW_EMAIL_REQUEST_STATUS_PENDING = 'pending';

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

  return {
    decoded,
    user:
      user ||
      (decoded?.id
        ? {
            id: decoded.id,
            email: decoded.email || '',
            name: decoded.name || decoded.email || '',
          }
        : null),
  };
}

function buildPendingPreviewEmailRequest({
  recipientEmail,
  childName,
  pageCount,
  theme,
}) {
  return {
    recipientEmail,
    childName: childName || '',
    pageCount: Number(pageCount) || 0,
    theme: theme || '',
    requestedAt: new Date().toISOString(),
    status: PREVIEW_EMAIL_REQUEST_STATUS_PENDING,
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

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      childName,
      pageCount,
      projectId,
      recipientEmail,
      theme,
    } = body || {};
    const normalizedProjectId = String(projectId || '').trim();

    if (!normalizedProjectId) {
      return NextResponse.json(
        {
          error: 'A valid project ID is required before emailing the preview.',
        },
        { status: 400 }
      );
    }

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

    const [storyProject, savedPages] = await Promise.all([
      getStoryProjectById(user.id, normalizedProjectId),
      listStoryProjectPages(normalizedProjectId),
    ]);

    if (!storyProject) {
      return NextResponse.json(
        { error: 'Story project not found.' },
        { status: 404 }
      );
    }

    const resolvedChildName =
      childName || storyProject.childName || storyProject.child_name || '';
    const resolvedPageCount =
      Number(pageCount) ||
      Number(storyProject.pageCount || storyProject.page_count) ||
      0;
    const resolvedTheme = theme || storyProject.theme || '';
    const siteBaseUrl = getPreviewEmailSiteBaseUrl(request.nextUrl?.origin);

    if (!Array.isArray(savedPages) || savedPages.length === 0) {
      const currentPhotoMetadata =
        storyProject?.photo_metadata &&
        typeof storyProject.photo_metadata === 'object'
          ? storyProject.photo_metadata
          : {};

      await updateStoryProjectRecord(user.id, normalizedProjectId, {
        photo_metadata: {
          ...currentPhotoMetadata,
          previewEmailRequest: buildPendingPreviewEmailRequest({
            recipientEmail: normalizedRecipient,
            childName: resolvedChildName,
            pageCount: resolvedPageCount,
            theme: resolvedTheme,
          }),
        },
      });

      return NextResponse.json(
        {
          success: true,
          queued: true,
          recipientEmail: normalizedRecipient,
          message:
            'We are still finishing the preview. We will email your saved preview link shortly.',
        },
        { status: 200 }
      );
    }

    const result = await sendPreviewReadyEmail({
      childName: resolvedChildName,
      pageCount: resolvedPageCount,
      projectId: normalizedProjectId,
      recipientEmail: normalizedRecipient,
      theme: resolvedTheme,
      appUrl: siteBaseUrl,
    });

    return NextResponse.json(
      {
        success: true,
        queued: false,
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
