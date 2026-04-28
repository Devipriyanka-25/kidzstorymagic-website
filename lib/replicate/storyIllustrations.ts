import {
  getReplicateClient,
  resolveModelVersionId,
} from "@/lib/replicate/client";
import type { Prediction } from "replicate";

const DEFAULT_STORYBOOK_MODEL = "black-forest-labs/flux-2-pro";
const INITIAL_REPLICATE_WAIT_SECONDS = 3;

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

export const DEFAULT_STORYBOOK_NEGATIVE_PROMPT =
  "photorealistic, real photo, live action, portrait photo, selfie, school photo, documentary look, close-up face, cropped head, giant face, floating head, split layout, collage, side-by-side comparison, flat vector, dull colors, desaturated, gloomy, sad, somber, dark horror mood, eerie forest, creepy, scary, spooky, haunted, thriller lighting, blue-grey darkness, dim lighting, harsh shadows, low detail, blurry, text, watermark, random face, adult face, duplicate child, deformed anatomy, extra limbs, realistic skin pores, realistic hair strands, horror poster, moody realism";

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

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function wrapPreviewText(value: string, maxLineLength = 24): string[] {
  const words = value.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return ["A magical storybook scene"];
  }

  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length <= maxLineLength) {
      currentLine = nextLine;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;

    if (lines.length === 3) {
      break;
    }
  }

  if (currentLine && lines.length < 3) {
    lines.push(currentLine);
  }

  return lines.slice(0, 3);
}

