/**
 * Identity Image Service  –  Phase 2 scaffold
 *
 * Provides identity-consistent child character generation using Replicate
 * identity models.  Each function is fully stubbed with TODO markers so
 * Phase 2 can implement them without touching the pipeline.
 *
 * Supported providers (in preference order):
 *   1. PhotoMaker  – tencentarc/photomaker
 *   2. InstantID   – zsxkib/instant-id
 *   3. IP-Adapter FaceID – style matching via face embedding
 *   4. Flux LoRA / fine-tune (advanced) – uses lib/replicate/training.ts
 *
 * Environment variables read by this module (never exposed to the browser):
 *   REPLICATE_API_TOKEN          – required for all Replicate calls
 *   REPLICATE_PHOTOMAKER_VERSION – optional version override for PhotoMaker
 *   REPLICATE_INSTANTID_VERSION  – optional version override for InstantID
 *   REPLICATE_IPADAPTER_VERSION  – optional version override for IP-Adapter FaceID
 *   REPLICATE_IDENTITY_MODEL     – override the primary model
 *                                  (photomaker | instantid | ipadapter | flux_lora)
 */

import { getReplicateClient, resolveModelVersionId } from '@/lib/replicate/client';

// ─── Model identifiers ────────────────────────────────────────────────────────

const PHOTOMAKER_MODEL_OWNER = 'tencentarc';
const PHOTOMAKER_MODEL_NAME = 'photomaker';

const INSTANTID_MODEL_OWNER = 'zsxkib';
const INSTANTID_MODEL_NAME = 'instant-id';

const IPADAPTER_MODEL_OWNER = 'lucataco';
const IPADAPTER_MODEL_NAME = 'ip-adapter-faceid-portrait';

// Default poll settings shared across models.
// With a 5-second interval and 60 max attempts this allows up to 5 minutes
// of polling per prediction – matching the typical Replicate generation time
// for identity models (1–4 minutes).  Adjust via callers if needed.
const DEFAULT_POLL_INTERVAL_MS = 5_000;
const DEFAULT_MAX_POLL_ATTEMPTS = 60;

// ─── Shared Replicate poll helper ─────────────────────────────────────────────

async function pollPredictionToCompletion(replicate, predictionId) {
  let prediction = await replicate.predictions.get(predictionId);
  let attempts = 0;

  while (
    (prediction.status === 'starting' || prediction.status === 'processing') &&
    attempts < DEFAULT_MAX_POLL_ATTEMPTS
  ) {
    await new Promise((resolve) => setTimeout(resolve, DEFAULT_POLL_INTERVAL_MS));
    prediction = await replicate.predictions.get(predictionId);
    attempts += 1;
    console.log(`[IDENTITY_MODEL] Poll attempt ${attempts}/${DEFAULT_MAX_POLL_ATTEMPTS} – status: ${prediction.status}`);
  }

  if (prediction.status === 'failed') {
    throw new Error(`Replicate prediction failed: ${prediction.error || 'unknown error'}`);
  }

  if (prediction.status !== 'succeeded') {
    throw new Error(`Replicate prediction timed out with status: ${prediction.status}`);
  }

  const output = prediction.output;
  const imageUrl = Array.isArray(output)
    ? output.find((v) => typeof v === 'string')
    : typeof output === 'string'
    ? output
    : null;

  if (!imageUrl) {
    throw new Error('Replicate returned no output URL.');
  }

  return { imageUrl, predictionId };
}

// ─── PhotoMaker ───────────────────────────────────────────────────────────────

/**
 * Generate an identity-consistent illustration using PhotoMaker.
 *
 * @param {object} params
 * @param {string[]} params.referenceImageUrls  – 1-4 reference photos
 * @param {string}   params.prompt              – full scene prompt
 * @param {string}   [params.negativePrompt]    – negative prompt
 * @param {string}   [params.styleStrength]     – "15-50" range (PhotoMaker style_strength_ratio)
 * @returns {Promise<{ imageUrl: string, predictionId: string, model: string }>}
 *
 * TODO (Phase 2): Implement this function.
 */
