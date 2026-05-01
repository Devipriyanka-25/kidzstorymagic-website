import { normalizeEmail } from './authUsers.js';

function parseAdminEmails(value) {
  return String(value || '')
    .split(/[,\n;\s]+/)
    .map((email) => normalizeEmail(email))
    .filter(Boolean);
}

export function getConfiguredAdminEmails() {
  const adminEmails = [
    ...parseAdminEmails(process.env.ADMIN_EMAILS),
    ...parseAdminEmails(process.env.ADMIN_EMAIL),
  ];

  return Array.from(new Set(adminEmails));
}

export function resolveUserRole(email, fallbackRole = 'customer') {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return fallbackRole;
  }

  return getConfiguredAdminEmails().includes(normalizedEmail)
    ? 'admin'
    : fallbackRole;
}

export function buildClientAuthUser(user) {
  return {
    id: user?.id,
    name: user?.name || '',
    email: user?.email || '',
    profilePictureUrl: user?.profilePictureUrl || user?.profile_picture_url || null,
    preferredCurrency:
      user?.preferredCurrency || user?.preferred_currency || 'USD',
    location: user?.location || null,
    createdAt: user?.createdAt || user?.created_at || null,
    role: resolveUserRole(user?.email, user?.role || 'customer'),
  };
}