function buildFallbackIllustrationSvg(
  prompt: string
): string {
  const promptLines = wrapPreviewText(
    prompt.replace(/\s+/g, " ").trim().slice(0, 90),
    26
  );
  const lineMarkup = promptLines
    .map(
      (line, index) => `
        <text x="96" y="${1056 + index * 54}" fill="#fff7ed" font-family="Verdana, Arial, sans-serif" font-size="34" font-weight="700">
          ${escapeXml(line)}
        </text>`
    )
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 1400" role="img" aria-label="Storybook illustration preview">
      <defs>
        <linearGradient id="sky" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#60a5fa" />
          <stop offset="42%" stop-color="#a855f7" />
          <stop offset="100%" stop-color="#fb923c" />
        </linearGradient>
        <linearGradient id="sunset" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#fde68a" stop-opacity="0.75" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="panel" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#111827" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#111827" stop-opacity="0.18" />
        </linearGradient>
      </defs>

      <rect width="1100" height="1400" fill="#fff7ed" />
      <rect x="54" y="52" width="992" height="1296" rx="42" fill="#fffaf5" />
      <rect x="78" y="78" width="944" height="880" rx="36" fill="url(#sky)" />
      <ellipse cx="260" cy="200" rx="180" ry="100" fill="#ffffff" fill-opacity="0.2" />
      <ellipse cx="770" cy="172" rx="230" ry="112" fill="#ffffff" fill-opacity="0.12" />
      <circle cx="282" cy="250" r="132" fill="url(#sunset)" />
      <path d="M78 720 C210 610, 320 612, 448 720 S712 846, 1022 720 L1022 958 L78 958 Z" fill="#1d4ed8" fill-opacity="0.32" />
      <path d="M78 760 C230 642, 360 664, 520 776 S812 864, 1022 744 L1022 958 L78 958 Z" fill="#0f766e" fill-opacity="0.34" />
      <path d="M78 820 C260 698, 408 742, 578 828 S854 904, 1022 814 L1022 958 L78 958 Z" fill="#14532d" fill-opacity="0.42" />
      <rect x="116" y="124" width="240" height="56" rx="28" fill="#fff7ed" fill-opacity="0.95" />
      <text x="148" y="161" fill="#c2410c" font-family="Verdana, Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="6">
        STORYBOOK PREVIEW
      </text>
      <text x="120" y="612" fill="#ffffff" font-family="Verdana, Arial, sans-serif" font-size="86" font-weight="700">
        Premium Scene
      </text>
      <text x="120" y="692" fill="#fff7ed" font-family="Verdana, Arial, sans-serif" font-size="40" font-weight="700">
        Your child becomes the hero inside the world
      </text>
      <text x="120" y="752" fill="#ffedd5" font-family="Verdana, Arial, sans-serif" font-size="28">
        We will swap in the finished AI illustration here as soon as it is ready.
      </text>

      <rect x="78" y="992" width="944" height="286" rx="34" fill="#7c2d12" />
      <rect x="78" y="992" width="944" height="286" rx="34" fill="url(#panel)" />
      <text x="96" y="1040" fill="#fde68a" font-family="Verdana, Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="4">
        SCENE PROMPT
      </text>
      ${lineMarkup}

      <text x="96" y="1230" fill="#ffedd5" fill-opacity="0.95" font-family="Verdana, Arial, sans-serif" font-size="24">
        Kidz Story Magic storybook preview
      </text>
    </svg>
  `;
}

function buildSvgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

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

function buildStorybookPrompt(prompt: string): string {
  return JSON.stringify({
    scene: prompt.trim(),
    subject:
      "One young child, reconstructed from the provided reference photos as a premium 3D animated cartoon hero for a children's storybook.",
    style:
      "Bright premium animated family-film illustration, polished 3D cartoon finish, rounded child-friendly shapes, expressive eyes, soft cinematic materials, welcoming children's book cover energy, ultra-vivid premium color, rich playful saturation, luminous magical highlights.",
    composition:
      "Vertical premium storybook cover composition, full scene with a complete background world, full-body or three-quarter-body hero framing, visible environmental depth, not a close-up portrait.",
    lighting:
      "Bright cheerful daylight or golden sunrise glow, soft magical highlights, warm welcoming atmosphere, no gloomy or eerie mood.",
    color_palette:
      "Ultra-vibrant joyful storybook colors with warm sky tones, candy-bright accents, playful contrast, jewel-tone depth, pastel glow, and a premium glossy animated feel.",
    character_consistency:
      "Keep the same child identity, face structure, skin tone, hair style, and proportions consistent across every page while converting the child into a stylized cartoon character instead of a real photo.",
    quality:
      "High-end children's storybook illustration, polished 3D rendering feel, cinematic depth, friendly emotion, premium catalog-worthy finish.",
  });
}

function isFluxStorybookModel(modelId: string): boolean {
  return modelId.startsWith(FLUX_STORYBOOK_MODEL_PREFIX);
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
    ...(Array.isArray(input.referenceImages) ? input.referenceImages : []),
    ...(input.subjectImage ? [input.subjectImage] : []),
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
    prompt: buildStorybookPrompt(input.prompt),
    input_images: normalizeReferenceInputs(referenceImages.slice(0, 4)),
    width: 960,
    height: 1280,
    safety_tolerance: 2,
    output_format: "png",
    output_quality: 90,
  };
}

function buildLegacyPredictionInput(input: StoryPageGenerationInput) {
  if (!input.subjectImage) {
    throw new Error(
      "subjectImage is required for the legacy story illustration model."
    );
  }

  return {
    prompt: buildStorybookPrompt(input.prompt),
    negative_prompt:
      input.negativePrompt || DEFAULT_STORYBOOK_NEGATIVE_PROMPT,
    subject: normalizeSubjectInput(input.subjectImage),
    number_of_outputs: 1,
    number_of_images_per_pose: 1,
    randomise_poses: false,
    output_format: "png",
    output_quality: 90,
  };
}

function buildPredictionInput(input: StoryPageGenerationInput) {
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

export function createFallbackStoryPageIllustration(
  input: StoryPageGenerationInput
): StoryPageGenerationResult {
  const prompt = buildStorybookPrompt(input.prompt);

  return {
    imageUrl: buildSvgDataUrl(buildFallbackIllustrationSvg(input.prompt)),
    model: "storybook/demo-fallback",
    predictionId: "fallback-placeholder",
    prompt,
    version: "fallback",
  };
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
  const prompt = buildStorybookPrompt(input.prompt);

  const prediction = await replicate.predictions.create({
    version,
    wait: INITIAL_REPLICATE_WAIT_SECONDS,
    input: buildPredictionInput(input),
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