export async function generateWithPhotoMaker(params) {
  const { referenceImageUrls = [], prompt, negativePrompt = '', styleStrength = '35' } = params;

  console.log('[IDENTITY_MODEL] Provider: photomaker');
  console.log(`[REFERENCE_IMAGES_COUNT] ${referenceImageUrls.length}`);

  // TODO (Phase 2): Uncomment and complete once PhotoMaker version is stable.
  // const replicate = getReplicateClient();
  // const version = await resolveModelVersionId(
  //   PHOTOMAKER_MODEL_OWNER,
  //   PHOTOMAKER_MODEL_NAME,
  //   process.env.REPLICATE_PHOTOMAKER_VERSION
  // );
  // const prediction = await replicate.predictions.create({
  //   version,
  //   input: {
  //     prompt,
  //     negative_prompt: negativePrompt,
  //     input_image: referenceImageUrls[0],
  //     input_image2: referenceImageUrls[1] || undefined,
  //     input_image3: referenceImageUrls[2] || undefined,
  //     input_image4: referenceImageUrls[3] || undefined,
  //     style_strength_ratio: Number(styleStrength),
  //     num_outputs: 1,
  //     style: 'Photographic',
  //   },
  // });
  // return { ...(await pollPredictionToCompletion(replicate, prediction.id)), model: 'photomaker' };

  throw new Error('[IDENTITY_MODEL] PhotoMaker is not yet enabled (Phase 2 TODO).');
}

// ─── InstantID ────────────────────────────────────────────────────────────────

/**
 * Generate an identity-consistent illustration using InstantID.
 *
 * @param {object} params
 * @param {string}   params.referenceImageUrl  – single face reference photo
 * @param {string}   params.prompt             – full scene prompt
 * @param {string}   [params.negativePrompt]   – negative prompt
 * @returns {Promise<{ imageUrl: string, predictionId: string, model: string }>}
 *
 * TODO (Phase 2): Implement this function.
 */
export async function generateWithInstantID(params) {
  const { referenceImageUrl, prompt, negativePrompt = '' } = params;

  console.log('[IDENTITY_MODEL] Provider: instantid');
  console.log(`[REFERENCE_IMAGES_COUNT] 1`);

  // TODO (Phase 2): Uncomment and complete once InstantID version is confirmed.
  // const replicate = getReplicateClient();
  // const version = await resolveModelVersionId(
  //   INSTANTID_MODEL_OWNER,
  //   INSTANTID_MODEL_NAME,
  //   process.env.REPLICATE_INSTANTID_VERSION
  // );
  // const prediction = await replicate.predictions.create({
  //   version,
  //   input: {
  //     image: referenceImageUrl,
  //     prompt,
  //     negative_prompt: negativePrompt,
  //     width: 1024,
  //     height: 1024,
  //   },
  // });
  // return { ...(await pollPredictionToCompletion(replicate, prediction.id)), model: 'instantid' };

  throw new Error('[IDENTITY_MODEL] InstantID is not yet enabled (Phase 2 TODO).');
}

// ─── IP-Adapter FaceID ────────────────────────────────────────────────────────

/**
 * Generate an identity-consistent illustration using IP-Adapter FaceID.
 *
 * @param {object} params
 * @param {string}   params.referenceImageUrl  – face reference photo
 * @param {string}   params.prompt             – full scene prompt
 * @param {string}   [params.negativePrompt]   – negative prompt
 * @returns {Promise<{ imageUrl: string, predictionId: string, model: string }>}
 *
 * TODO (Phase 2): Implement this function.
 */
