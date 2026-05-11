import { NextRequest, NextResponse } from "next/server";

import {
  cancelStoryPageIllustrationPrediction,
  getReplicateRetryAfter,
  getReplicateErrorMessage,
  getStoryPageIllustrationPredictionStatus,
  isReplicateBillingError,
  isReplicateRateLimitError,
} from "@/lib/replicate/storyIllustrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(
  _request: NextRequest,
  { params }: { params: { predictionId: string } }
) {
  const predictionId =
    typeof params?.predictionId === "string" ? params.predictionId.trim() : "";

  if (!predictionId) {
    return NextResponse.json(
      { error: "predictionId is required." },
      { status: 400 }
    );
  }

  try {
    const result = await getStoryPageIllustrationPredictionStatus(predictionId);

    if (result.pending) {
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

    console.log("[GENERATE_STORY_PAGE_STATUS] Illustration ready", {
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
      version: result.version,
    });
  } catch (error) {
    const message = getReplicateErrorMessage(error);

    console.error("[GENERATE_STORY_PAGE_STATUS_ERROR]", {
      predictionId,
      message,
      isBillingError: isReplicateBillingError(error),
    });

    if (isReplicateBillingError(error)) {
      return NextResponse.json(
        {
          error:
            "Illustration generation is temporarily unavailable. Please retry in a moment.",
          details: message,
        },
        { status: 503 }
      );
    }

    if (isReplicateRateLimitError(error)) {
      return NextResponse.json(
        {
          error: "Story page illustration status is temporarily throttled.",
          details: message,
          retryAfterMs: getReplicateRetryAfter(error),
        },
        { status: 429 }
      );
    }

    const status = message.includes("REPLICATE_API_TOKEN") ? 503 : 500;

    return NextResponse.json(
      {
        error: "Failed to fetch story page illustration status.",
        details: message,
      },
      { status }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { predictionId: string } }
) {
  const predictionId =
    typeof params?.predictionId === "string" ? params.predictionId.trim() : "";

  if (!predictionId) {
    return NextResponse.json(
      { error: "predictionId is required." },
      { status: 400 }
    );
  }

  try {
    await cancelStoryPageIllustrationPrediction(predictionId);

    return NextResponse.json({
      success: true,
      cancelled: true,
      predictionId,
    });
  } catch (error) {
    const message = getReplicateErrorMessage(error);

    console.error("[GENERATE_STORY_PAGE_CANCEL_ERROR]", {
      predictionId,
      message,
    });

    return NextResponse.json(
      {
        error: "Failed to cancel story page illustration.",
        details: message,
      },
      { status: 500 }
    );
  }
}
