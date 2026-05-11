import {
  getReplicateClient,
  resolveModelVersionId,
} from "@/lib/replicate/client";
import { buildIdentityReferenceBoard } from "@/lib/replicate/identityReferenceBoard";
import { buildStorySceneBrief } from "@/lib/storybook/scenePlanning";
import type { Prediction } from "replicate";

const DEFAULT_STORYBOOK_MODEL = "black-forest-labs/flux-kontext-max";
const INITIAL_REPLICATE_WAIT_SECONDS = 3;
const DEFAULT_STORYBOOK_ASPECT_RATIO =
  process.env.REPLICATE_STORYBOOK_ASPECT_RATIO?.trim() || "4:3";

function normalizeStorybookModelId(): string {
  return (
    process.env.REPLICATE_STORYBOOK_MODEL?.trim() || DEFAULT_STORYBOOK_MODEL
  );
}

function splitStorybookModelId(modelId: string): {
  owner: string;
  name: string;
} {
  const [owner, name] = modelId.split("/");

  if (!owner || !name) {
    throw new Error(
      `Invalid REPLICATE_STORYBOOK_MODEL "${modelId}". Expected owner/name.`
    );
  }

  return { owner, name };
}

const STORYBOOK_MODEL = normalizeStorybookModelId();
const STORYBOOK_MODEL_PARTS = splitStorybookModelId(STORYBOOK_MODEL);
const FLUX_STORYBOOK_MODEL_PREFIX = "black-forest-labs/flux-2-";
const KONTEXT_STORYBOOK_MODEL_PREFIX = "black-forest-labs/flux-kontext-";

export const DEFAULT_STORYBOOK_NEGATIVE_PROMPT =
  "realistic, photorealistic, photo, photograph, DSLR, camera, real photo, filtered photo, photo edit, photo filter, photo composite, photo overlay, realistic rendering, CGI, 3D render, realistic 3D, hyperrealistic, overly detailed realism, portrait photo, headshot photo, selfie photo, polaroid, instagram photo, social media photo, real world, live action, film still, movie still, documentary, photojournalism, professional photography, studio lighting real, portrait only, centered character, empty background, plain background, random pose, sticker look, emoji face, flat cartoon, cheap cartoon style, face-focused composition, low-detail environment, generic AI child, different child, different person, different face, different facial features, different face shape, different cheekbones, different jawline, changed hair type, changed hair color, changed hair style, aged child, older child, younger child, baby face, adult face, distorted face, asymmetrical face, unrecognizable child, unrecognizable face, face swap, deepfake, pasted face, face composite, face splice, facial features mismatch, photographic face on cartoon body, blurry, low resolution, washed out colors, pale, desaturated, low contrast, muddy, gloomy lighting, dark mood, horror, scary, nighttime, completely different child";

export type StoryPageGenerationInput = {
  prompt: string;
  referenceImages?: string[];
  subjectImage?: string;
  negativePrompt?: string;
};

export type StoryPageGenerationResult = {
  imageUrl: string;
  model: string;
  predictionId: string;
  prompt: string;
  version: string;
};

export type StoryPageGenerationPendingResult = {
  pending: true;
  status: "starting" | "processing";
  model: string;
  predictionId: string;
  prompt: string;
  version: string;
};

export type StoryPageGenerationState =
  | (StoryPageGenerationResult & {
      pending?: false;
      status: "succeeded";
    })
  | StoryPageGenerationPendingResult;

function extractErrorStatusCode(error: unknown): number | null {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      status?: number | string;
      statusCode?: number | string;
      response?: {
        status?: number | string;
        statusCode?: number | string;
      };
    };

    const directStatus = maybeError.status ?? maybeError.statusCode;
    if (
      typeof directStatus === "number" ||
      (typeof directStatus === "string" && /^\d{3}$/.test(directStatus))
    ) {
      return Number(directStatus);
    }

    const responseStatus =
      maybeError.response?.status ?? maybeError.response?.statusCode;
    if (
      typeof responseStatus === "number" ||
      (typeof responseStatus === "string" && /^\d{3}$/.test(responseStatus))
    ) {
      return Number(responseStatus);
    }
  }

  const message = getReplicateErrorMessage(error);
  const statusMatch =
    message.match(/\bstatus\s+(\d{3})\b/i) ||
    message.match(/\b(\d{3})\s+payment required\b/i);

  return statusMatch ? Number(statusMatch[1]) : null;
}

