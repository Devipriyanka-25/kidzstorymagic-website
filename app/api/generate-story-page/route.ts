import { NextRequest, NextResponse } from "next/server";

import {
  DEFAULT_STORYBOOK_NEGATIVE_PROMPT,
  generateStoryPageIllustration,
} from "@/lib/replicate/storyIllustrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const subjectImage =
      typeof body?.subjectImage === "string" ? body.subjectImage.trim() : "";
    const negativePrompt =
      typeof body?.negativePrompt === "string" && body.negativePrompt.trim()
        ? body.negativePrompt.trim()
        : DEFAULT_STORYBOOK_NEGATIVE_PROMPT;

    if (!prompt) {
      return NextResponse.json(
        { error: "prompt is required." },
        { status: 400 }
      );
    }

    if (!subjectImage) {
      return NextResponse.json(
        { error: "subjectImage is required." },
        { status: 400 }
      );
    }

    const result = await generateStoryPageIllustration({
      prompt,
      subjectImage,
      negativePrompt,
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
    const message =
      error instanceof Error ? error.message : "Story page generation failed.";
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
    message: "POST a prompt and subjectImage to generate a storybook illustration.",
    model: "sdxl-based/consistent-character",
    expectedBody: {
      prompt: "A whimsical forest adventure scene featuring the child hero",
      subjectImage: "https://example.com/child-photo.png",
      negativePrompt: DEFAULT_STORYBOOK_NEGATIVE_PROMPT,
    },
  });
}
