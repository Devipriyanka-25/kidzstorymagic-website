function normalizeEmail(email) {
  return String(email || '').toLowerCase().trim();
}

const ephemeralResetTokens = new Map();

export function saveEphemeralResetToken({
  email,
  resetTokenHash,
  resetTokenExpiry,
}) {
  if (!resetTokenHash) {
    return;
  }

  ephemeralResetTokens.set(resetTokenHash, {
    email: normalizeEmail(email),
    resetTokenExpiry: String(resetTokenExpiry || ''),
  });
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