export async function generateWithIPAdapterFaceID(params) {
  const { referenceImageUrl, prompt, negativePrompt = '' } = params;

  console.log('[IDENTITY_MODEL] Provider: ipadapter_faceid');
  console.log(`[REFERENCE_IMAGES_COUNT] 1`);

  // TODO (Phase 2): Uncomment and complete once IP-Adapter version is confirmed.
  // const replicate = getReplicateClient();
  // const version = await resolveModelVersionId(
  //   IPADAPTER_MODEL_OWNER,
  //   IPADAPTER_MODEL_NAME,
  //   process.env.REPLICATE_IPADAPTER_VERSION
  // );
  // const prediction = await replicate.predictions.create({
  //   version,
  //   input: {
  //     prompt,
  //     negative_prompt: negativePrompt,
  //     image: referenceImageUrl,
  //     scale: 0.8,
  //   },
  // });
  // return { ...(await pollPredictionToCompletion(replicate, prediction.id)), model: 'ipadapter_faceid' };

  throw new Error('[IDENTITY_MODEL] IP-Adapter FaceID is not yet enabled (Phase 2 TODO).');
}

// ─── Flux LoRA (advanced) ─────────────────────────────────────────────────────

/**
 * Generate using a Flux LoRA fine-tuned on the child's reference images.
 * Requires that a LoRA training has already been completed and the
 * `weightsUrl` (Replicate output URL) has been stored in the child profile.
 *
 * @param {object} params
 * @param {string}   params.weightsUrl   – Replicate weights URL from training
 * @param {string}   params.triggerWord  – LoRA trigger word used during training
 * @param {string}   params.prompt       – full scene prompt (must include triggerWord)
 * @param {string}   [params.negativePrompt]
 * @returns {Promise<{ imageUrl: string, predictionId: string, model: string }>}
 *
 * TODO (Phase 2): Implement this function.  See lib/replicate/training.ts for the
 *                 training helpers.
 */
export async function generateWithFluxLora(params) {
  const { weightsUrl, triggerWord, prompt, negativePrompt = '' } = params;

  console.log('[IDENTITY_MODEL] Provider: flux_lora');

  // TODO (Phase 2): Implement Flux LoRA generation via replicate.run() with the
  //                 fine-tuned weights URL.
  // const replicate = getReplicateClient();
  // const prediction = await replicate.predictions.create({
  //   version: '<flux-dev model version>',
  //   input: {
  //     prompt: `${triggerWord} ${prompt}`,
  //     negative_prompt: negativePrompt,
  //     extra_lora: weightsUrl,
  //     extra_lora_scale: 0.9,
  //     width: 1024,
  //     height: 1024,
  //   },
  // });
  // return { ...(await pollPredictionToCompletion(replicate, prediction.id)), model: 'flux_lora' };

  throw new Error('[IDENTITY_MODEL] Flux LoRA generation is not yet enabled (Phase 2 TODO).');
}

// ─── Primary dispatcher ───────────────────────────────────────────────────────

/**
 * Dispatch identity-consistent generation to the configured provider.
 * Falls through providers in order if one throws, until all are exhausted.
 *
 * @param {object} params          – merged input including referenceImageUrls, prompt, etc.
 * @param {string} [modelOverride] – override REPLICATE_IDENTITY_MODEL for this call
 * @returns {Promise<{ imageUrl: string, predictionId: string, model: string }>}
 *
 * TODO (Phase 2): Wire up the real calls once the provider functions above are
 *                 implemented.
 */
export async function generateIdentityImage(params, modelOverride) {
  const provider =
    modelOverride ||
    process.env.REPLICATE_IDENTITY_MODEL ||
    'photomaker';

  console.log(`[IMAGE_PROVIDER] REPLICATE_IDENTITY`);
  console.log(`[IDENTITY_MODEL] ${provider}`);

  switch (provider) {
    case 'photomaker':
      return generateWithPhotoMaker(params);
    case 'instantid':
      return generateWithInstantID({
        ...params,
        referenceImageUrl: (params.referenceImageUrls || [])[0],
      });
    case 'ipadapter':
      return generateWithIPAdapterFaceID({
        ...params,
        referenceImageUrl: (params.referenceImageUrls || [])[0],
      });
    case 'flux_lora':
      return generateWithFluxLora(params);
    default:
      throw new Error(`Unknown REPLICATE_IDENTITY_MODEL "${provider}". Valid values: photomaker, instantid, ipadapter, flux_lora.`);
  }
}
