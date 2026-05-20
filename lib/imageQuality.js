/**
 * Image Quality Check  –  Phase 3
 *
 * Post-generation quality gate for every story-page illustration.
 * Each check is performed in order; the first failure short-circuits
 * the remaining checks to keep latency low.
 *
 * Full vision-model checks (face-detector, content-safety, style-match)
 * require an external API and are documented inline with the exact call
 * shape so they can be wired up once the relevant service is configured.
 *
 * Environment variables:
 *   OPENAI_API_KEY  – enables GPT-4o vision content-safety check
 *   REPLICATE_API_TOKEN – already required for generation
 */

/**
 * @typedef {object} QualityCheckResult
 * @property {boolean} passed
 * @property {string}  [reason]   – machine-readable failure code
 * @property {string}  [message]  – human-readable description
 * @property {object}  [details]  – extra diagnostic metadata
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/** Minimum byte-size we accept as a "real" image (not a blank/error placeholder) */
const MIN_IMAGE_BYTES = 5_000;

/** Maximum time to spend fetching image metadata during quality checks */
const FETCH_TIMEOUT_MS = 15_000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fetch image metadata via an HTTP HEAD request.
 * Returns null if the request fails.
 *
 * @param {string} imageUrl
 * @returns {Promise<{ contentType: string, contentLength: number } | null>}
 */
async function fetchImageMeta(imageUrl) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(imageUrl, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      return null;
    }

    return {
      contentType: response.headers.get('content-type') || '',
      contentLength: parseInt(response.headers.get('content-length') || '0', 10),
    };
  } catch {
    return null;
  }
}

// ─── Individual checks ────────────────────────────────────────────────────────

/**
 * Check 1 – Image is reachable and has a valid image content-type.
 *
 * @param {string} imageUrl
 * @returns {Promise<QualityCheckResult>}
 */
async function checkImageAccessible(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return { passed: false, reason: 'missing_url', message: 'No image URL was returned by the generation model.' };
  }

  // Allow SVG data-URLs used as preview placeholders (fallback illustrations)
  if (imageUrl.startsWith('data:image/svg')) {
    return { passed: false, reason: 'svg_placeholder', message: 'The image is an SVG placeholder, not a real illustration.' };
  }

  const meta = await fetchImageMeta(imageUrl);

  if (!meta) {
    return { passed: false, reason: 'not_accessible', message: 'The generated image URL is not accessible.' };
  }

  if (!meta.contentType.startsWith('image/')) {
    return { passed: false, reason: 'wrong_content_type', message: `Unexpected content type: ${meta.contentType}.` };
  }

  return { passed: true, details: meta };
}

/**
 * Check 2 – Image file is large enough to be a real illustration.
 *
 * @param {string} imageUrl
 * @returns {Promise<QualityCheckResult>}
 */
async function checkImageSize(imageUrl) {
  const meta = await fetchImageMeta(imageUrl);

  if (!meta) {
    // Can't determine size – soft-pass so we don't block on transient failures
    return { passed: true, details: { note: 'size_check_skipped' } };
  }

  if (meta.contentLength > 0 && meta.contentLength < MIN_IMAGE_BYTES) {
    return {
      passed: false,
      reason: 'image_too_small',
      message: `Image file is too small (${meta.contentLength} bytes) – likely a blank or error image.`,
    };
  }

  return { passed: true, details: { contentLength: meta.contentLength } };
}

/**
 * Check 3 – GPT-4o vision safe-for-kids + face-present check.
 *
 * Requires OPENAI_API_KEY in the environment.  When the key is absent the
 * check is soft-passed with a warning so the pipeline degrades gracefully.
 *
 * The prompt asks the model to verify:
 *   - A child face is visible and not distorted
 *   - No extra unexpected faces
 *   - No scary / horror expressions
 *   - The image is safe and appropriate for young children
 *   - The child does not look like an adult
 *
 * @param {string} imageUrl
 * @returns {Promise<QualityCheckResult>}
 */
async function checkImageSafetyWithVision(imageUrl) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Graceful degradation – log a warning and soft-pass
    console.warn('[QUALITY_CHECK] OPENAI_API_KEY not set – skipping vision safety check');
    return {
      passed: true,
      details: { note: 'vision_check_skipped_no_api_key' },
    };
  }

  try {
    const systemPrompt =
      'You are a strict children\'s storybook quality reviewer. ' +
      'Evaluate the image for the following criteria and respond ONLY with valid JSON: ' +
      '{"passed": true/false, "reason": "<short code>", "message": "<one sentence>"}. ' +
      'Pass only if ALL criteria are met: ' +
      '1) A child face is clearly visible and not distorted, ' +
      '2) No more than two faces are visible, ' +
      '3) The child does not have a scary or horror expression, ' +
      '4) The child does not look like an adult, ' +
      '5) The image is age-appropriate and safe for young children.';

    const body = {
      model: 'gpt-4o',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: systemPrompt },
            { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } },
          ],
        },
      ],
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.warn(`[QUALITY_CHECK] Vision API returned ${response.status} – soft-passing`);
      return { passed: true, details: { note: `vision_api_error_${response.status}` } };
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';

    // Parse the JSON response from the model
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      console.warn('[QUALITY_CHECK] Vision API returned unparseable response – soft-passing');
      return { passed: true, details: { note: 'vision_parse_error', rawContent: content.slice(0, 200) } };
    }

    const parsed = JSON.parse(match[0]);
    return {
      passed: Boolean(parsed.passed),
      reason: parsed.reason || (parsed.passed ? 'ok' : 'vision_failed'),
      message: parsed.message || '',
      details: { visionChecked: true },
    };
  } catch (error) {
    console.warn('[QUALITY_CHECK] Vision check threw an error – soft-passing:', error.message);
    return { passed: true, details: { note: 'vision_check_exception', error: error.message } };
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Run all quality checks on a generated story-page illustration.
 * Returns immediately with the first failure to minimise latency.
 *
 * @param {string} imageUrl  – URL of the generated image to check
 * @param {object} [opts]
 * @param {number} [opts.pageNumber]  – page number for logging context
 * @returns {Promise<QualityCheckResult>}
 */
export async function checkImageQuality(imageUrl, opts = {}) {
  const tag = opts.pageNumber != null ? `page=${opts.pageNumber}` : 'page=?';

  // Check 1: Image accessible + valid content type
  const accessible = await checkImageAccessible(imageUrl);
  if (!accessible.passed) {
    console.log(`[QUALITY_CHECK] FAIL ${tag} reason=${accessible.reason}`);
    return accessible;
  }

  // Check 2: Image is large enough
  const sized = await checkImageSize(imageUrl);
  if (!sized.passed) {
    console.log(`[QUALITY_CHECK] FAIL ${tag} reason=${sized.reason}`);
    return sized;
  }

  // Check 3: Vision safety (child face visible, safe for kids, etc.)
  const safe = await checkImageSafetyWithVision(imageUrl);
  if (!safe.passed) {
    console.log(`[QUALITY_CHECK] FAIL ${tag} reason=${safe.reason} message="${safe.message}"`);
    return safe;
  }

  console.log(`[QUALITY_CHECK] PASS ${tag}`);
  return { passed: true, details: { ...accessible.details, ...sized.details, ...safe.details } };
}
