"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type StoryPage = {
  character_quote?: string;
  illustrationPrompt?: string | null;
  illustrationUrl?: string | null;
  pageNumber?: number;
  pageType?: string;
  page_text?: string;
  text?: string;
  title?: string;
  what_i_love?: string;
};

type CharacterConsistentStoryPageProps = {
  page: StoryPage;
  pageIndex: number;
  subjectImage?: string | null;
  onIllustrationReady?: (imageUrl: string) => void;
  onIllustrationStateChange?: (state: {
    status: "idle" | "loading" | "ready" | "error";
    message?: string;
  }) => void;
};

const illustrationCache = new Map<string, string>();
const ILLUSTRATION_POLL_INTERVAL_MS = 2500;
const ILLUSTRATION_SLOW_NOTICE_AFTER_ATTEMPTS = 12;

function waitForDelay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    const handleAbort = () => {
      window.clearTimeout(timeoutId);
      cleanup();
      reject(new DOMException("Request aborted", "AbortError"));
    };

    const cleanup = () => {
      signal?.removeEventListener("abort", handleAbort);
    };

    if (signal) {
      signal.addEventListener("abort", handleAbort, { once: true });
    }
  });
}

async function waitForIllustrationPrediction(
  predictionId: string,
  signal: AbortSignal,
  onPending?: (message: string | null) => void
): Promise<string> {
  for (let attempt = 0; ; attempt += 1) {
    if (attempt > 0) {
      await waitForDelay(ILLUSTRATION_POLL_INTERVAL_MS, signal);
    }

    const response = await fetch(
      `/api/generate-story-page/${encodeURIComponent(predictionId)}`,
      {
        method: "GET",
        cache: "no-store",
        signal,
      }
    );
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(
        payload?.details || payload?.error || "Illustration generation failed."
      );
    }

    if (payload?.pending) {
      onPending?.(
        attempt + 1 >= ILLUSTRATION_SLOW_NOTICE_AFTER_ATTEMPTS
          ? "This page is taking longer than usual. Please keep this page open while we finish the illustration."
          : null
      );
      continue;
    }

    if (typeof payload?.imageUrl === "string" && payload.imageUrl) {
      return payload.imageUrl;
    }

    throw new Error("Illustration generation finished without an image.");
  }
}

