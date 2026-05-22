function normalizeEmail(email) {
  return String(email || '').toLowerCase().trim();
}

const MAX_EPHEMERAL_RESET_TOKENS = 1000;
const ephemeralResetTokens = new Map();
const configuredTokenLimit = Number.parseInt(
  process.env.MAX_EPHEMERAL_RESET_TOKENS || String(MAX_EPHEMERAL_RESET_TOKENS),
  10
);

function getMaxEphemeralResetTokens() {
  if (!Number.isFinite(configuredTokenLimit) || configuredTokenLimit <= 0) {
    return MAX_EPHEMERAL_RESET_TOKENS;
  }
  return configuredTokenLimit;
}

function clearExpiredEphemeralResetTokens() {
  const now = Date.now();
  for (const [tokenHash, tokenRecord] of ephemeralResetTokens.entries()) {
    const expiresAtMs = Date.parse(String(tokenRecord?.resetTokenExpiry || ''));
    if (!Number.isFinite(expiresAtMs) || expiresAtMs <= now) {
      ephemeralResetTokens.delete(tokenHash);
    }
  }
}

function enforceEphemeralResetTokenLimit() {
  const maxTokens = getMaxEphemeralResetTokens();
  while (ephemeralResetTokens.size > maxTokens) {
    let oldestTokenHash = null;
    let oldestCreatedAtMs = Number.POSITIVE_INFINITY;
    for (const [tokenHash, tokenRecord] of ephemeralResetTokens.entries()) {
      const createdAtMs = Date.parse(String(tokenRecord?.createdAt || ''));
      if (Number.isFinite(createdAtMs) && createdAtMs < oldestCreatedAtMs) {
        oldestCreatedAtMs = createdAtMs;
        oldestTokenHash = tokenHash;
      }
    }
    if (!oldestTokenHash) {
      break;
    }
    ephemeralResetTokens.delete(oldestTokenHash);
  }
}

export function saveEphemeralResetToken({
  email,
  resetTokenHash,
  resetTokenExpiry,
}) {
  if (!resetTokenHash) {
    return;
  }

  clearExpiredEphemeralResetTokens();
  ephemeralResetTokens.set(resetTokenHash, {
    email: normalizeEmail(email),
    resetTokenExpiry: String(resetTokenExpiry || ''),
    createdAt: new Date().toISOString(),
  });
  enforceEphemeralResetTokenLimit();
}

export function consumeEphemeralResetToken(resetTokenHash) {
  const key = String(resetTokenHash || '');
  if (!key) {
    return null;
  }

  const tokenRecord = ephemeralResetTokens.get(key);
  if (!tokenRecord) {
    return null;
  }

  ephemeralResetTokens.delete(key);

  if (!tokenRecord.resetTokenExpiry) {
    return null;
  }

  const expiresAtMs = Date.parse(tokenRecord.resetTokenExpiry);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
    return null;
  }

  return tokenRecord.email || null;
}

export function clearEphemeralResetTokens() {
  ephemeralResetTokens.clear();
}
