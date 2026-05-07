import {
  createStoryProjectRecord,
  deleteStoryProjectRecord,
  getStoryProjectById,
  listStoryProjectPages,
  listStoryProjectsByUser,
  replaceStoryProjectPages,
  updateStoryProjectRecord,
} from './storyProjects.js';
import { DRAFT_TTL_HOURS, DRAFT_TTL_MS } from '@/utils/draftExpiry';

export { DRAFT_TTL_HOURS, DRAFT_TTL_MS };
export const ACTIVE_DRAFT_STATUSES = ['draft', 'in_progress', 'pending'];

const DEFAULT_DRAFT_THEME = 'adventure';
const DEFAULT_DRAFT_AGE_GROUP = '5-8';
const DEFAULT_DRAFT_PAGE_COUNT = 10;
const DRAFT_FLOW_METADATA_KEY = 'draftFlow';

function clampWizardStep(step) {
  const parsed = Number(step);
  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.max(1, Math.min(6, Math.trunc(parsed)));
}

function safeNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getDraftFlowMetadata(project = {}) {
  const metadata =
    project?.photo_metadata && typeof project.photo_metadata === 'object'
      ? project.photo_metadata
      : {};

  return metadata[DRAFT_FLOW_METADATA_KEY] &&
    typeof metadata[DRAFT_FLOW_METADATA_KEY] === 'object'
    ? metadata[DRAFT_FLOW_METADATA_KEY]
    : {};
}

export function mergeDraftFlowMetadata(project, patch = {}) {
  const metadata =
    project?.photo_metadata && typeof project.photo_metadata === 'object'
      ? project.photo_metadata
      : {};

  return {
    ...metadata,
    [DRAFT_FLOW_METADATA_KEY]: {
      ...getDraftFlowMetadata(project),
      ...patch,
    },
  };
}

export function getDraftExpiresAt(project, fallbackUpdatedAt = '') {
  const flow = getDraftFlowMetadata(project);
  const metadataExpiry = flow.draftExpiresAt || project?.draftExpiresAt;

  if (metadataExpiry) {
    return metadataExpiry;
  }

  const baseDate = fallbackUpdatedAt || project?.updatedAt || project?.createdAt;
  const parsedDate = baseDate ? new Date(baseDate) : null;

  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    return new Date(Date.now() + DRAFT_TTL_MS).toISOString();
  }

  return new Date(parsedDate.getTime() + DRAFT_TTL_MS).toISOString();
}

export function isDraftExpired(project) {
  const expiresAt = getDraftExpiresAt(project);
  return new Date(expiresAt).getTime() <= Date.now();
}

function isDraftEligibleForExpiry(project = {}) {
  return ACTIVE_DRAFT_STATUSES.includes(String(project?.status || '').toLowerCase());
}

async function deleteExpiredDraftIfNeeded(userId, project) {
  if (!project || !isDraftEligibleForExpiry(project) || !isDraftExpired(project)) {
    return false;
  }

  try {
    await deleteStoryProjectRecord(userId, project.id);
    return true;
  } catch (error) {
    console.warn('[DRAFTS] Failed to delete expired draft:', {
      userId,
      projectId: project?.id,
      error: error?.message || String(error),
    });
    return false;
  }
}

function normalizeStoryPagesFromFormData(formData = {}) {
  const pages =
    formData.storyPreview ||
    formData.pages ||
    formData.story?.pages ||
    null;

  return Array.isArray(pages) ? pages : null;
}

function buildProjectPayloadFromFormData(formData = {}, step = 1) {
  const childName =
    formData.childName ||
    formData.child_name ||
    formData.username ||
    'Story Friend';
  const theme = formData.theme || DEFAULT_DRAFT_THEME;
  const pageCount = safeNumber(
    formData.pageCount || formData.page_count,
    DEFAULT_DRAFT_PAGE_COUNT
  );

  return {
    title:
      formData.title ||
      (childName === 'Story Friend'
        ? 'Untitled Story Draft'
        : `${childName}'s Story`),
    age_group: formData.ageGroup || formData.age_group || DEFAULT_DRAFT_AGE_GROUP,
    theme,
    illustration_style:
      formData.illustrationStyle || formData.illustration_style || '',
    custom_illustration_prompt:
      formData.customIllustrationPrompt ||
      formData.custom_illustration_prompt ||
      null,
    page_count: pageCount,
    child_name: childName,
    child_gender: formData.childGender || formData.child_gender || null,
    child_interests: formData.childInterests || formData.child_interests || null,
    child_notes: formData.childNotes || formData.child_notes || null,
    status: formData.status || (step >= 6 ? 'in_progress' : 'draft'),
    current_step: step,
    preview_url: formData.previewUrl || formData.preview_url || null,
    child_photo_url: formData.child_photo_url || null,
    child_photo_preview_url: formData.child_photo_preview_url || null,
    child_photo_processed_url: formData.child_photo_processed_url || null,
  };
}

