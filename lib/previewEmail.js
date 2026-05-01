import {
  isResendSandboxSender,
  sendTransactionalEmail,
} from './email.js';

const DEFAULT_SITE_BASE_URL = 'https://www.kidzstorymagic.org';
const SUPPORT_NOTIFICATION_EMAIL =
  process.env.PREVIEW_REQUEST_NOTIFICATION_EMAIL ||
  'support@kidzstorymagic.com';

function isValidExternalUrl(value) {
  return /^https?:\/\//.test(String(value || '').trim());
}

function shouldBccSupport(recipientEmail) {
  if (isResendSandboxSender()) {
    return false;
  }

  return (
    String(recipientEmail || '').trim().toLowerCase() !==
    String(SUPPORT_NOTIFICATION_EMAIL || '').trim().toLowerCase()
  );
}

export function getPreviewEmailSiteBaseUrl(fallbackOrigin = '') {
  const configuredUrl = String(process.env.NEXT_PUBLIC_APP_URL || '').trim();
  if (
    configuredUrl &&
    isValidExternalUrl(configuredUrl) &&
    !configuredUrl.includes('localhost')
  ) {
    return configuredUrl.replace(/\/$/, '');
  }

  const normalizedFallback = String(fallbackOrigin || '').trim();
  if (normalizedFallback && isValidExternalUrl(normalizedFallback)) {
    return normalizedFallback.replace(/\/$/, '');
  }

  return DEFAULT_SITE_BASE_URL;
}

export function buildPreviewResumeUrl({ appUrl, projectId }) {
  const siteBaseUrl = getPreviewEmailSiteBaseUrl(appUrl);

  if (!projectId) {
    return `${siteBaseUrl}/wizard?step=6`;
  }

  return `${siteBaseUrl}/wizard?step=6&resume=preview-email&projectId=${encodeURIComponent(
    projectId
  )}`;
}

export function buildCheckoutResumeUrl({ appUrl, projectId }) {
  const siteBaseUrl = getPreviewEmailSiteBaseUrl(appUrl);

  if (!projectId) {
    return `${siteBaseUrl}/wizard?step=6`;
  }

  return `${siteBaseUrl}/wizard?step=6&resume=checkout&projectId=${encodeURIComponent(
    projectId
  )}`;
}

export function buildMagicPreviewUrl({ appUrl, token }) {
  const siteBaseUrl = getPreviewEmailSiteBaseUrl(appUrl);
  return `${siteBaseUrl}/preview?token=${encodeURIComponent(token || '')}`;
}

