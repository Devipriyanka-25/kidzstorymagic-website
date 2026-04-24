const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_FROM_EMAIL = 'Kidz Story Magic <onboarding@resend.dev>';
const DEFAULT_REPLY_TO_EMAIL = 'support@kidzstorymagic.com';

function normalizeRecipients(value) {
  if (!value) {
    return [];
  }

  return (Array.isArray(value) ? value : [value]).filter(Boolean);
}

function getResendErrorMessage(payload) {
  if (typeof payload?.message === 'string' && payload.message) {
    return payload.message;
  }

  if (typeof payload?.error?.message === 'string' && payload.error.message) {
    return payload.error.message;
  }

  if (typeof payload?.error === 'string' && payload.error) {
    return payload.error;
  }

  return 'Failed to send email.';
}

export function isAutomatedEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export function getEmailFromAddress() {
  return process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;
}

export function getEmailReplyToAddress() {
  return process.env.RESEND_REPLY_TO_EMAIL || DEFAULT_REPLY_TO_EMAIL;
}

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
  bcc,
  replyTo,
  idempotencyKey,
}) {
  if (!isAutomatedEmailConfigured()) {
    throw new Error(
      'Automated email is not configured. Add RESEND_API_KEY before sending emails.'
    );
  }

  const recipients = normalizeRecipients(to);
  if (recipients.length === 0) {
    throw new Error('At least one recipient email address is required.');
  }

  const bccRecipients = normalizeRecipients(bcc);
  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      ...(idempotencyKey
        ? {
            'Idempotency-Key': idempotencyKey,
          }
        : {}),
    },
    body: JSON.stringify({
      from: getEmailFromAddress(),
      to: recipients,
      subject,
      html,
      text,
      reply_to: replyTo || getEmailReplyToAddress(),
      ...(bccRecipients.length > 0 ? { bcc: bccRecipients } : {}),
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(getResendErrorMessage(payload));
  }

  return payload;
}