export function buildDraftFormData(draft, pages = []) {
  const flow = getDraftFlowMetadata(draft);
  const normalizedPages = Array.isArray(pages) && pages.length > 0 ? pages : null;
  const formData = flow.formData && typeof flow.formData === 'object'
    ? flow.formData
    : {};

  return {
    ...formData,
    projectId: String(draft?.id || formData.projectId || ''),
    ageGroup: draft?.ageGroup || draft?.age_group || formData.ageGroup || '',
    theme: draft?.theme || formData.theme || '',
    illustrationStyle:
      draft?.illustrationStyle ||
      draft?.illustration_style ||
      formData.illustrationStyle ||
      '',
    pageCount:
      draft?.pageCount ||
      draft?.page_count ||
      formData.pageCount ||
      DEFAULT_DRAFT_PAGE_COUNT,
    childName: draft?.childName || draft?.child_name || formData.childName || '',
    childGender:
      draft?.childGender || draft?.child_gender || formData.childGender || '',
    childInterests:
      draft?.childInterests ||
      draft?.child_interests ||
      formData.childInterests ||
      '',
    childNotes:
      draft?.childNotes || draft?.child_notes || formData.childNotes || '',
    storyPreview: normalizedPages || formData.storyPreview || null,
    isGenerated: Boolean(flow.isGenerated || normalizedPages),
    generationStatus:
      flow.generationStatus || (normalizedPages ? 'completed' : 'idle'),
  };
}

export function buildDraftResponse(draft, pages = []) {
  const flow = getDraftFlowMetadata(draft);
  const draftExpiresAt = getDraftExpiresAt(draft);
  const expired = new Date(draftExpiresAt).getTime() <= Date.now();
  const isGenerated = Boolean(flow.isGenerated || pages.length > 0);
  const isPaid = Boolean(flow.isPaid || draft?.isPaid || draft?.is_paid);

  return {
    ...draft,
    pages,
    current_step: clampWizardStep(draft?.current_step || draft?.currentStep || 1),
    currentStep: clampWizardStep(draft?.current_step || draft?.currentStep || 1),
    isGenerated,
    is_generated: isGenerated,
    isPaid,
    is_paid: isPaid,
    generationStatus:
      flow.generationStatus || (isGenerated ? 'completed' : 'idle'),
    draftExpiresAt,
    draft_expires_at: draftExpiresAt,
    expired,
    formData: buildDraftFormData(draft, pages),
  };
}

export function isStoryGenerationComplete(project, pages = []) {
  const flow = getDraftFlowMetadata(project);
  const pageCount = safeNumber(project?.pageCount || project?.page_count, pages.length);

  if (!Array.isArray(pages) || pages.length === 0) {
    return false;
  }

  const storyPages = pages.filter((page) => {
    const pageNumber = Number(page.pageNumber || page.page_number);
    return pageNumber > 1 && pageNumber < pageCount;
  });

  const textReady = pages.every((page) => {
    const pageNumber = Number(page.pageNumber || page.page_number);
    if (pageNumber === 1 || pageNumber === pageCount) {
      return true;
    }

    return Boolean(page.text || page.page_text || page.content);
  });

  const imagesReady =
    storyPages.length === 0 ||
    storyPages.every((page) =>
      Boolean(
        page.faceSwappedUrl ||
          page.illustrationUrl ||
          page.image_url ||
          page.image
      )
    );

  return Boolean((flow.isGenerated || pages.length > 0) && textReady && imagesReady);
}

export async function markUserDraftsInactive(userId, { exceptProjectId = '' } = {}) {
  try {
    const { projects } = await listStoryProjectsByUser(userId, {
      limit: 100,
      offset: 0,
      statuses: ACTIVE_DRAFT_STATUSES,
    });

    for (const project of projects) {
      if (exceptProjectId && String(project.id) === String(exceptProjectId)) {
        continue;
      }

      if (await deleteExpiredDraftIfNeeded(userId, project)) {
        continue;
      }

      try {
        await updateStoryProjectRecord(userId, project.id, {
          status: 'inactive',
          photo_metadata: mergeDraftFlowMetadata(project, {
            isActive: false,
            inactiveAt: new Date().toISOString(),
          }),
        });
      } catch (updateError) {
        // Log but don't fail - allow other drafts to be marked inactive
        console.warn('[DRAFTS] Failed to mark draft inactive:', {
          projectId: project.id,
          error: updateError.message,
        });
      }
    }
  } catch (listError) {
    // Log but don't fail - graceful degradation
    console.warn('[DRAFTS] Failed to list projects for marking inactive:', {
      userId,
      error: listError.message,
    });
  }
}

