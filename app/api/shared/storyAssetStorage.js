import { createHash, randomUUID } from 'node:crypto';

import supabaseClient from './supabaseClient.js';
import { isTemporaryPreviewIllustrationUrl } from '@/utils/storyPreviewSync';

const BUCKET_NAME = 'story-assets';
const STORY_ILLUSTRATION_PREFIX = 'story-illustrations';
const DEFAULT_SUPABASE_URL = 'https://wwninqezevmxlvtjhruo.supabase.co';

let bucketReadyPromise = null;

function getSupabaseUrl() {
  return (
    String(process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim() ||
    DEFAULT_SUPABASE_URL
  );
}

function getBucketPublicPrefix() {
  return `${getSupabaseUrl()}/storage/v1/object/public/${BUCKET_NAME}/`;
}

function normalizeUrl(value) {
  return String(value || '').trim();
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(normalizeUrl(value));
}

function isDataImageUrl(value) {
  return /^data:image\//i.test(normalizeUrl(value));
}

export function isDurableStoryAssetUrl(value) {
  const normalized = normalizeUrl(value);
  return normalized.startsWith(getBucketPublicPrefix());
}

function getExtensionFromContentType(contentType = '', fallbackUrl = '') {
  const normalizedType = String(contentType || '').toLowerCase();

  if (normalizedType.includes('png')) return 'png';
  if (normalizedType.includes('jpeg') || normalizedType.includes('jpg')) return 'jpg';
  if (normalizedType.includes('webp')) return 'webp';
  if (normalizedType.includes('gif')) return 'gif';
  if (normalizedType.includes('svg')) return 'svg';

  const sanitizedUrl = normalizeUrl(fallbackUrl).split('?')[0];
  const extensionMatch = sanitizedUrl.match(/\.([a-z0-9]+)$/i);
  return extensionMatch?.[1]?.toLowerCase() || 'png';
}

function buildStableAssetHash(sourceValue) {
  return createHash('sha1')
    .update(String(sourceValue || ''))
    .digest('hex')
    .slice(0, 16);
}

export function buildStoryIllustrationStoragePath({
  projectId,
  pageNumber,
  sourceValue,
  extension = 'png',
}) {
  const safeProjectId = String(projectId || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '');
  const safePageNumber = Number(pageNumber) || 0;
  const safeExtension = String(extension || 'png').replace(/[^a-z0-9]/gi, '') || 'png';
  const stableHash = buildStableAssetHash(sourceValue || randomUUID());

  return `${STORY_ILLUSTRATION_PREFIX}/${safeProjectId}/page-${safePageNumber}-${stableHash}.${safeExtension}`;
}

async function ensureBucketExists() {
  if (!supabaseClient) {
    return false;
  }

  if (!bucketReadyPromise) {
    bucketReadyPromise = (async () => {
      try {
        const { data, error } = await supabaseClient.storage.getBucket(BUCKET_NAME);

        if (data && !error) {
          return true;
        }

        const { error: createError } = await supabaseClient.storage.createBucket(
          BUCKET_NAME,
          {
            public: true,
            fileSizeLimit: 52428800,
          }
        );

        if (createError && !/already exists/i.test(createError.message || '')) {
          console.warn(
            '[STORY_ASSET_STORAGE] Could not create story asset bucket:',
            createError.message
          );
          return false;
        }

        return true;
      } catch (error) {
        console.warn(
          '[STORY_ASSET_STORAGE] Bucket access failed:',
          error instanceof Error ? error.message : String(error)
        );
        return false;
      }
    })();
  }

  return bucketReadyPromise;
}

async function readRemoteAsset(sourceUrl) {
  const response = await fetch(sourceUrl, {
    method: 'GET',
    redirect: 'follow',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Remote asset fetch failed with status ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return {
    buffer,
    contentType: response.headers.get('content-type') || 'image/png',
  };
}

function readDataImageAsset(sourceUrl) {
  const [metadata, payload = ''] = sourceUrl.split(',');

  if (!payload) {
    throw new Error('Invalid image data URL.');
  }

  const contentTypeMatch = metadata.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64$/i);
  const contentType = contentTypeMatch?.[1] || 'image/png';

  return {
    buffer: Buffer.from(payload, 'base64'),
    contentType,
  };
}

async function uploadBufferToStoryAssets({
  projectId,
  pageNumber,
  sourceValue,
  buffer,
  contentType,
}) {
  const bucketReady = await ensureBucketExists();

  if (!bucketReady) {
    throw new Error('Story asset bucket is not available.');
  }

  const extension = getExtensionFromContentType(contentType, sourceValue);
  const storagePath = buildStoryIllustrationStoragePath({
    projectId,
    pageNumber,
    sourceValue,
    extension,
  });

  const { error: uploadError } = await supabaseClient.storage
    .from(BUCKET_NAME)
    .upload(storagePath, buffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(uploadError.message || 'Story asset upload failed.');
  }

  const {
    data: { publicUrl },
  } = supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(storagePath);

  return publicUrl;
}

export async function persistStoryIllustrationAsset({
  projectId,
  pageNumber,
  sourceUrl,
}) {
  const normalizedSourceUrl = normalizeUrl(sourceUrl);

  if (!normalizedSourceUrl || isDurableStoryAssetUrl(normalizedSourceUrl)) {
    return normalizedSourceUrl || null;
  }

  if (isTemporaryPreviewIllustrationUrl(normalizedSourceUrl)) {
    return normalizedSourceUrl;
  }

  if (!supabaseClient) {
    return normalizedSourceUrl;
  }

  try {
    const asset = isDataImageUrl(normalizedSourceUrl)
      ? readDataImageAsset(normalizedSourceUrl)
      : isHttpUrl(normalizedSourceUrl)
        ? await readRemoteAsset(normalizedSourceUrl)
        : null;

    if (!asset?.buffer?.length) {
      return normalizedSourceUrl;
    }

    return await uploadBufferToStoryAssets({
      projectId,
      pageNumber,
      sourceValue: normalizedSourceUrl,
      buffer: asset.buffer,
      contentType: asset.contentType,
    });
  } catch (error) {
    console.warn('[STORY_ASSET_STORAGE] Could not persist illustration asset:', {
      projectId,
      pageNumber,
      sourceUrl: normalizedSourceUrl.slice(0, 120),
      message: error instanceof Error ? error.message : String(error),
    });
    return normalizedSourceUrl;
  }
}

export async function persistStoryPreviewAssets(projectId, pages = []) {
  const normalizedPages = Array.isArray(pages) ? pages : [];
  const persistedPages = [];

  for (let index = 0; index < normalizedPages.length; index += 1) {
    const page = normalizedPages[index] || {};
    const pageNumber = Number(page.pageNumber || page.page_number || index + 1) || index + 1;
    const illustrationCandidates = [
      page.faceSwappedUrl,
      page.illustrationUrl,
      page.image_url,
      page.image,
    ]
      .map((value) => normalizeUrl(value))
      .filter(Boolean);
    const preferredIllustrationUrl =
      illustrationCandidates.find(
        (value) => !isTemporaryPreviewIllustrationUrl(value)
      ) ||
      illustrationCandidates[0] ||
      null;

    if (
      preferredIllustrationUrl &&
      isTemporaryPreviewIllustrationUrl(preferredIllustrationUrl)
    ) {
      persistedPages.push(page);
      continue;
    }

    const durableIllustrationUrl = await persistStoryIllustrationAsset({
      projectId,
      pageNumber,
      sourceUrl: preferredIllustrationUrl,
    });

    if (!durableIllustrationUrl) {
      persistedPages.push(page);
      continue;
    }

    persistedPages.push({
      ...page,
      illustrationUrl: durableIllustrationUrl,
      faceSwappedUrl: durableIllustrationUrl,
      image_url: durableIllustrationUrl,
      image: durableIllustrationUrl,
    });
  }

  return persistedPages;
}

export async function deleteStoryPreviewAssets(projectId) {
  const normalizedProjectId = String(projectId || '').trim();

  if (!normalizedProjectId || !supabaseClient) {
    return { deletedCount: 0 };
  }

  const bucketReady = await ensureBucketExists();
  if (!bucketReady) {
    return { deletedCount: 0 };
  }

  const prefix = `${STORY_ILLUSTRATION_PREFIX}/${normalizedProjectId}`;
  let offset = 0;
  const pathsToDelete = [];

  while (true) {
    const { data, error } = await supabaseClient.storage
      .from(BUCKET_NAME)
      .list(prefix, {
        limit: 100,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      console.warn('[STORY_ASSET_STORAGE] Could not list project assets:', {
        projectId: normalizedProjectId,
        message: error.message,
      });
      return { deletedCount: 0 };
    }

    const entries = Array.isArray(data) ? data : [];
    if (entries.length === 0) {
      break;
    }

    pathsToDelete.push(
      ...entries
        .filter((entry) => entry?.name)
        .map((entry) => `${prefix}/${entry.name}`)
    );

    if (entries.length < 100) {
      break;
    }

    offset += entries.length;
  }

  if (pathsToDelete.length === 0) {
    return { deletedCount: 0 };
  }

  const { error: removeError } = await supabaseClient.storage
    .from(BUCKET_NAME)
    .remove(pathsToDelete);

  if (removeError) {
    console.warn('[STORY_ASSET_STORAGE] Could not delete project assets:', {
      projectId: normalizedProjectId,
      message: removeError.message,
    });
    return { deletedCount: 0 };
  }

  return { deletedCount: pathsToDelete.length };
}