function buildPositiveAvoidanceInstructions(negativePrompt: string): string {
  const cleaned = negativePrompt
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 18);

  if (cleaned.length === 0) {
    return "";
  }

  return `Avoid outputs with these problems: ${cleaned.join(", ")}.`;
}

function normalizeSceneBlueprint(prompt: string): string {
  const normalizedPrompt = prompt.replace(/\s+/g, " ").trim();

  if (!normalizedPrompt) {
    return buildStorySceneBrief({
      pageTitle: "Story page",
      pageContent: "A premium children's book scene with clear story action.",
    });
  }

  if (
    normalizedPrompt.includes("=== SCENE-FIRST STORY ILLUSTRATION ===") ||
    normalizedPrompt.includes("CINEMATIC ENVIRONMENT:") ||
    normalizedPrompt.includes("COMPOSITION & FRAMING:") ||
    normalizedPrompt.includes("Movie-frame story scene") ||
    normalizedPrompt.includes("Exact story beat:")
  ) {
    return normalizedPrompt;
  }

  return buildStorySceneBrief({
    pageTitle: "Story page",
    pageContent: normalizedPrompt,
  });
}

export function buildStorybookPrompt(
  prompt: string,
  negativePrompt = DEFAULT_STORYBOOK_NEGATIVE_PROMPT
): string {
  const normalizedScenePrompt = normalizeSceneBlueprint(prompt);
  const avoidanceInstruction =
    buildPositiveAvoidanceInstructions(negativePrompt);

  return [
    "PRIMARY GOAL: The story scene is the primary focus. The finished image must read like a movie frame from the story, not like a child portrait with a random background.",
    "FORMAT: premium 2D illustrated children's storybook art with soft painterly rendering, cinematic storytelling, warm emotional lighting, volumetric glow, depth of field, expressive eyes, realistic child proportions, magical atmosphere, and detailed environments. It must be not photorealistic and never resemble a real photo.",
    "VIBRANT COLOR PALETTE: Use rich, saturated, vibrant colors throughout the entire scene. Employ warm glowing yellows, turquoises, corals, oranges, pinks, and soft purples. Colors should feel alive and joyful with excellent saturation and luminosity. Avoid muted, washed-out, or desaturated colors.",
    "LIGHTING & ATMOSPHERE: Soft volumetric lighting, warm color cast, subtle lighting gradients, glowing highlights, and atmospheric depth. Use lighting to create emotional warmth and magical mood. Include subtle light rays, soft shadows, and luminous glows around key elements.",
    "ENVIRONMENTAL RICHNESS: Build densely detailed backgrounds with multiple layers of foreground, midground, and background elements. Add intricate textures, decorative details, natural elements (plants, water, rocks), and visual storytelling elements that enhance the world and create depth without overwhelming the child character.",
    "TEXTURE & MATERIAL DETAIL: Include visible texture on fabrics, surfaces, and natural elements. Render clothing with fabric textures and folds. Add depth to water, plants, wood, stone, and other materials. Use material variety to create visual interest and premium quality.",
    "SCENE-FIRST GENERATION: Build the complete environment first. The location, objects, action, emotional beat, time of day, lighting, and cinematic mood from the page must all be visible in the final image. The child should be one of the primary storytelling anchors inside the scene, but the world and page action stay visually rich and essential.",
    "CHARACTER CREATION: Create an illustrated child character from the uploaded reference photo. Match the child's hairstyle, face shape, eye color, skin tone, and age appearance to create a recognizable character version.",
    "IDENTITY REFERENCE RULE: Use the uploaded child photo as identity guidance only. Match hairstyle, face shape, eye shape, skin tone, and age appearance, but do not copy the original photo framing, room, clothing graphics, lighting, or pose.",
    "CHARACTER CONSISTENCY: Keep the child's face, identity, and facial features recognizable across the full book. The child's face should remain consistent and identifiable. However, the clothing, costume, and accessories should change per page to match the exact story beat, setting, and adventure context of each page.",
    "PAGE-SPECIFIC COSTUME DESIGN: Each page must have unique costume and outfit design that matches the story's environmental setting and page action. Change the child's clothing, accessories, and costume between pages to reflect the story progression and specific location. Examples: indoor explorer scene = indoor adventure outfit, jungle/safari scene = explorer vest and khaki colors, underwater scene = wetsuit/scuba gear, forest scene = nature-appropriate clothing, etc. Costumes should be context-specific and thematically appropriate.",
    "REFERENCE SANITIZATION RULE: Ignore all props and surroundings from the uploaded child photo, especially cups, furniture, walls, indoor room backgrounds, jewelry details, clothing slogans, and household objects.",
    "STORY OVERRIDE RULE: The page story beat always overrides the uploaded photo context. If the story mentions an elephant, eagle, river, jungle, zebra, birds, or another page object, those story elements must appear clearly in the illustration.",
    "PROMINENCE RULE: Child should be easily identifiable and appear as the active protagonist experiencing the adventure. Child's face must be clearly visible and recognizable from the uploaded photo.",
    "COMPOSITION RULE: Fill most of the page with a cinematic story scene. Create clear foreground, midground, and background depth, and leave clean breathing room for printed story text without shrinking the world into a plain backdrop.",
    "SCENE BALANCE RULE: The illustrated child must be clearly recognizable and emotionally readable, but should not dominate the frame like a portrait, passport photo, sticker, or pasted face. The story world and action should carry at least half of the visual storytelling weight.",
    "WORLD SCALE RULE: Keep the child at natural story scale inside the environment. Use medium-wide to wide cinematic framing with the child acting within the setting, not oversized as a giant face or floating close-up unless the story beat truly requires it.",
    "CAMERA RULE: Prefer child-height or gently dynamic camera angles that help the viewer understand the page action and the surrounding world in one glance.",
    "ACTIVE PARTICIPATION: Child should be shown as an active participant - moving, interacting, exploring, discovering, or engaging with the story environment and characters rather than standing passively.",
    "FACE VISIBILITY: Child's face must be clearly visible and recognizable. Ensure facial expressions are expressive and match the emotional beat of the story page.",
    "READABILITY RULE: if the text were hidden, a parent should immediately recognize their child as the protagonist experiencing the story events.",
    "PHOTO SAFETY RULE: The output should look like painted story art, not photorealistic reference usage, not a realistic photo, not a face swap, and not a studio portrait. Transform the photo into beautiful illustrated storybook character art.",
    "BODY AND STAGING: Prefer full-body or three-quarter-body storytelling poses appropriate to the page action. Use natural scale and positioning within the world. The child should be moving, interacting, exploring, or experiencing the story instead of posing for the camera.",
    `SCENE BLUEPRINT: ${normalizedScenePrompt}`,
    "QUALITY STANDARD: Deliver premium children's book illustration quality that rivals professional studio work like Imagitime. The image should be immersive, emotionally connected, professionally illustrated, visually rich, with vibrant colors, detailed environments, and textured materials. Rich enough that the story is understandable even without reading the text.",
    avoidanceInstruction,
  ]
    .filter(Boolean)
    .join(" ");
}

