import { supabaseClient } from './supabaseClient.js';
import {
  findAuthUserByEmail,
  findAuthUserById,
  normalizeEmail,
} from './authUsers.js';

const STORY_PROJECT_COLUMNS = `
  id,
  user_id,
  title,
  description,
  age_group,
  theme,
  illustration_style,
  custom_illustration_prompt,
  page_count,
  child_name,
  child_gender,
  child_interests,
  child_notes,
  status,
  current_step,
  preview_url,
  published_pdf_url,
  child_photo_url,
  child_photo_preview_url,
  child_photo_processed_url,
  photo_metadata,
  created_at,
  updated_at
`;

const STORY_CONTENT_COLUMNS = `
  id,
  project_id,
  page_number,
  page_title,
  page_text,
  page_illustration_prompt,
  image_url,
  created_at,
  updated_at
`;

function requireStoryStorage() {
  if (!supabaseClient) {
    throw new Error('Story storage is not configured.');
  }

  return supabaseClient;
}

function wrapStoryProjectError(action, error) {
  const wrappedError = new Error(
    `[STORY_PROJECTS] ${action} failed: ${error?.message || 'Unknown error'}`
  );
  wrappedError.code = error?.code;
  wrappedError.details = error?.details;
  return wrappedError;
}

const OPTIONAL_GENERATION_COLUMNS = new Set([
  'is_generated',
  'is_paid',
  'draft_expires_at',
  'generation_started_at',
  'generation_completed_at',
  'completed_at',
]);

function isOptionalGenerationColumnError(error) {
  const errorText = [
    error?.message,
    error?.details,
    error?.hint,
    error?.code,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return (
    error?.code === 'PGRST204' ||
    error?.code === '42703' ||
    Array.from(OPTIONAL_GENERATION_COLUMNS).some((column) =>
      errorText.includes(column)
    )
  );
}

function stripOptionalGenerationColumns(payload = {}) {
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => !OPTIONAL_GENERATION_COLUMNS.has(key))
  );
}

export function parseStoryProjectId(value) {
  const normalized = Number(value);
  return Number.isInteger(normalized) && normalized > 0 ? normalized : null;
}

export async function resolveAuthenticatedStoryUser(decoded) {
  if (!decoded) {
    return null;
  }

  if (decoded.id !== undefined && decoded.id !== null) {
    const userById = await findAuthUserById(decoded.id);
    if (userById) {
      return userById;
    }
  }

  if (decoded.email) {
    return findAuthUserByEmail(normalizeEmail(decoded.email));
  }

  return null;
}

function normalizePreviewImageUrl(value) {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return null;
  }

  return /^(https?:\/\/|data:image\/)/i.test(normalized) ? normalized : null;
}

