import { NextRequest, NextResponse } from "next/server";

import {
  cancelStoryPageIllustrationPrediction,
  getReplicateErrorMessage,
  getStoryPageIllustrationPredictionStatus,
  createFallbackStoryPageIllustration,
  isReplicateBillingError,
} from "@/lib/replicate/storyIllustrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

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

  // Handle fallback predictions
  if (predictionId === "fallback-placeholder") {
    return NextResponse.json(
      {
        success: true,
        pending: false,
        imageUrl: "", // Placeholder - client should handle this
        status: "fallback",
        predictionId: "fallback-placeholder",
      },
      { status: 200 }
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

    // If it's a billing error, return a fallback illustration
    if (isReplicateBillingError(error)) {
      const fallback = createFallbackStoryPageIllustration({
        prompt: "Illustration preview placeholder",
        subjectImage: "",
      });

      return NextResponse.json(
        {
          success: true,
          pending: false,
          imageUrl: fallback.imageUrl,
          status: "fallback",
          predictionId: "fallback",
          warning:
            "Replicate service billing limit reached. Showing a preview placeholder instead.",
        },
        { status: 200 }
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
