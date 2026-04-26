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
  updated_at,
  completed_at
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
    status: record?.status || 'draft',
    current_step: record?.current_step || 1,
    currentStep: record?.current_step || 1,
    preview_url: previewImageUrl,
    previewUrl: previewImageUrl,
    published_pdf_url: record?.published_pdf_url || null,
    child_photo_url: record?.child_photo_url || null,
    child_photo_preview_url: record?.child_photo_preview_url || null,
    child_photo_processed_url: record?.child_photo_processed_url || null,
    photo_metadata: record?.photo_metadata || null,
    created_at: record?.created_at || null,
    createdAt: record?.created_at || null,
    updated_at: record?.updated_at || null,
    updatedAt: record?.updated_at || null,
    completed_at: record?.completed_at || null,
    completedAt: record?.completed_at || null,
  };
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
    throw wrapStoryProjectError('list user projects', error);
  }

  return {
    projects: (data || []).map(mapStoryProjectRecord),
    total: count || 0,
  };
}

export async function getStoryProjectStats(userId) {
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
    throw wrapStoryProjectError('fetch project stats', errors[0]);
  }

  return {
    totalProjects: totalResult.count || 0,
    completedProjects: publishedResult.count || 0,
    draftProjects: draftResult.count || 0,
  };
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

  return data ? mapStoryProjectRecord(data) : null;
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
    photo_metadata: payload.photo_metadata || null,
  };

  const { data, error } = await client
    .from('story_projects')
    .insert(insertData)
    .select(STORY_PROJECT_COLUMNS)
    .single();

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
  if (payload.photo_metadata !== undefined) {
    updateData.photo_metadata = payload.photo_metadata;
  }
  if (payload.completed_at !== undefined) {
    updateData.completed_at = payload.completed_at;
  }

  const { data, error } = await client
    .from('story_projects')
    .update(updateData)
    .eq('id', normalizedProjectId)
    .eq('user_id', Number(userId))
    .select(STORY_PROJECT_COLUMNS)
    .maybeSingle();

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
    image_url: page.illustrationUrl || page.image_url || page.image || null,
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