export function mapStoryProjectRecord(record) {
  const previewImageUrl = normalizePreviewImageUrl(record?.preview_url);
  const photoMetadata =
    record?.photo_metadata && typeof record.photo_metadata === 'object'
      ? record.photo_metadata
      : null;
  const draftFlow =
    photoMetadata?.draftFlow && typeof photoMetadata.draftFlow === 'object'
      ? photoMetadata.draftFlow
      : {};
  const status = record?.status || 'draft';
  const isPaid = Boolean(record?.is_paid || draftFlow.isPaid || status === 'published');

  return {
    id: String(record?.id ?? ''),
    user_id: record?.user_id ?? null,
    title: record?.title || `${record?.child_name || 'Child'}'s Story`,
    description: record?.description || '',
    age_group: record?.age_group || '',
    ageGroup: record?.age_group || '',
    theme: record?.theme || '',
    illustration_style: record?.illustration_style || '',
    illustrationStyle: record?.illustration_style || '',
    custom_illustration_prompt: record?.custom_illustration_prompt || '',
    page_count: record?.page_count || 0,
    pageCount: record?.page_count || 0,
    child_name: record?.child_name || '',
    childName: record?.child_name || '',
    child_gender: record?.child_gender || '',
    childGender: record?.child_gender || '',
    child_interests: record?.child_interests || '',
    childInterests: record?.child_interests || '',
    child_notes: record?.child_notes || '',
    childNotes: record?.child_notes || '',
    status,
    current_step: record?.current_step || 1,
    currentStep: record?.current_step || 1,
    preview_url: previewImageUrl,
    previewUrl: previewImageUrl,
    published_pdf_url: record?.published_pdf_url || null,
    child_photo_url: record?.child_photo_url || null,
    child_photo_preview_url: record?.child_photo_preview_url || null,
    child_photo_processed_url: record?.child_photo_processed_url || null,
    photo_metadata: photoMetadata,
    isGenerated: Boolean(record?.is_generated || draftFlow.isGenerated),
    is_generated: Boolean(record?.is_generated || draftFlow.isGenerated),
    isPaid,
    is_paid: isPaid,
    draftExpiresAt: record?.draft_expires_at || draftFlow.draftExpiresAt || null,
    draft_expires_at: record?.draft_expires_at || draftFlow.draftExpiresAt || null,
    generationStartedAt:
      record?.generation_started_at || draftFlow.generationStartedAt || null,
    generation_started_at:
      record?.generation_started_at || draftFlow.generationStartedAt || null,
    generationCompletedAt:
      record?.generation_completed_at || draftFlow.generationCompletedAt || null,
    generation_completed_at:
      record?.generation_completed_at || draftFlow.generationCompletedAt || null,
    generationStatus: draftFlow.generationStatus || 'idle',
    created_at: record?.created_at || null,
    createdAt: record?.created_at || null,
    updated_at: record?.updated_at || null,
    updatedAt: record?.updated_at || null,
  };
}

export function mergeStoryProjectDraftFlowMetadata(project, patch = {}) {
  const metadata =
    project?.photo_metadata && typeof project.photo_metadata === 'object'
      ? project.photo_metadata
      : {};
  const draftFlow =
    metadata.draftFlow && typeof metadata.draftFlow === 'object'
      ? metadata.draftFlow
      : {};

  return {
    ...metadata,
    draftFlow: {
      ...draftFlow,
      ...patch,
    },
  };
}

async function getCompletedOrderProjectIds(userId, projectIds = []) {
  const client = requireStoryStorage();
  const normalizedProjectIds = projectIds
    .map((id) => parseStoryProjectId(id))
    .filter(Boolean);

  if (normalizedProjectIds.length === 0) {
    return new Set();
  }

  const { data, error } = await client
    .from('orders')
    .select('project_id')
    .eq('user_id', Number(userId))
    .eq('status', 'completed')
    .in('project_id', normalizedProjectIds);

  if (error) {
    console.warn('[STORY_PROJECTS] Could not join completed orders:', {
      userId,
      code: error.code,
      message: error.message,
    });
    return new Set();
  }

  return new Set(
    (data || [])
      .map((order) => parseStoryProjectId(order.project_id))
      .filter(Boolean)
  );
}

function applyPaidOrderMarkers(records = [], paidProjectIds = new Set()) {
  return records.map((record) => {
    const isPaidByOrder = paidProjectIds.has(parseStoryProjectId(record?.id));
    if (!isPaidByOrder) {
      return record;
    }

    return {
      ...record,
      status: 'published',
      is_paid: true,
      photo_metadata: mergeStoryProjectDraftFlowMetadata(record, {
        isPaid: true,
        isActive: false,
      }),
    };
  });
}