function buildPreviewEmailContent({
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
      'Hi,',
      '',
      `Here is your Kidz Story Magic preview link for ${safeChildName}.`,
      `Recipient: ${recipientEmail}`,
      `Project ID: ${projectId || 'Unavailable'}`,
      `Theme: ${safeTheme}`,
      `Page count: ${safePageCount}`,
      '',
      `Continue preview: ${previewUrl}`,
      `Open dashboard: ${dashboardUrl}`,
      `Return to checkout: ${checkoutUrl}`,
      '',
      'If the artwork is still being prepared, reopen the project from this link and the saved preview will continue from the stored pages.',
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
              <h1 style="margin:0;font-size:32px;line-height:1.2;">
                Your preview link is ready
              </h1>
              <p style="margin:14px 0 0;font-size:16px;line-height:1.6;opacity:0.92;">
                We saved ${safeChildName}&apos;s project so you can reopen the preview later without losing your place.
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
                Open the saved preview from the button below. If illustrations are still finishing, the project will continue from the stored pages instead of starting over.
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

export async function sendPreviewReadyEmail({
  childName,
  pageCount,
  projectId,
  recipientEmail,
  theme,
  appUrl,
}) {
  const siteBaseUrl = getPreviewEmailSiteBaseUrl(appUrl);
  const previewUrl = buildPreviewResumeUrl({
    appUrl: siteBaseUrl,
    projectId,
  });
  const dashboardUrl = `${siteBaseUrl}/dashboard`;
  const checkoutUrl = buildCheckoutResumeUrl({
    appUrl: siteBaseUrl,
    projectId,
  });
  const emailContent = buildPreviewEmailContent({
    childName,
    pageCount,
    projectId,
    recipientEmail,
    theme,
    previewUrl,
    dashboardUrl,
    checkoutUrl,
  });

  return sendTransactionalEmail({
    to: recipientEmail,
    ...(shouldBccSupport(recipientEmail)
      ? { bcc: SUPPORT_NOTIFICATION_EMAIL }
      : {}),
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
    idempotencyKey: `preview-email-${projectId || 'unknown'}-${recipientEmail}`,
  });
}

export async function sendMagicPreviewEmail({
  childName,
  expiresAt,
  pageCount,
  projectId,
  recipientEmail,
  theme,
  token,
  appUrl,
}) {
  const siteBaseUrl = getPreviewEmailSiteBaseUrl(appUrl);
  const previewUrl = buildMagicPreviewUrl({
    appUrl: siteBaseUrl,
    token,
  });
  const dashboardUrl = `${siteBaseUrl}/dashboard`;
  const checkoutUrl = buildCheckoutResumeUrl({
    appUrl: siteBaseUrl,
    projectId,
  });
  const safeChildName = childName || 'your child';
  const safeTheme = theme || 'storybook';
  const safePageCount = pageCount || '10';
  const expiryText = expiresAt
    ? new Date(expiresAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/Chicago',
      })
    : '1 hour';

  return sendTransactionalEmail({
    to: recipientEmail,
    ...(shouldBccSupport(recipientEmail)
      ? { bcc: SUPPORT_NOTIFICATION_EMAIL }
      : {}),
    subject: `Your secure Kidz Story Magic preview link for ${safeChildName}`,
    html: `
      <div style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,sans-serif;color:#10213a;">
        <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
          <div style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 50px rgba(15,23,42,0.08);">
            <div style="padding:32px;background:linear-gradient(135deg,#0f766e 0%,#1d4ed8 100%);color:#ffffff;">
              <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;font-weight:700;opacity:0.85;">
                Kidz Story Magic
              </p>
              <h1 style="margin:0;font-size:32px;line-height:1.2;">
                Your secure preview link is ready
              </h1>
              <p style="margin:14px 0 0;font-size:16px;line-height:1.6;opacity:0.92;">
                Open ${safeChildName}&apos;s saved story preview without starting generation again.
              </p>
            </div>

            <div style="padding:32px;">
              <div style="margin-bottom:24px;padding:20px;border-radius:18px;background:#f8fafc;border:1px solid #dbeafe;">
                <p style="margin:0 0 10px;font-size:14px;color:#475569;"><strong>Recipient:</strong> ${recipientEmail}</p>
                <p style="margin:0 0 10px;font-size:14px;color:#475569;"><strong>Project ID:</strong> ${projectId || 'Unavailable'}</p>
                <p style="margin:0 0 10px;font-size:14px;color:#475569;"><strong>Theme:</strong> ${safeTheme}</p>
                <p style="margin:0 0 10px;font-size:14px;color:#475569;"><strong>Page count:</strong> ${safePageCount}</p>
                <p style="margin:0;font-size:14px;color:#475569;"><strong>Expires:</strong> ${expiryText}</p>
              </div>

              <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#334155;">
                This link expires in 1 hour for your family&apos;s privacy.
              </p>

              <div style="margin:28px 0 14px;">
                <a href="${previewUrl}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;">
                  Open Secure Preview
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
    text: [
      'Hi,',
      '',
      `Here is the secure Kidz Story Magic preview link for ${safeChildName}.`,
      `Recipient: ${recipientEmail}`,
      `Project ID: ${projectId || 'Unavailable'}`,
      `Theme: ${safeTheme}`,
      `Page count: ${safePageCount}`,
      `Expires: ${expiryText}`,
      '',
      `Open secure preview: ${previewUrl}`,
      `Open dashboard: ${dashboardUrl}`,
      `Return to checkout: ${checkoutUrl}`,
      '',
      'This link expires in 1 hour.',
      '',
      'Kidz Story Magic',
    ].join('\n'),
    idempotencyKey: `magic-preview-${projectId || 'unknown'}-${recipientEmail}`,
  });
}