function isFluxStorybookModel(modelId: string): boolean {
  return modelId.startsWith(FLUX_STORYBOOK_MODEL_PREFIX);
}

function isKontextStorybookModel(modelId: string): boolean {
  return modelId.startsWith(KONTEXT_STORYBOOK_MODEL_PREFIX);
}

function normalizeReferenceInputs(
  referenceImages: string[]
): Array<Buffer | string> {
  return referenceImages.map((referenceImage) =>
    normalizeSubjectInput(referenceImage)
  );
}

function getNormalizedReferenceImages(input: StoryPageGenerationInput): string[] {
  const orderedImages = [
    ...(input.subjectImage ? [input.subjectImage] : []),
    ...(Array.isArray(input.referenceImages) ? input.referenceImages : []),
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  return Array.from(new Set(orderedImages));
}

function buildFluxPredictionInput(input: StoryPageGenerationInput) {
  const referenceImages = getNormalizedReferenceImages(input);

  if (referenceImages.length === 0) {
    throw new Error(
      "At least one subject reference image is required to generate a story page."
    );
  }

  return {
    prompt: buildStorybookPrompt(input.prompt, input.negativePrompt),
    input_images: normalizeReferenceInputs(referenceImages.slice(0, 4)),
    width: 1024,
    height: 768,
    safety_tolerance: 2,
    output_format: "png",
    output_quality: 95,
  };
}

async function buildKontextPredictionInput(input: StoryPageGenerationInput) {
  const referenceImages = getNormalizedReferenceImages(input);
  const primaryReferenceImage = referenceImages[0] || input.subjectImage;

  if (!primaryReferenceImage) {
    throw new Error(
      "subjectImage is required for the identity-preserving story illustration model."
    );
  }

  return {
    prompt: buildStorybookPrompt(input.prompt, input.negativePrompt),
    input_image: await buildIdentityReferenceBoard(referenceImages),
    aspect_ratio: DEFAULT_STORYBOOK_ASPECT_RATIO,
  };
}

function buildLegacyPredictionInput(input: StoryPageGenerationInput) {
  if (!input.subjectImage) {
    throw new Error(
      "subjectImage is required for the legacy story illustration model."
    );
  }

  return {
    prompt: buildStorybookPrompt(input.prompt, input.negativePrompt),
    negative_prompt:
      input.negativePrompt || DEFAULT_STORYBOOK_NEGATIVE_PROMPT,
    subject: normalizeSubjectInput(input.subjectImage),
    number_of_outputs: 1,
    number_of_images_per_pose: 1,
    randomise_poses: false,
    output_format: "png",
    output_quality: 95,
  };
}

async function buildPredictionInput(input: StoryPageGenerationInput) {
  if (isKontextStorybookModel(STORYBOOK_MODEL)) {
    return buildKontextPredictionInput(input);
  }

  if (isFluxStorybookModel(STORYBOOK_MODEL)) {
    return buildFluxPredictionInput(input);
  }

  return buildLegacyPredictionInput(input);
}

function normalizeSubjectInput(subjectImage: string): Buffer | string {
  if (subjectImage.startsWith("data:")) {
    const [, base64Payload = ""] = subjectImage.split(",");

    if (!base64Payload) {
      throw new Error("The provided subjectImage data URL is invalid.");
    }

    return Buffer.from(base64Payload, "base64");
  }

  try {
    const parsedUrl = new URL(subjectImage);
    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return subjectImage;
    }
  } catch (error) {
    // Fall through to the validation error below.
  }

  throw new Error(
    "subjectImage must be a public http(s) URL or a base64 data URL."
  );
}

