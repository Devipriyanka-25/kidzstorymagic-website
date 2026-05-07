export const DRAFT_TTL_HOURS = 24;
export const DRAFT_TTL_MS = DRAFT_TTL_HOURS * 60 * 60 * 1000;

function resolveTimestamp(value) {
  const normalized = String(value || '').trim();

  if (!normalized) {
    return null;
  }

  const timestamp = new Date(normalized).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function getLocalDraftSavedAt(snapshot = {}) {
  return (
    snapshot?.savedAt ||
    snapshot?.updatedAt ||
    snapshot?.formData?.lastSavedAt ||
    ''
  );
}

export function isLocalDraftExpired(snapshot = {}, now = Date.now()) {
  const savedAtTimestamp = resolveTimestamp(getLocalDraftSavedAt(snapshot));

  if (savedAtTimestamp === null) {
    return false;
  }

  return savedAtTimestamp + DRAFT_TTL_MS <= now;
}