export async function saveDraftForUser(userId, payload = {}) {
  const step = clampWizardStep(payload.step || payload.currentStep);
  const formData = payload.formData && typeof payload.formData === 'object'
    ? payload.formData
    : payload;
  const requestedProjectId =
    payload.projectId || formData.projectId || formData.id || '';
  const pages = normalizeStoryPagesFromFormData(formData);

  if (payload.startNew) {
    await markUserDraftsInactive(userId);
  }

  let draft = requestedProjectId
    ? await getStoryProjectById(userId, requestedProjectId)
    : null;

  if (await deleteExpiredDraftIfNeeded(userId, draft)) {
    draft = null;
  }

  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + DRAFT_TTL_MS).toISOString();
  const projectPayload = buildProjectPayloadFromFormData(formData, step);
  const generationPatch = {
    isActive: true,
    draftExpiresAt: expiresAt,
    lastSavedAt: now,
    lastSavedStep: step,
    formData: {
      ...formData,
      projectId: draft?.id || requestedProjectId || formData.projectId || null,
      storyPreview: pages || formData.storyPreview || null,
    },
  };

  if (pages && pages.length > 0) {
    generationPatch.isGenerated = true;
    generationPatch.generationStatus = 'completed';
    generationPatch.generationCompletedAt = now;
  }

  const isGeneratedForColumns = Boolean(
    (pages && pages.length > 0) || draft?.isGenerated || draft?.is_generated
  );

  if (!draft) {
    draft = await createStoryProjectRecord(userId, {
      ...projectPayload,
      is_generated: isGeneratedForColumns,
      draft_expires_at: expiresAt,
      photo_metadata: {
        [DRAFT_FLOW_METADATA_KEY]: generationPatch,
      },
    });
  } else {
    draft = await updateStoryProjectRecord(userId, draft.id, {
      ...projectPayload,
      is_generated: isGeneratedForColumns,
      draft_expires_at: expiresAt,
      photo_metadata: mergeDraftFlowMetadata(draft, generationPatch),
    });
  }

  const savedPages = pages
    ? await replaceStoryProjectPages(draft.id, pages)
    : await listStoryProjectPages(draft.id);

  const updatedDraft = await getStoryProjectById(userId, draft.id);
  return buildDraftResponse(updatedDraft || draft, savedPages);
}

export async function purgeExpiredDraftsForUser(userId, { projects } = {}) {
  const sourceProjects = Array.isArray(projects)
    ? projects
    : (
        await listStoryProjectsByUser(userId, {
          limit: 100,
          offset: 0,
          statuses: ACTIVE_DRAFT_STATUSES,
        })
      ).projects;
  const activeDrafts = sourceProjects.filter((project) => {
    const flow = getDraftFlowMetadata(project);
    return flow.isActive !== false;
  });
  const validDrafts = [];
  const deletedIds = [];

  for (const project of activeDrafts) {
    if (await deleteExpiredDraftIfNeeded(userId, project)) {
      deletedIds.push(String(project.id));
      continue;
    }

    validDrafts.push(project);
  }

  return {
    drafts: validDrafts,
    deletedIds,
  };
}

export async function getLatestDraftForUser(userId) {
  const { projects } = await listStoryProjectsByUser(userId, {
    limit: 25,
    offset: 0,
    statuses: ACTIVE_DRAFT_STATUSES,
  });
  const { drafts } = await purgeExpiredDraftsForUser(userId, { projects });

  if (drafts.length === 0) {
    return null;
  }

  const latest = drafts[0];
  const pages = await listStoryProjectPages(latest.id);
  return buildDraftResponse(latest, pages);
}

export async function getSavedStoryForPreview(userId, storyId) {
  const [story, pages] = await Promise.all([
    getStoryProjectById(userId, storyId),
    listStoryProjectPages(storyId),
  ]);

  if (!story) {
    return null;
  }

  if (await deleteExpiredDraftIfNeeded(userId, story)) {
    return null;
  }

  return buildDraftResponse(story, pages);
}
