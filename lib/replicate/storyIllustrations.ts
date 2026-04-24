import {
  getReplicateClient,
  resolveModelVersionId,
} from "@/lib/replicate/client";

const CONSISTENT_CHARACTER_OWNER = "sdxl-based";
const CONSISTENT_CHARACTER_MODEL = "consistent-character";

export const DEFAULT_STORYBOOK_NEGATIVE_PROMPT =
  "photorealistic, blurry, hyper-real detail, harsh shadows, text, watermark, low quality, deformed anatomy";

export type StoryPageGenerationInput = {
  prompt: string;
  subjectImage: string;
  negativePrompt?: string;
};

export type StoryPageGenerationResult = {
  imageUrl: string;
  model: string;
  predictionId: string;
  prompt: string;
  version: string;
};

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

function buildFallbackIllustrationSvg(prompt: string): string {
  const promptLines = wrapPreviewText(prompt.replace(/\s+/g, " ").trim().slice(0, 72));
  const lineMarkup = promptLines
    .map(
      (line, index) => `
        <text x="80" y="${430 + index * 56}" fill="#fef3c7" font-family="Verdana, Arial, sans-serif" font-size="34" font-weight="700">
          ${escapeXml(line)}
        </text>`
    )
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" role="img" aria-label="Storybook illustration preview">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#1d4ed8" />
          <stop offset="50%" stop-color="#7c3aed" />
          <stop offset="100%" stop-color="#f97316" />
        </linearGradient>
        <linearGradient id="panel" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.08" />
        </linearGradient>
      </defs>

      <rect width="800" height="1000" fill="url(#bg)" />
      <circle cx="650" cy="180" r="120" fill="#fef08a" fill-opacity="0.25" />
      <circle cx="150" cy="200" r="90" fill="#bfdbfe" fill-opacity="0.22" />
      <circle cx="700" cy="820" r="140" fill="#fed7aa" fill-opacity="0.18" />
      <rect x="52" y="72" width="696" height="856" rx="44" fill="url(#panel)" stroke="#ffffff" stroke-opacity="0.28" />

      <text x="80" y="160" fill="#ffffff" font-family="Verdana, Arial, sans-serif" font-size="32" font-weight="700" letter-spacing="6">
        STORYBOOK PREVIEW
      </text>
      <text x="80" y="218" fill="#dbeafe" font-family="Verdana, Arial, sans-serif" font-size="62" font-weight="700">
        Illustration Ready Soon
      </text>
      <text x="80" y="286" fill="#e0f2fe" font-family="Verdana, Arial, sans-serif" font-size="28">
        Personalized artwork will appear here once image generation is available.
      </text>

      <rect x="80" y="360" width="640" height="248" rx="28" fill="#111827" fill-opacity="0.22" stroke="#ffffff" stroke-opacity="0.18" />
      <text x="80" y="396" fill="#fde68a" font-family="Verdana, Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="4">
        SCENE PROMPT
      </text>
      ${lineMarkup}

      <path d="M120 760 C220 650, 330 650, 430 760 S640 870, 720 760" fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="18" stroke-linecap="round" />
      <path d="M150 820 C250 730, 340 730, 430 820 S610 900, 690 820" fill="none" stroke="#fde68a" stroke-opacity="0.3" stroke-width="10" stroke-linecap="round" />

      <text x="80" y="900" fill="#ffffff" fill-opacity="0.85" font-family="Verdana, Arial, sans-serif" font-size="24">
        Kidz Story Magic preview illustration
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
  return [
    prompt.trim(),
    "soft painted children's storybook illustration",
    "whimsical composition",
    "warm color palette",
    "gentle lighting",
    "expressive but child-safe character design",
    "consistent protagonist appearance",
  ].join(", ");
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

export async function generateStoryPageIllustration(
  input: StoryPageGenerationInput
): Promise<StoryPageGenerationResult> {
  const replicate = getReplicateClient();
  const version = await resolveModelVersionId(
    CONSISTENT_CHARACTER_OWNER,
    CONSISTENT_CHARACTER_MODEL,
    process.env.REPLICATE_CONSISTENT_CHARACTER_VERSION
  );

  const prediction = await replicate.predictions.create({
    version,
    input: {
      prompt: buildStorybookPrompt(input.prompt),
      negative_prompt:
        input.negativePrompt || DEFAULT_STORYBOOK_NEGATIVE_PROMPT,
      subject: normalizeSubjectInput(input.subjectImage),
      number_of_outputs: 1,
      number_of_images_per_pose: 1,
      randomise_poses: false,
      output_format: "png",
      output_quality: 90,
    },
  });

  const completedPrediction = await replicate.wait(prediction);
  const imageUrl = extractOutputUrl(completedPrediction.output);

  return {
    imageUrl,
    model: `${CONSISTENT_CHARACTER_OWNER}/${CONSISTENT_CHARACTER_MODEL}`,
    predictionId: completedPrediction.id,
    prompt: buildStorybookPrompt(input.prompt),
    version,
  };
}