export function mapStoryContentRecord(record, totalPages = 0) {
  const pageNumber = Number(record?.page_number) || 1;

  return {
    id: String(record?.id ?? pageNumber),
    pageNumber,
    page_number: pageNumber,
    pageType:
      pageNumber === 1
        ? 'cover'
        : totalPages > 0 && pageNumber === totalPages
          ? 'end'
          : 'story',
    title: record?.page_title || `Page ${pageNumber}`,
    page_title: record?.page_title || `Page ${pageNumber}`,
    text: record?.page_text || '',
    page_text: record?.page_text || '',
    content: record?.page_text || '',
    illustrationPrompt: record?.page_illustration_prompt || null,
    page_illustration_prompt: record?.page_illustration_prompt || null,
    illustrationUrl: record?.image_url || null,
    faceSwappedUrl: record?.image_url || null,
    image_url: record?.image_url || null,
    image: record?.image_url || null,
    created_at: record?.created_at || null,
    updated_at: record?.updated_at || null,
  };
}

export async function listStoryProjectsByUser(
  userId,
  { limit = 10, offset = 0, statuses } = {}
) {
  try {
    const client = requireStoryStorage();

    let query = client
      .from('story_projects')
      .select(STORY_PROJECT_COLUMNS, { count: 'exact' })
      .eq('user_id', Number(userId))
      .order('updated_at', { ascending: false });

    if (Array.isArray(statuses) && statuses.length > 0) {
      query = query.in('status', statuses);
    }

    if (Number.isFinite(limit) && Number.isFinite(offset)) {
      query = query.range(offset, offset + Math.max(limit, 1) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[STORY_PROJECTS] Query error:', {
        userId,
        code: error.code,
        message: error.message,
        details: error.details,
      });
      // Return empty list instead of throwing - graceful degradation
      return {
        projects: [],
        total: 0,
      };
    }

    console.log('[STORY_PROJECTS] Found projects for user:', {
      userId,
      count: count || 0,
    });

    const paidProjectIds = await getCompletedOrderProjectIds(
      userId,
      (data || []).map((record) => record.id)
    );

    return {
      projects: applyPaidOrderMarkers(data || [], paidProjectIds).map(
        mapStoryProjectRecord
      ),
      total: count || 0,
    };
  } catch (err) {
    console.error('[STORY_PROJECTS] Exception in listStoryProjectsByUser:', {
      userId,
      error: err.message,
      stack: err.stack,
    });
    // Return empty list on exception - graceful degradation
    return {
      projects: [],
      total: 0,
    };
  }
}

export async function getStoryProjectStats(userId) {
  try {
    const client = requireStoryStorage();

    const [totalResult, publishedResult, draftResult] = await Promise.all([
      client
        .from('story_projects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', Number(userId)),
      client
        .from('story_projects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', Number(userId))
        .eq('status', 'published'),
      client
        .from('story_projects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', Number(userId))
        .in('status', ['draft', 'in_progress', 'pending']),
    ]);

    const errors = [
      totalResult.error,
      publishedResult.error,
      draftResult.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      console.error('[STORY_PROJECTS] Stats query error:', {
        userId,
        errors: errors.map(e => ({ code: e.code, message: e.message })),
      });
      // Return default stats instead of throwing - graceful degradation
      return {
        totalProjects: 0,
        completedProjects: 0,
        draftProjects: 0,
      };
    }

    return {
      totalProjects: totalResult.count || 0,
      completedProjects: publishedResult.count || 0,
      draftProjects: draftResult.count || 0,
    };
  } catch (err) {
    console.error('[STORY_PROJECTS] Exception in getStoryProjectStats:', {
      userId,
      error: err.message,
      stack: err.stack,
    });
    // Return default stats on exception - graceful degradation
    return {
      totalProjects: 0,
      completedProjects: 0,
      draftProjects: 0,
    };
  }
}

