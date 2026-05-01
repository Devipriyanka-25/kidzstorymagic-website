import { sendTransactionalEmail } from '@/lib/email';
import {
  buildOrderContactDetails,
  formatOrderAddressInline,
  formatOrderAddressLines,
} from '@/lib/orderData';

const DEFAULT_APP_URL = 'http://localhost:3000';
const TWILIO_API_BASE = 'https://api.twilio.com/2010-04-01/Accounts';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeBaseUrl(value = '') {
  return String(value || '').trim().replace(/\/$/, '');
}

export function resolveConfiguredAppBaseUrl() {
  const configuredUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
  if (configuredUrl) {
    return configuredUrl;
  }

  const vercelUrl = normalizeBaseUrl(process.env.VERCEL_URL);
  if (vercelUrl) {
    return vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;
  }

  return DEFAULT_APP_URL;
}

function formatCurrency(amount, currency = 'USD') {
  const normalizedCurrency = String(currency || 'USD').toUpperCase();
  const numericAmount = Number(amount || 0);

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: normalizedCurrency,
    }).format(numericAmount);
  } catch {
    return `${normalizedCurrency} ${numericAmount.toFixed(2)}`;
  }
}

function renderAddressHtml(address, title) {
  if (!address) {
    return '';
  }

  const lines = formatOrderAddressLines(address)
    .map((line) => escapeHtml(line))
    .join('<br />');

  return `
    <div style="background:#ffffff;border:1px solid #dbeafe;border-radius:20px;padding:18px 20px;">
      <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;font-weight:800;color:#2563eb;">
        ${escapeHtml(title)}
      </p>
      <p style="margin:0;font-size:15px;line-height:1.7;color:#334155;">
        ${lines}
      </p>
    </div>
  `;
}