function extractOutputUrl(output: unknown): string {
  const firstOutput = Array.isArray(output) ? output[0] : output;

  if (!firstOutput) {
    throw new Error("Replicate returned no image output.");
  }

  if (typeof firstOutput === "string") {
    return firstOutput;
  }

  if (firstOutput instanceof URL) {
    return firstOutput.toString();
  }

  if (
    typeof firstOutput === "object" &&
    firstOutput !== null &&
    "url" in firstOutput
  ) {
    const maybeUrl = (firstOutput as { url?: string | (() => string) }).url;

    if (typeof maybeUrl === "string") {
      return maybeUrl;
    }

    if (typeof maybeUrl === "function") {
      return maybeUrl();
    }
  }

  const fallback = String(firstOutput);
  if (fallback.startsWith("http")) {
    return fallback;
  }

  throw new Error("Unable to normalize Replicate image output into a URL.");
}

export function getReplicateErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Story page generation failed.";
}

export function isReplicateBillingError(error: unknown): boolean {
  const statusCode = extractErrorStatusCode(error);
  const message = getReplicateErrorMessage(error).toLowerCase();

  return (
    statusCode === 402 ||
    message.includes("payment required") ||
    message.includes("billing") ||
    message.includes("credit balance")
  );
}

export function isReplicateRateLimitError(error: unknown): boolean {
  const statusCode = extractErrorStatusCode(error);
  return statusCode === 429;
}