export async function getStoryProjectById(userId, projectId) {
  const client = requireStoryStorage();
  const normalizedProjectId = parseStoryProjectId(projectId);

  if (!normalizedProjectId) {
    return null;
  }

  const { data, error } = await client
    .from('story_projects')
    .select(STORY_PROJECT_COLUMNS)
    .eq('id', normalizedProjectId)
    .eq('user_id', Number(userId))
    .maybeSingle();

  if (error) {
    throw wrapStoryProjectError('get project by id', error);
  }

  if (!data) {
    return null;
  }

  const paidProjectIds = await getCompletedOrderProjectIds(userId, [data.id]);
  const [markedRecord] = applyPaidOrderMarkers([data], paidProjectIds);

  return mapStoryProjectRecord(markedRecord);
}

export async function markStoryProjectPaid(
  userId,
  projectId,
  { completedAt = new Date().toISOString(), publishedPdfUrl = undefined } = {}
) {
  const project = await getStoryProjectById(userId, projectId);

  if (!project) {
    return null;
  }

  return updateStoryProjectRecord(userId, projectId, {
    status: 'published',
    current_step: Math.max(Number(project.current_step || project.currentStep || 6), 6),
    is_paid: true,
    completed_at: completedAt,
    ...(publishedPdfUrl !== undefined
      ? { published_pdf_url: publishedPdfUrl }
      : {}),
    photo_metadata: mergeStoryProjectDraftFlowMetadata(project, {
      isPaid: true,
      paidAt: completedAt,
      isActive: false,
      lastSavedStep: 6,
    }),
  });
}

export async function createStoryProjectRecord(userId, payload) {
  const client = requireStoryStorage();

  const insertData = {
    user_id: Number(userId),
    title: payload.title || `${payload.child_name || payload.childName || 'Child'}'s Story`,
    description: payload.description || null,
    age_group: payload.age_group || payload.ageGroup || '5-8',
    theme: payload.theme || 'adventure',
    illustration_style:
      payload.illustration_style || payload.illustrationStyle || null,
    custom_illustration_prompt:
      payload.custom_illustration_prompt ||
      payload.customIllustrationPrompt ||
      null,
    page_count: Number(payload.page_count || payload.pageCount || 10),
    child_name: payload.child_name || payload.childName || 'Child',
    child_gender: payload.child_gender || payload.childGender || null,
    child_interests: payload.child_interests || payload.childInterests || null,
    child_notes: payload.child_notes || payload.childNotes || null,
    status: payload.status || 'draft',
    current_step: Number(payload.current_step || payload.currentStep || 1),
    preview_url: payload.preview_url || payload.previewUrl || null,
    published_pdf_url:
      payload.published_pdf_url || payload.publishedPdfUrl || null,
    child_photo_url: payload.child_photo_url || null,
    child_photo_preview_url: payload.child_photo_preview_url || null,
    child_photo_processed_url: payload.child_photo_processed_url || null,
    is_generated: Boolean(payload.is_generated || payload.isGenerated),
    is_paid: Boolean(payload.is_paid || payload.isPaid),
    draft_expires_at: payload.draft_expires_at || payload.draftExpiresAt || null,
    photo_metadata: payload.photo_metadata || null,
  };

  // Add generation columns only if values are provided (for compatibility with older schema)
  if (payload.generation_started_at || payload.generationStartedAt) {
    insertData.generation_started_at =
      payload.generation_started_at || payload.generationStartedAt;
  }
  if (payload.generation_completed_at || payload.generationCompletedAt) {
    insertData.generation_completed_at =
      payload.generation_completed_at || payload.generationCompletedAt;
  }

  const insertProject = (nextInsertData) =>
    client
      .from('story_projects')
      .insert(nextInsertData)
      .select(STORY_PROJECT_COLUMNS)
      .single();

  let { data, error } = await insertProject(insertData);

  if (error && isOptionalGenerationColumnError(error)) {
    console.warn(
      '[STORY_PROJECTS] Optional draft columns are unavailable; retrying create with metadata-only draft state.'
    );
    ({ data, error } = await insertProject(stripOptionalGenerationColumns(insertData)));
  }

  if (error) {
    throw wrapStoryProjectError('create project', error);
  }

  return mapStoryProjectRecord(data);
}

