const DATA_IMAGE_PREFIX = /^data:image\//i;
const MAX_REFERENCE_DIMENSION = 512;
const MAX_REFERENCE_BYTES = 140 * 1024;
const INITIAL_JPEG_QUALITY = 0.72;
const MIN_JPEG_QUALITY = 0.32;
const MIN_SCALE = 0.28;

const subjectImagePreparationCache = new Map();

function estimateDataUrlBytes(dataUrl) {
  const payload = String(dataUrl || '').split(',')[1] || '';
  return Math.floor((payload.length * 3) / 4);
}

function isDataImageUrl(value) {
  return DATA_IMAGE_PREFIX.test(String(value || '').trim());
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load the reference image.'));
    image.src = source;
  });
}

function renderImageToDataUrl(image, scale, quality) {
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas is not available for reference image preparation.');
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', quality);
}

export async function prepareSubjectImageForGeneration(subjectImage) {
  const normalized = String(subjectImage || '').trim();

  if (!normalized || typeof window === 'undefined' || !isDataImageUrl(normalized)) {
    return normalized;
  }

  const cachedPreparation = subjectImagePreparationCache.get(normalized);
  if (cachedPreparation) {
    return cachedPreparation;
  }

  const preparationPromise = (async () => {
    const image = await loadImage(normalized);
    const largestSide = Math.max(image.width || 1, image.height || 1);
    let scale = Math.min(1, MAX_REFERENCE_DIMENSION / largestSide);
    let quality = INITIAL_JPEG_QUALITY;
    let candidate = renderImageToDataUrl(image, scale, quality);

    for (let attempt = 0; attempt < 12; attempt += 1) {
      if (estimateDataUrlBytes(candidate) <= MAX_REFERENCE_BYTES) {
        return candidate;
      }

      if (quality > MIN_JPEG_QUALITY + 0.01) {
        quality = Math.max(MIN_JPEG_QUALITY, quality - 0.08);
      } else if (scale > MIN_SCALE + 0.01) {
        scale = Math.max(MIN_SCALE, scale * 0.85);
      }

      candidate = renderImageToDataUrl(image, scale, quality);
    }

    return candidate;
  })().catch(() => normalized);

  subjectImagePreparationCache.set(normalized, preparationPromise);
  return preparationPromise;
}

export async function prepareReferenceImagesForGeneration(referenceImages) {
  const normalizedImages = Array.isArray(referenceImages)
    ? referenceImages
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    : [];

  if (normalizedImages.length === 0) {
    return [];
  }

  const preparedImages = await Promise.all(
    normalizedImages.slice(0, 4).map((image) => prepareSubjectImageForGeneration(image))
  );

  return Array.from(new Set(preparedImages.filter(Boolean)));
}

export async function readIllustrationApiPayload(response) {
  try {
    const rawText = await response.text();

    if (!rawText) {
      return {};
    }

    try {
      return JSON.parse(rawText);
    } catch (error) {
      return { rawText };
    }
  } catch (error) {
    return {};
  }
}

export function getIllustrationApiErrorMessage(response, payload) {
  if (response.status === 413) {
    return 'The selected child photo is too large for illustration generation. Please use the clearest main photo; the app now shrinks it automatically before sending, but this particular image is still too heavy.';
  }

  return (
    payload?.details ||
    payload?.error ||
    payload?.rawText ||
    'Illustration generation failed for this page.'
  );
}
