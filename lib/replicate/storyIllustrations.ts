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