export async function updateStoryProjectRecord(userId, projectId, payload) {
  const client = requireStoryStorage();
  const normalizedProjectId = parseStoryProjectId(projectId);

  if (!normalizedProjectId) {
    return null;
  }

  const updateData = {
    updated_at: new Date().toISOString(),
  };

  if (payload.title !== undefined) updateData.title = payload.title;
  if (payload.description !== undefined) updateData.description = payload.description;
  if (payload.age_group !== undefined || payload.ageGroup !== undefined) {
    updateData.age_group = payload.age_group ?? payload.ageGroup;
  }
  if (payload.theme !== undefined) updateData.theme = payload.theme;
  if (
    payload.illustration_style !== undefined ||
    payload.illustrationStyle !== undefined
  ) {
    updateData.illustration_style =
      payload.illustration_style ?? payload.illustrationStyle;
  }
  if (
    payload.custom_illustration_prompt !== undefined ||
    payload.customIllustrationPrompt !== undefined
  ) {
    updateData.custom_illustration_prompt =
      payload.custom_illustration_prompt ?? payload.customIllustrationPrompt;
  }
  if (payload.page_count !== undefined || payload.pageCount !== undefined) {
    updateData.page_count = Number(payload.page_count ?? payload.pageCount);
  }
  if (payload.child_name !== undefined || payload.childName !== undefined) {
    updateData.child_name = payload.child_name ?? payload.childName;
  }
  if (payload.child_gender !== undefined || payload.childGender !== undefined) {
    updateData.child_gender = payload.child_gender ?? payload.childGender;
  }
  if (
    payload.child_interests !== undefined ||
    payload.childInterests !== undefined
  ) {
    updateData.child_interests =
      payload.child_interests ?? payload.childInterests;
  }
  if (payload.child_notes !== undefined || payload.childNotes !== undefined) {
    updateData.child_notes = payload.child_notes ?? payload.childNotes;
  }
  if (payload.status !== undefined) updateData.status = payload.status;
  if (payload.current_step !== undefined || payload.currentStep !== undefined) {
    updateData.current_step = Number(payload.current_step ?? payload.currentStep);
  }
  if (payload.preview_url !== undefined || payload.previewUrl !== undefined) {
    updateData.preview_url = payload.preview_url ?? payload.previewUrl;
  }
  if (
    payload.published_pdf_url !== undefined ||
    payload.publishedPdfUrl !== undefined
  ) {
    updateData.published_pdf_url =
      payload.published_pdf_url ?? payload.publishedPdfUrl;
  }
  if (payload.child_photo_url !== undefined) {
    updateData.child_photo_url = payload.child_photo_url;
  }
  if (payload.child_photo_preview_url !== undefined) {
    updateData.child_photo_preview_url = payload.child_photo_preview_url;
  }
  if (payload.child_photo_processed_url !== undefined) {
    updateData.child_photo_processed_url = payload.child_photo_processed_url;
  }
  if (payload.is_generated !== undefined || payload.isGenerated !== undefined) {
    updateData.is_generated = Boolean(payload.is_generated ?? payload.isGenerated);
  }
  if (payload.is_paid !== undefined || payload.isPaid !== undefined) {
    updateData.is_paid = Boolean(payload.is_paid ?? payload.isPaid);
  }
  if (payload.draft_expires_at !== undefined || payload.draftExpiresAt !== undefined) {
    updateData.draft_expires_at = payload.draft_expires_at ?? payload.draftExpiresAt;
  }
  // Note: generation_started_at and generation_completed_at columns may not exist in all databases
  // Only update if the schema supports them
  // if (payload.generation_started_at !== undefined || payload.generationStartedAt !== undefined) {
  //   updateData.generation_started_at = payload.generation_started_at ?? payload.generationStartedAt;
  // }
  // if (payload.generation_completed_at !== undefined || payload.generationCompletedAt !== undefined) {
  //   updateData.generation_completed_at = payload.generation_completed_at ?? payload.generationCompletedAt;
  // }
  if (payload.photo_metadata !== undefined) {
    updateData.photo_metadata = payload.photo_metadata;
  }
  if (payload.completed_at !== undefined) {
    updateData.completed_at = payload.completed_at;
  }

  const updateProject = (nextUpdateData) =>
    client
      .from('story_projects')
      .update(nextUpdateData)
      .eq('id', normalizedProjectId)
      .eq('user_id', Number(userId))
      .select(STORY_PROJECT_COLUMNS)
      .maybeSingle();

  let { data, error } = await updateProject(updateData);

  if (error && isOptionalGenerationColumnError(error)) {
    console.warn(
      '[STORY_PROJECTS] Optional draft columns are unavailable; retrying update with metadata-only draft state.'
    );
    ({ data, error } = await updateProject(stripOptionalGenerationColumns(updateData)));
  }

  if (error) {
    throw wrapStoryProjectError('update project', error);
  }

  return data ? mapStoryProjectRecord(data) : null;
}

