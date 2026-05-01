import { NextResponse } from 'next/server';

import { isAutomatedEmailConfigured } from '../../../../lib/email.js';
import {
  getPreviewEmailSiteBaseUrl,
  sendMagicPreviewEmail,
} from '../../../../lib/previewEmail.js';
import { normalizeEmail } from '../../shared/authUsers.js';
import { createMagicLinkRecord } from '../../shared/magicLinks.js';
import { resolveRequestUser } from '../../shared/requestAuth.js';
import {
  getSavedStoryForPreview,
  isStoryGenerationComplete,
} from '../../shared/storyDrafts.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WAIT_FOR_GENERATION_MESSAGE =
  'Your story is still being created. Please wait until generation is complete before sending it to your email.';

function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value || '').trim());
}

export async function POST(request) {
  try {
    const { error, authUser, decoded } = await resolveRequestUser(request);
    if (error) {
      return error;
    }

    const body = await request.json();
    const projectId = String(body?.projectId || body?.storyId || '').trim();
    const recipientEmail = normalizeEmail(
      body?.recipientEmail || authUser.email || decoded?.email
    );

    if (!projectId) {
      return NextResponse.json(
        { error: 'A valid story ID is required before sending email.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(recipientEmail)) {
      return NextResponse.json(
        { error: 'A valid recipient email is required before sending email.' },
        { status: 400 }
      );
    }

    const savedStory = await getSavedStoryForPreview(authUser.id, projectId);
    if (!savedStory) {
      return NextResponse.json(
        { error: 'Story preview not found.' },
        { status: 404 }
      );
    }

    if (!isStoryGenerationComplete(savedStory, savedStory.pages)) {
      return NextResponse.json(
        {
          error: WAIT_FOR_GENERATION_MESSAGE,
          code: 'GENERATION_NOT_COMPLETE',
        },
        { status: 409 }
      );
    }

    if (!isAutomatedEmailConfigured()) {
      return NextResponse.json(
        {
          error: 'Automated email is not configured yet.',
          details:
            'Add RESEND_API_KEY in Vercel and optionally RESEND_FROM_EMAIL before sending story preview emails.',
        },
        { status: 503 }
      );
    }

    const magicLink = await createMagicLinkRecord({
      storyId: projectId,
      userId: authUser.id,
    });

    const result = await sendMagicPreviewEmail({
      childName: savedStory.childName || savedStory.child_name,
      expiresAt: magicLink.expiresAt,
      pageCount: savedStory.pageCount || savedStory.page_count,
      projectId,
      recipientEmail,
      theme: body?.theme || savedStory.theme,
      token: magicLink.token,
      appUrl: getPreviewEmailSiteBaseUrl(request.nextUrl?.origin),
    });

    return NextResponse.json(
      {
        success: true,
        emailId: result?.id || result?.data?.id || null,
        recipientEmail,
        expiresAt: magicLink.expiresAt,
        message: `We emailed the secure preview link to ${recipientEmail}.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[STORY_SEND_EMAIL] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send story preview email.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
