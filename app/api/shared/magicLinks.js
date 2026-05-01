import crypto from 'crypto';

import { supabaseClient } from './supabaseClient.js';

const MAGIC_LINK_TTL_MS = 60 * 60 * 1000;

function requireMagicLinkStorage() {
  if (!supabaseClient) {
    throw new Error('Magic link storage is not configured.');
  }

  return supabaseClient;
}

export function createMagicLinkToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function hashMagicLinkToken(token) {
  return crypto
    .createHash('sha256')
    .update(String(token || ''), 'utf8')
    .digest('hex');
}

export function getMagicLinkExpiry() {
  return new Date(Date.now() + MAGIC_LINK_TTL_MS).toISOString();
}

export async function createMagicLinkRecord({ storyId, userId }) {
  const client = requireMagicLinkStorage();
  const token = createMagicLinkToken();
  const tokenHash = hashMagicLinkToken(token);
  const expiresAt = getMagicLinkExpiry();

  const { data, error } = await client
    .from('magic_links')
    .insert({
      token_hash: tokenHash,
      story_id: Number(storyId),
      user_id: Number(userId),
      expires_at: expiresAt,
    })
    .select('id, story_id, user_id, expires_at, created_at')
    .single();

  if (error) {
    throw new Error(
      `Failed to create preview magic link: ${error.message || 'Unknown error'}`
    );
  }

  return {
    token,
    tokenHash,
    storyId: String(data.story_id),
    userId: String(data.user_id),
    expiresAt: data.expires_at,
    createdAt: data.created_at,
  };
}

export async function validateMagicLinkToken(token) {
  const normalizedToken = String(token || '').trim();
  if (!normalizedToken) {
    return { valid: false, reason: 'missing' };
  }

  const client = requireMagicLinkStorage();
  const tokenHash = hashMagicLinkToken(normalizedToken);

  const { data, error } = await client
    .from('magic_links')
    .select('id, story_id, user_id, expires_at, used_at, created_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to validate preview magic link: ${error.message || 'Unknown error'}`
    );
  }

  if (!data) {
    return { valid: false, reason: 'invalid' };
  }

  const expiresAt = new Date(data.expires_at).getTime();
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return {
      valid: false,
      reason: 'expired',
      link: data,
    };
  }

  return {
    valid: true,
    link: {
      id: data.id,
      storyId: String(data.story_id),
      userId: String(data.user_id),
      expiresAt: data.expires_at,
      createdAt: data.created_at,
    },
  };
}
