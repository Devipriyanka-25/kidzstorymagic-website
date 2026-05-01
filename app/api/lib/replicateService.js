/**
 * Replicate API Service
 * Handles face swap and other ML tasks via Replicate.
 */

import {
  getReplicateClient,
  resolveModelVersionId,
} from '@/lib/replicate/client';

const DEFAULT_REPLICATE_FACE_SWAP_MODEL = 'synthesys-ai/synthesys-roop';
const DEFAULT_POLL_INTERVAL_MS = 5000;
const DEFAULT_MAX_ATTEMPTS = 60;
const INITIAL_WAIT_SECONDS = 5;

function splitReplicateModelId(modelId) {
  const [owner, name] = String(modelId || '').split('/');

  if (!owner || !name) {
    throw new Error(
      `Invalid REPLICATE_FACE_SWAP_MODEL "${modelId}". Expected owner/name.`
    );
  }

  return { owner, name };
}

function normalizePredictionOutput(output) {
  if (Array.isArray(output)) {
    return output.find((value) => typeof value === 'string') || '';
  }

  return typeof output === 'string' ? output : '';
}

/**
 * Call Replicate API to perform face swap.
 * Uses a versioned model payload that matches Replicate's current API contract.
 */
export async function faceSwapWithReplicate(
  faceImageUrl,
  targetImageUrl,
  options = {}
) {
  const modelId =
    process.env.REPLICATE_FACE_SWAP_MODEL?.trim() ||
    DEFAULT_REPLICATE_FACE_SWAP_MODEL;
  const { owner, name } = splitReplicateModelId(modelId);
  const replicate = getReplicateClient();

  try {
    console.log('[REPLICATE] Starting face swap prediction...');
    console.log(`[REPLICATE] Face image: ${faceImageUrl.substring(0, 50)}...`);
    console.log(
      `[REPLICATE] Target image: ${targetImageUrl.substring(0, 50)}...`
    );

    const version = await resolveModelVersionId(
      owner,
      name,
      process.env.REPLICATE_FACE_SWAP_VERSION
    );

    let prediction = await replicate.predictions.create({
      version,
      wait: INITIAL_WAIT_SECONDS,
      input: {
        source_path: faceImageUrl,
        target_path: targetImageUrl,
        frame_processor:
          options.frameProcessor || ['face_swapper', 'face_enhancer'],
      },
    });

    console.log(`[REPLICATE] Prediction created: ${prediction.id}`);
    console.log(`[REPLICATE] Status: ${prediction.status}`);

    let attempts = 0;
    while (
      (prediction.status === 'processing' || prediction.status === 'starting') &&
      attempts < DEFAULT_MAX_ATTEMPTS
    ) {
      await new Promise((resolve) =>
        setTimeout(resolve, DEFAULT_POLL_INTERVAL_MS)
      );

      prediction = await replicate.predictions.get(prediction.id);
      attempts += 1;

      console.log(
        `[REPLICATE] Attempt ${attempts}/${DEFAULT_MAX_ATTEMPTS} - Status: ${prediction.status}`
      );
    }

    if (prediction.status === 'failed') {
      throw new Error(`Face swap failed: ${prediction.error || 'Unknown error'}`);
    }

    if (prediction.status !== 'succeeded') {
      throw new Error(
        `Face swap processing timed out with status: ${prediction.status || 'unknown'}`
      );
    }

    const resultUrl = normalizePredictionOutput(prediction.output);
    if (!resultUrl) {
      throw new Error('Face swap completed without an output URL.');
    }

    console.log('[REPLICATE] Face swap completed successfully');
    return {
      success: true,
      resultUrl,
      predictionId: prediction.id,
      processedAt: new Date().toISOString(),
      model: `${modelId}:${version}`,
      provider: 'replicate',
    };
  } catch (error) {
    console.error('[REPLICATE] Error:', error.message);
    throw error;
  }
}

export async function imageUrlToBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('[IMAGE_CONVERT] Error:', error.message);
    throw error;
  }
}

export async function validateImageUrl(imageUrl) {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('[IMAGE_VALIDATE] Error:', error.message);
    return false;
  }
}

export function getPricingInfo() {
  return {
    model:
      process.env.REPLICATE_FACE_SWAP_MODEL?.trim() ||
      DEFAULT_REPLICATE_FACE_SWAP_MODEL,
    costPerCall: 0.14,
    estimatedCostFor20Pages: 2.8,
    note: 'Prices are approximate and may vary based on model version and runtime.',
    source: 'https://replicate.com/synthesys-ai/synthesys-roop',
  };
}