function buildOrderConfirmationEmail({
  session,
  orderId,
  projectId,
  orderUrl,
  contact,
}) {
  const childName = escapeHtml(session?.metadata?.childName || 'your child');
  const theme = escapeHtml(session?.metadata?.theme || 'personalized story');
  const buyerName = escapeHtml(contact.customerName || 'Story Family');
  const amount = formatCurrency(
    Number(session?.amount_total || 0) / 100,
    session?.currency || session?.metadata?.currency || 'USD'
  );
  const pageCount = escapeHtml(session?.metadata?.pageCount || '');
  const giftRecipient =
    session?.metadata?.isGift === 'true'
      ? escapeHtml(session?.metadata?.giftRecipientName || 'Gift Recipient')
      : null;

  const giftBlock = giftRecipient
    ? `
      <div style="margin-top:20px;border-left:4px solid #f97316;background:#fff7ed;border-radius:18px;padding:16px 18px;">
        <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#9a3412;">Gift delivery</p>
        <p style="margin:0;font-size:15px;line-height:1.7;color:#7c2d12;">
          We also sent the gift story email to ${giftRecipient}.
        </p>
      </div>
    `
    : '';

  return {
    subject: `Your Kidz Story Magic order #${orderId || session?.id} is confirmed`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
        </head>
        <body style="margin:0;padding:0;background:#eff6ff;font-family:Arial,sans-serif;color:#0f172a;">
          <div style="max-width:660px;margin:0 auto;padding:28px 18px;">
            <div style="background:linear-gradient(180deg,#ffffff 0%,#f8fafc 100%);border-radius:30px;padding:36px 30px;box-shadow:0 24px 60px rgba(15,23,42,0.12);">
              <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.28em;text-transform:uppercase;font-weight:800;color:#2563eb;">
                Order Confirmed
              </p>
              <h1 style="margin:0 0 18px;font-size:34px;line-height:1.15;color:#0f172a;">
                Your magical story order is in
              </h1>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:#334155;">
                Hi ${buyerName}, thank you for your purchase. We have confirmed your Kidz Story Magic order and saved the fulfillment details from checkout.
              </p>

              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:24px;padding:20px 22px;margin:22px 0;">
                <p style="margin:0 0 8px;font-size:14px;line-height:1.8;color:#1e3a8a;">
                  <strong>Order:</strong> ${escapeHtml(orderId || session?.id || 'Pending')}<br />
                  <strong>Project:</strong> ${escapeHtml(projectId || session?.metadata?.projectId || '')}<br />
                  <strong>Story:</strong> ${childName} - ${theme}${pageCount ? ` (${pageCount} pages)` : ''}<br />
                  <strong>Total:</strong> ${escapeHtml(amount)}
                </p>
              </div>

              <div style="display:grid;gap:14px;">
                ${renderAddressHtml(contact.billingAddress, 'Billing Address')}
                ${renderAddressHtml(contact.shippingAddress, 'Shipping Address')}
              </div>

              ${giftBlock}

              <div style="margin-top:28px;">
                <a href="${escapeHtml(orderUrl)}" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#0f766e 100%);color:#ffffff;text-decoration:none;padding:16px 24px;border-radius:999px;font-weight:800;">
                  View Order Details
                </a>
              </div>

              <p style="margin:24px 0 0;font-size:14px;line-height:1.8;color:#64748b;">
                Need help with your order? Reply to this email and our team will jump in.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${contact.customerName || 'Story Family'},

Your Kidz Story Magic order has been confirmed.

Order: ${orderId || session?.id || 'Pending'}
Project: ${projectId || session?.metadata?.projectId || ''}
Story: ${session?.metadata?.childName || 'your child'} - ${session?.metadata?.theme || 'personalized story'}${session?.metadata?.pageCount ? ` (${session.metadata.pageCount} pages)` : ''}
Total: ${amount}

Billing address: ${formatOrderAddressInline(contact.billingAddress) || 'Not provided'}
Shipping address: ${formatOrderAddressInline(contact.shippingAddress) || 'Not provided'}

View order details: ${orderUrl}

Kidz Story Magic`,
  };
}

function buildOrderConfirmationSms({
  session,
  orderId,
  orderUrl,
}) {
  const amount = formatCurrency(
    Number(session?.amount_total || 0) / 100,
    session?.currency || session?.metadata?.currency || 'USD'
  );

  return `Kidz Story Magic: your order ${orderId || session?.id || ''} is confirmed for ${session?.metadata?.childName || 'your storybook'} (${amount}). View details: ${orderUrl}`;
}

export function isSmsConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM_PHONE
  );
}

export async function sendOrderConfirmationEmail({
  session,
  orderId,
  projectId,
  appBaseUrl,
}) {
  const contact = buildOrderContactDetails(session);
  if (!contact.customerEmail) {
    throw new Error('Customer email is missing from the completed checkout session.');
  }

  const resolvedAppBaseUrl = normalizeBaseUrl(appBaseUrl) || resolveConfiguredAppBaseUrl();
  const orderUrl = `${resolvedAppBaseUrl}/success?session_id=${encodeURIComponent(
    session.id
  )}&project_id=${encodeURIComponent(projectId)}`;
  const emailContent = buildOrderConfirmationEmail({
    session,
    orderId,
    projectId,
    orderUrl,
    contact,
  });

  await sendTransactionalEmail({
    to: contact.customerEmail,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
    idempotencyKey: `order-confirmation-${String(session.id)}`,
  });

  return contact;
}

export async function sendOrderConfirmationSms({
  session,
  orderId,
  projectId,
  appBaseUrl,
}) {
  const contact = buildOrderContactDetails(session);
  if (!contact.customerPhone) {
    throw new Error('Customer phone number is missing from the completed checkout session.');
  }

  if (!isSmsConfigured()) {
    throw new Error(
      'SMS notifications are not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_PHONE.'
    );
  }

  const resolvedAppBaseUrl = normalizeBaseUrl(appBaseUrl) || resolveConfiguredAppBaseUrl();
  const orderUrl = `${resolvedAppBaseUrl}/success?session_id=${encodeURIComponent(
    session.id
  )}&project_id=${encodeURIComponent(projectId)}`;
  const body = new URLSearchParams({
    To: contact.customerPhone,
    From: process.env.TWILIO_FROM_PHONE,
    Body: buildOrderConfirmationSms({
      session,
      orderId,
      orderUrl,
    }),
  });

  const credentials = Buffer.from(
    `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
  ).toString('base64');
  const response = await fetch(
    `${TWILIO_API_BASE}/${encodeURIComponent(
      process.env.TWILIO_ACCOUNT_SID
    )}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    }
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      payload?.message || payload?.error_message || 'Failed to send order confirmation SMS.'
    );
  }

  return payload;
}