export function getReplicateRetryAfter(error: unknown): number {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      response?: {
        headers?: Record<string, string | string[]>;
        retryAfter?: string | number;
      };
      retryAfter?: string | number;
    };

    // Check retry-after header
    const retryAfterHeaderValue = maybeError.response?.headers?.["retry-after"];
    const retryAfterHeader = Array.isArray(retryAfterHeaderValue)
      ? retryAfterHeaderValue[0]
      : retryAfterHeaderValue;
    if (retryAfterHeader) {
      const retryAfterMs = isNaN(Number(retryAfterHeader))
        ? new Date(retryAfterHeader).getTime() - Date.now()
        : Number(retryAfterHeader) * 1000;
      if (retryAfterMs > 0) {
        return Math.min(retryAfterMs, 60000); // Cap at 60 seconds
      }
    }

    // Check direct retryAfter property
    if (maybeError.retryAfter) {
      const retryAfterMs = isNaN(Number(maybeError.retryAfter))
        ? new Date(maybeError.retryAfter).getTime() - Date.now()
        : Number(maybeError.retryAfter) * 1000;
      if (retryAfterMs > 0) {
        return Math.min(retryAfterMs, 60000);
      }
    }
  }

  // Default: exponential backoff starting at 2 seconds
  return 2000;
}

function extractPredictionPrompt(
  prediction: Prediction,
  fallbackPrompt = ""
): string {
  const predictionInput = prediction.input as { prompt?: unknown } | undefined;

  return typeof predictionInput?.prompt === "string"
    ? predictionInput.prompt
    : fallbackPrompt;
}

function normalizePredictionVersion(
  prediction: Prediction,
  fallbackVersion = ""
): string {
  if (typeof prediction.version === "string" && prediction.version !== "hidden") {
    return prediction.version;
  }

  return fallbackVersion || "hidden";
}

function normalizeStoryPagePrediction(
  prediction: Prediction,
  fallback: { prompt?: string; version?: string } = {}
): StoryPageGenerationState {
  const prompt = extractPredictionPrompt(prediction, fallback.prompt || "");
  const version = normalizePredictionVersion(prediction, fallback.version);

  if (prediction.status === "succeeded") {
    return {
      imageUrl: extractOutputUrl(prediction.output),
      model: STORYBOOK_MODEL,
      predictionId: prediction.id,
      prompt,
      version,
      status: "succeeded",
    };
  }

  if (
    prediction.status === "starting" ||
    prediction.status === "processing"
  ) {
    return {
      pending: true,
      status: prediction.status,
      model: STORYBOOK_MODEL,
      predictionId: prediction.id,
      prompt,
      version,
    };
  }

  if (prediction.status === "failed") {
    throw new Error(`Prediction failed: ${prediction.error || "Unknown error"}`);
  }

  throw new Error(
    `Prediction is not available (status: ${prediction.status || "unknown"}).`
  );
}

export async function createStoryPageIllustrationPrediction(
  input: StoryPageGenerationInput
): Promise<StoryPageGenerationState> {
  const replicate = getReplicateClient();
  const version = await resolveModelVersionId(
    STORYBOOK_MODEL_PARTS.owner,
    STORYBOOK_MODEL_PARTS.name,
    process.env.REPLICATE_STORYBOOK_MODEL_VERSION ||
      process.env.REPLICATE_CONSISTENT_CHARACTER_VERSION
  );
  const prompt = buildStorybookPrompt(input.prompt, input.negativePrompt);

  const prediction = await replicate.predictions.create({
    version,
    wait: INITIAL_REPLICATE_WAIT_SECONDS,
    input: await buildPredictionInput(input),
  });

  return normalizeStoryPagePrediction(prediction, {
    prompt,
    version,
  });
}

export async function getStoryPageIllustrationPredictionStatus(
  predictionId: string
): Promise<StoryPageGenerationState> {
  const replicate = getReplicateClient();
  const prediction = await replicate.predictions.get(predictionId);

  return normalizeStoryPagePrediction(prediction);
}

export async function generateStoryPageIllustration(
  input: StoryPageGenerationInput
): Promise<StoryPageGenerationResult> {
  const prediction = await createStoryPageIllustrationPrediction(input);

  if (prediction.pending) {
    throw new Error(
      `Prediction ${prediction.predictionId} is still ${prediction.status}.`
    );
  }

  return prediction;
}

export async function cancelStoryPageIllustrationPrediction(
  predictionId: string
): Promise<void> {
  const replicate = getReplicateClient();
  await replicate.predictions.cancel(predictionId);
}
