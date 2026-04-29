import jwt from 'jsonwebtoken';
import { sendTransactionalEmail } from '@/lib/email';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_APP_URL = 'http://localhost:3000';

function getGiftTokenSecret() {
  return (
    process.env.GIFT_TOKEN_SECRET ||
    process.env.JWT_SECRET ||
    'kidz-story-magic-gift-preview-secret'
  );
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isValidGiftEmail(email) {
  return EMAIL_PATTERN.test(String(email || '').trim());
}

export function createGiftPreviewToken({ projectId, recipientEmail }) {
  return jwt.sign(
    {
      projectId: String(projectId || ''),
      recipientEmail: String(recipientEmail || '').trim().toLowerCase(),
      kind: 'gift-preview',
    },
    getGiftTokenSecret(),
    { expiresIn: '30d' }
  );
}

export function verifyGiftPreviewToken(token, projectId) {
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, getGiftTokenSecret());
    if (
      payload?.kind !== 'gift-preview' ||
      String(payload?.projectId || '') !== String(projectId || '')
    ) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

export function buildGiftPreviewUrl({ projectId, recipientEmail, appUrl }) {
  const token = createGiftPreviewToken({ projectId, recipientEmail });
  const resolvedAppUrl =
    String(appUrl || process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL).replace(
      /\/$/,
      ''
    );

  return `${resolvedAppUrl}/story/preview/${encodeURIComponent(
    projectId
  )}?gift_token=${encodeURIComponent(token)}`;
}

export function buildGiftStoryEmail({
  recipientName,
  senderName,
  childName,
  giftMessage,
  previewUrl,
}) {
  const safeRecipientName = escapeHtml(recipientName || 'Story Friend');
  const safeSenderName = escapeHtml(senderName || 'Someone special');
  const safeChildName = escapeHtml(childName || 'a special child');
  const safeGiftMessage = escapeHtml(giftMessage || '');
  const safePreviewUrl = escapeHtml(previewUrl);

  return {
    subject: `A magical story gift is waiting for you from ${safeSenderName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { margin: 0; padding: 0; background: #f8fafc; font-family: Arial, sans-serif; color: #0f172a; }
            .wrap { max-width: 620px; margin: 0 auto; padding: 24px; }
            .card { background: linear-gradient(180deg, #fff7ed 0%, #ffffff 32%); border-radius: 28px; padding: 36px 32px; box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12); }
            .eyebrow { font-size: 12px; letter-spacing: 0.28em; text-transform: uppercase; font-weight: 800; color: #ea580c; }
            h1 { font-size: 32px; line-height: 1.15; margin: 14px 0 16px; }
            p { font-size: 16px; line-height: 1.8; margin: 0 0 16px; color: #334155; }
            .message { background: #fff1f2; border-left: 5px solid #f43f5e; border-radius: 18px; padding: 18px 18px 18px 20px; margin: 22px 0; }
            .cta { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: #ffffff !important; text-decoration: none; padding: 16px 26px; border-radius: 999px; font-weight: 800; margin: 12px 0 8px; }
            .footer { margin-top: 28px; font-size: 13px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="card">
              <div class="eyebrow">Gift a Story</div>
              <h1>A magical story gift has arrived</h1>
              <p>Hello ${safeRecipientName},</p>
              <p>
                <strong>${safeSenderName}</strong> sent you a Kidz Story Magic
                story starring <strong>${safeChildName}</strong>. It is ready to
                open now.
              </p>
              ${
                safeGiftMessage
                  ? `<div class="message"><p style="margin:0 0 10px;"><strong>Personal note</strong></p><p style="margin:0;">${safeGiftMessage}</p></div>`
                  : ''
              }
              <a class="cta" href="${safePreviewUrl}">Open the Story Gift</a>
              <p>
                This secure link opens the preview and download experience for
                the gifted story.
              </p>
              <div class="footer">
                Kidz Story Magic<br />
                Need help? Reply to this email and our team will jump in.
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hello ${recipientName || 'Story Friend'},

${senderName || 'Someone special'} sent you a Kidz Story Magic story starring ${childName || 'a special child'}.

${giftMessage ? `Personal note: ${giftMessage}\n\n` : ''}Open the story gift here:
${previewUrl}

Kidz Story Magic`,
  };
}

export async function sendGiftStoryEmail({
  recipientName,
  recipientEmail,
  senderName,
  senderEmail,
  childName,
  giftMessage,
  previewUrl,
}) {
  if (!recipientName || !isValidGiftEmail(recipientEmail) || !previewUrl) {
    throw new Error(
      'Recipient name, a valid recipient email, and preview URL are required.'
    );
  }

  const emailContent = buildGiftStoryEmail({
    recipientName,
    senderName,
    childName,
    giftMessage,
    previewUrl,
  });

  return sendTransactionalEmail({
    to: recipientEmail,
    bcc: senderEmail ? [senderEmail] : [],
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
    idempotencyKey: `gift-story-${String(recipientEmail).trim().toLowerCase()}-${String(
      childName || 'child'
    )
      .trim()
      .toLowerCase()}`,
  });
}
