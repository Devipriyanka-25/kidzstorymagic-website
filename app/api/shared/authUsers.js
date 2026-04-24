import { supabaseClient } from './supabaseClient.js';

const AUTH_USER_COLUMNS = `
  id,
  name,
  email,
  password_hash,
  preferred_currency,
  profile_picture_url,
  location,
  created_at,
  is_active
`;

function wrapSupabaseError(action, error) {
  const wrappedError = new Error(
    `[AUTH_USERS] ${action} failed: ${error?.message || 'Unknown error'}`
  );
  wrappedError.code = error?.code;
  wrappedError.details = error?.details;
  return wrappedError;
}

function isPersistentId(value) {
  return /^\d+$/.test(String(value ?? ''));
}

export function normalizeEmail(email) {
  return String(email || '').toLowerCase().trim();
}

export function isPersistentAuthAvailable() {
  return Boolean(supabaseClient);
}

export function isDuplicateAuthUserError(error) {
  const code = String(error?.code || '');
  const message = `${error?.message || ''} ${error?.details || ''}`.toLowerCase();

  return (
    code === '23505' ||
    (message.includes('duplicate') && message.includes('email'))
  );
}

export async function findAuthUserByEmail(email) {
  if (!supabaseClient) {
    return null;
  }

  const normalizedEmail = normalizeEmail(email);

  const { data, error } = await supabaseClient
    .from('users')
    .select(AUTH_USER_COLUMNS)
    .eq('email', normalizedEmail)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw wrapSupabaseError('lookup by email', error);
  }

  return data || null;
}

export async function findAuthUserById(id) {
  if (!supabaseClient || !isPersistentId(id)) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from('users')
    .select(AUTH_USER_COLUMNS)
    .eq('id', Number(id))
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw wrapSupabaseError('lookup by id', error);
  }

  return data || null;
}

export async function createAuthUser({
  name,
  email,
  passwordHash,
  preferredCurrency = 'USD',
}) {
  if (!supabaseClient) {
    return null;
  }

  const normalizedEmail = normalizeEmail(email);

  const { data, error } = await supabaseClient
    .from('users')
    .insert({
      name,
      email: normalizedEmail,
      password_hash: passwordHash,
      preferred_currency: preferredCurrency || 'USD',
      is_active: true,
    })
    .select(AUTH_USER_COLUMNS)
    .single();

  if (error) {
    throw wrapSupabaseError('create user', error);
  }

  return data;
}
