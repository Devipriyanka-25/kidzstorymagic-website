import { NextRequest, NextResponse } from "next/server";

import {
  createStoryPageIllustrationPrediction,
  DEFAULT_STORYBOOK_NEGATIVE_PROMPT,
  getReplicateRetryAfter,
  getReplicateErrorMessage,
  isReplicateBillingError,
  isReplicateRateLimitError,
} from "@/lib/replicate/storyIllustrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  let prompt = "";
  let subjectImage = "";
  let referenceImages: string[] = [];
  let negativePrompt = DEFAULT_STORYBOOK_NEGATIVE_PROMPT;

  try {
    const body = await request.json();
    prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    subjectImage =
      typeof body?.subjectImage === "string" ? body.subjectImage.trim() : "";
    referenceImages = Array.isArray(body?.referenceImages)
      ? body.referenceImages
          .filter((value: unknown) => typeof value === "string")
          .map((value: string) => value.trim())
          .filter(Boolean)
      : [];
    negativePrompt =
      typeof body?.negativePrompt === "string" && body.negativePrompt.trim()
        ? body.negativePrompt.trim()
        : DEFAULT_STORYBOOK_NEGATIVE_PROMPT;

    if (!prompt) {
      return NextResponse.json(
        { error: "prompt is required." },
        { status: 400 }
      );
    }

    if (!subjectImage && referenceImages.length === 0) {
      return NextResponse.json(
        { error: "subjectImage or referenceImages is required." },
        { status: 400 }
      );
    }

    if (!subjectImage) {
      subjectImage = referenceImages[0];
    }

    const result = await createStoryPageIllustrationPrediction({
      prompt,
      subjectImage,
      referenceImages,
      negativePrompt,
    });

    if (result.pending) {
      console.log("[GENERATE_STORY_PAGE] Prediction started", {
        predictionId: result.predictionId,
        status: result.status,
        model: result.model,
        version: result.version,
      });

      return NextResponse.json(
        {
          success: true,
          pending: true,
          status: result.status,
          predictionId: result.predictionId,
          prompt: result.prompt,
          model: result.model,
          version: result.version,
        },
        { status: 202 }
      );
    }

    console.log("[GENERATE_STORY_PAGE] Illustration ready immediately", {
      predictionId: result.predictionId,
      model: result.model,
      version: result.version,
    });

    return NextResponse.json({
      success: true,
      imageUrl: result.imageUrl,
      model: result.model,
      predictionId: result.predictionId,
      prompt: result.prompt,
      negativePrompt,
      version: result.version,
    });
  } catch (error) {
    const message = getReplicateErrorMessage(error);

    if (isReplicateBillingError(error)) {
      return NextResponse.json({
        error:
          "Illustration generation is temporarily unavailable. Please retry in a moment.",
        details: message,
      }, { status: 503 });
    }

    if (isReplicateRateLimitError(error)) {
      return NextResponse.json(
        {
          error: "Story page illustration generation is temporarily throttled.",
          details: message,
          retryAfterMs: getReplicateRetryAfter(error),
        },
        { status: 429 }
      );
    }

    const status = message.includes("REPLICATE_API_TOKEN") ? 503 : 500;

    return NextResponse.json(
      {
        error: "Failed to generate story page illustration.",
        details: message,
      },
      { status }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message:
      "POST a prompt plus one or more child reference images to start storybook illustration generation. Poll /api/generate-story-page/[predictionId] until the image is ready.",
    model:
      process.env.REPLICATE_STORYBOOK_MODEL?.trim() ||
      "black-forest-labs/flux-kontext-max",
    expectedBody: {
      prompt: "A whimsical forest adventure scene featuring the child hero",
      subjectImage: "https://example.com/child-photo.png",
      referenceImages: [
        "https://example.com/child-photo-front.png",
        "https://example.com/child-photo-smile.png",
      ],
      negativePrompt: DEFAULT_STORYBOOK_NEGATIVE_PROMPT,
    },
  });
}