export async function deleteStoryProjectRecord(userId, projectId) {
  const client = requireStoryStorage();
  const normalizedProjectId = parseStoryProjectId(projectId);

  if (!normalizedProjectId) {
    return null;
  }

  const { data, error } = await client
    .from('story_projects')
    .delete()
    .eq('id', normalizedProjectId)
    .eq('user_id', Number(userId))
    .select(STORY_PROJECT_COLUMNS)
    .maybeSingle();

  if (error) {
    throw wrapStoryProjectError('delete project', error);
  }

  return data ? mapStoryProjectRecord(data) : null;
}

export async function replaceStoryProjectPages(projectId, pages) {
  const client = requireStoryStorage();
  const normalizedProjectId = parseStoryProjectId(projectId);

  if (!normalizedProjectId) {
    throw new Error('A valid projectId is required before saving story pages.');
  }

  const { error: deleteError } = await client
    .from('story_content')
    .delete()
    .eq('project_id', normalizedProjectId);

  if (deleteError) {
    throw wrapStoryProjectError('clear existing story pages', deleteError);
  }

  if (!Array.isArray(pages) || pages.length === 0) {
    return [];
  }

  const pageRows = pages.map((page, index) => ({
    project_id: normalizedProjectId,
    page_number: Number(page.pageNumber || page.page_number || index + 1),
    page_title: page.title || page.page_title || `Page ${index + 1}`,
    page_text: page.text || page.content || page.page_text || '',
    page_illustration_prompt:
      page.illustrationPrompt ||
      page.page_illustration_prompt ||
      page.illustration_prompt ||
      null,
    image_url:
      page.faceSwappedUrl ||
      page.illustrationUrl ||
      page.image_url ||
      page.image ||
      null,
  }));

  const { data, error } = await client
    .from('story_content')
    .insert(pageRows)
    .select(STORY_CONTENT_COLUMNS);

  if (error) {
    throw wrapStoryProjectError('save story pages', error);
  }

  const totalPages = pageRows.length;
  return (data || [])
    .sort((left, right) => left.page_number - right.page_number)
    .map((page) => mapStoryContentRecord(page, totalPages));
}

export async function listStoryProjectPages(projectId) {
  const client = requireStoryStorage();
  const normalizedProjectId = parseStoryProjectId(projectId);

  if (!normalizedProjectId) {
    return [];
  }

  const { data, error } = await client
    .from('story_content')
    .select(STORY_CONTENT_COLUMNS)
    .eq('project_id', normalizedProjectId)
    .order('page_number', { ascending: true });

  if (error) {
    throw wrapStoryProjectError('list story pages', error);
  }

  const totalPages = data?.length || 0;
  return (data || []).map((page) => mapStoryContentRecord(page, totalPages));
}