export default function CharacterConsistentStoryPage({
  page,
  pageIndex,
  subjectImage,
  onIllustrationReady,
  onIllustrationStateChange,
}: CharacterConsistentStoryPageProps) {
  const initialImage = page.illustrationUrl || null;
  const [imageUrl, setImageUrl] = useState<string | null>(initialImage);
  const [isGenerating, setIsGenerating] = useState(!initialImage);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const onIllustrationReadyRef = useRef(onIllustrationReady);
  const onIllustrationStateChangeRef = useRef(onIllustrationStateChange);

  useEffect(() => {
    onIllustrationReadyRef.current = onIllustrationReady;
  }, [onIllustrationReady]);

  useEffect(() => {
    onIllustrationStateChangeRef.current = onIllustrationStateChange;
  }, [onIllustrationStateChange]);

  const prompt = useMemo(() => {
    return (
      page.illustrationPrompt ||
      [page.title, page.page_text || page.text].filter(Boolean).join(". ")
    );
  }, [page.illustrationPrompt, page.page_text, page.text, page.title]);

  const cacheKey = useMemo(() => {
    return `${prompt}::${subjectImage || "no-subject"}::${pageIndex}`;
  }, [pageIndex, prompt, subjectImage]);

  useEffect(() => {
    if (page.illustrationUrl) {
      setImageUrl(page.illustrationUrl);
      setIsGenerating(false);
      setError(null);
      setStatusMessage(null);
      illustrationCache.set(cacheKey, page.illustrationUrl);
      onIllustrationStateChangeRef.current?.({ status: "ready" });
      return;
    }

    if (!prompt || !subjectImage) {
      setImageUrl(null);
      setIsGenerating(false);
      setError(null);
      setStatusMessage(null);
      onIllustrationStateChangeRef.current?.({ status: "idle" });
      return;
    }

    const cachedImage = illustrationCache.get(cacheKey);
    if (cachedImage) {
      setImageUrl(cachedImage);
      setIsGenerating(false);
      setError(null);
      setStatusMessage(null);
      onIllustrationReadyRef.current?.(cachedImage);
      onIllustrationStateChangeRef.current?.({ status: "ready" });
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function generateIllustration() {
      setImageUrl(null);
      setIsGenerating(true);
      setError(null);
      setStatusMessage(null);
      onIllustrationStateChangeRef.current?.({ status: "loading" });

      try {
        const response = await fetch("/api/generate-story-page", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            prompt,
            subjectImage,
          }),
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.details || payload?.error || "Illustration generation failed.");
        }

        if (cancelled) {
          return;
        }

        let nextImageUrl = payload.imageUrl as string | undefined;

        if (payload?.pending && typeof payload?.predictionId === "string") {
          nextImageUrl = await waitForIllustrationPrediction(
            payload.predictionId,
            controller.signal,
            (pendingMessage) => {
              if (cancelled) {
                return;
              }

              setStatusMessage(pendingMessage);
              onIllustrationStateChangeRef.current?.({
                status: "loading",
                message:
                  pendingMessage ||
                  "Generating a personalized illustration for this page.",
              });
            }
          );
        }

        if (!nextImageUrl) {
          throw new Error("Illustration generation finished without an image.");
        }

        illustrationCache.set(cacheKey, nextImageUrl);
        setImageUrl(nextImageUrl);
        setStatusMessage(null);
        onIllustrationReadyRef.current?.(nextImageUrl);
        onIllustrationStateChangeRef.current?.({ status: "ready" });
      } catch (generationError) {
        if (
          generationError instanceof DOMException &&
          generationError.name === "AbortError"
        ) {
          return;
        }

        if (!cancelled) {
          const message =
            generationError instanceof Error
              ? generationError.message
              : "Illustration generation failed.";

          setStatusMessage(null);
          setError(message);
          onIllustrationStateChangeRef.current?.({
            status: "error",
            message,
          });
        }
      } finally {
        if (!cancelled) {
          setIsGenerating(false);
        }
      }
    }

    generateIllustration();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [cacheKey, page.illustrationUrl, prompt, retryCount, subjectImage]);

  return (
    <div className="grid min-h-[620px] w-full grid-cols-1 overflow-hidden rounded-3xl bg-[linear-gradient(180deg,#fdf6e3_0%,#f8efe0_100%)] sm:min-h-[700px] md:grid-cols-[1.15fr_0.85fr] lg:min-h-[760px]">
      <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#fde68a_0%,#f59e0b_45%,#d97706_100%)] p-6 sm:min-h-[320px]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={page.title || `Story page ${pageIndex + 1}`}
            className="h-full w-full rounded-[28px] border-4 border-white/70 object-cover shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
          />
        ) : isGenerating ? (
          <div className="flex h-full w-full flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-white/70 bg-white/30 text-center text-white shadow-inner">
            <div className="mb-4 h-14 w-14 animate-spin rounded-full border-4 border-white/30 border-t-white" />
            <p className="text-lg font-semibold">Painting this page...</p>
            <p className="mt-2 max-w-xs text-sm text-white/85">
              {statusMessage ||
                "Generating a character-consistent storybook illustration from your child's photo."}
            </p>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-white/70 bg-white/30 p-8 text-center text-white shadow-inner">
            <p className="text-lg font-semibold">Illustration unavailable</p>
            <p className="mt-2 max-w-xs text-sm text-white/85">
              {error || "Add a child photo to generate this page's personalized illustration."}
            </p>
            {prompt && subjectImage ? (
              <button
                type="button"
                onClick={() => setRetryCount((currentRetryCount) => currentRetryCount + 1)}
                className="mt-4 rounded-full border border-white/70 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Retry illustration
              </button>
            ) : null}
          </div>
        )}

        <div className="absolute left-6 top-6 rounded-full bg-white/85 px-4 py-1 text-xs font-bold uppercase tracking-[0.25em] text-amber-700">
          Storybook Scene
        </div>
      </div>

      <div className="flex h-full flex-col justify-between bg-[linear-gradient(180deg,#fff8eb_0%,#fde7d7_100%)] p-5 text-slate-800 sm:p-6 md:p-8">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-rose-500">
            Page {page.pageNumber || pageIndex + 1}
          </p>
          <h3 className="text-3xl font-black uppercase leading-tight text-slate-900 md:text-4xl">
            {page.title || `Page ${pageIndex + 1}`}
          </h3>

          <div className="mt-6 rounded-[24px] border border-rose-200 bg-white/80 p-5 shadow-sm">
            <p className="text-base leading-8 text-slate-700 md:text-lg">
              {page.page_text || page.text}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {page.character_quote ? (
            <div className="rounded-[22px] bg-cyan-100 px-5 py-4 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-800">
                Character Quote
              </p>
              <p className="mt-2 text-sm font-semibold text-cyan-950 md:text-base">
                {page.character_quote}
              </p>
            </div>
          ) : null}

          {page.what_i_love ? (
            <div className="rounded-[22px] bg-amber-100 px-5 py-4 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-800">
                What I Love
              </p>
              <p className="mt-2 text-sm font-semibold text-amber-950 md:text-base">
                {page.what_i_love}
              </p>
            </div>
          ) : null}

          <div className="rounded-[22px] border border-amber-200 bg-white/75 px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-700">
              Illustration Prompt
            </p>
            <p className="mt-2 line-clamp-4 text-sm text-slate-600">
              {prompt}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
