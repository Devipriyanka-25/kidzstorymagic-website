import { NextRequest, NextResponse } from "next/server";

import {
  getReplicateErrorMessage,
  getStoryPageIllustrationPredictionStatus,
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
