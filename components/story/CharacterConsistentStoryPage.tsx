"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getIllustrationApiErrorMessage,
  prepareReferenceImagesForGeneration,
  readIllustrationApiPayload,
} from "@/utils/subjectImage";
import { getBookThemePreviewArt, getTheme } from "@/utils/themes";

type StoryPage = {
  character_quote?: string;
  faceSwappedUrl?: string | null;
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
  autoGenerateIllustration?: boolean;
  bookThemeValue?: string | null;
  generationState?: {
    status: "idle" | "loading" | "ready" | "error";
    message?: string;
  } | null;
  onIllustrationReady?: (imageUrl: string) => void;
  onIllustrationStateChange?: (state: {
    status: "idle" | "loading" | "ready" | "error";
    message?: string;
  }) => void;
  page: StoryPage;
  pageIndex: number;
  referenceImages?: string[] | null;
  subjectImage?: string | null;
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
    const payload = await readIllustrationApiPayload(response);

    if (!response.ok) {
      throw new Error(getIllustrationApiErrorMessage(response, payload));
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
  autoGenerateIllustration = true,
  bookThemeValue = null,
  generationState = null,
  onIllustrationReady,
  onIllustrationStateChange,
  page,
  pageIndex,
  referenceImages = null,
  subjectImage,
}: CharacterConsistentStoryPageProps) {
  const initialImage = page.illustrationUrl || page.faceSwappedUrl || null;
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
    const referenceKey = Array.isArray(referenceImages)
      ? referenceImages.join("|")
      : subjectImage || "no-subject";
    return `${prompt}::${referenceKey}::${pageIndex}`;
  }, [pageIndex, prompt, referenceImages, subjectImage]);
  const frameTheme = useMemo(
    () => getTheme(bookThemeValue || "fantasy"),
    [bookThemeValue]
  );
  const friendlyPreviewArt = useMemo(
    () =>
      getBookThemePreviewArt(
        bookThemeValue || "animal-adventure",
        subjectImage || ""
      ),
    [bookThemeValue, subjectImage]
  );
  const showIllustrationPrompt = process.env.NEXT_PUBLIC_DEBUG_MODE === "true";
  const pageNumberLabel = page.pageNumber || pageIndex + 1;
  const pageTitle = page.title || `Page ${pageIndex + 1}`;
  const pageBody = page.page_text || page.text || "";
  const displayIllustrationUrl = imageUrl || friendlyPreviewArt;

  useEffect(() => {
    if (autoGenerateIllustration) {
      return;
    }

    if (page.illustrationUrl || page.faceSwappedUrl) {
      setImageUrl(page.illustrationUrl || page.faceSwappedUrl || null);
      setIsGenerating(false);
      setError(null);
      setStatusMessage(null);
      return;
    }

    if (generationState?.status === "loading") {
      setImageUrl(null);
      setIsGenerating(true);
      setError(null);
      setStatusMessage(generationState.message || null);
      return;
    }

    if (generationState?.status === "error") {
      setImageUrl(null);
      setIsGenerating(false);
      setStatusMessage(null);
      setError(
        generationState.message || "Illustration generation failed."
      );
      return;
    }

    setImageUrl(null);
    setIsGenerating(false);
    setError(null);
    setStatusMessage(null);
  }, [
    autoGenerateIllustration,
    generationState,
    page.faceSwappedUrl,
    page.illustrationUrl,
  ]);

  useEffect(() => {
    if (!autoGenerateIllustration) {
      return;
    }

    if (page.illustrationUrl || page.faceSwappedUrl) {
      const resolvedPageImage =
        page.illustrationUrl || page.faceSwappedUrl || null;
      setImageUrl(resolvedPageImage);
      setIsGenerating(false);
      setError(null);
      setStatusMessage(null);
      if (resolvedPageImage) {
        illustrationCache.set(cacheKey, resolvedPageImage);
      }
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
        const preparedReferenceImages = await prepareReferenceImagesForGeneration(
          Array.isArray(referenceImages) && referenceImages.length > 0
            ? referenceImages
            : [subjectImage]
        );
        const preparedSubjectImage =
          preparedReferenceImages[0] || String(subjectImage || "").trim();
        const response = await fetch("/api/generate-story-page", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            prompt,
            subjectImage: preparedSubjectImage,
            referenceImages: preparedReferenceImages,
          }),
        });

        const payload = await readIllustrationApiPayload(response);

        if (!response.ok) {
          throw new Error(getIllustrationApiErrorMessage(response, payload));
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
  }, [
    autoGenerateIllustration,
    cacheKey,
    page.faceSwappedUrl,
    page.illustrationUrl,
    prompt,
    referenceImages,
    retryCount,
    subjectImage,
  ]);

  return (
    <article className="overflow-hidden rounded-[34px] border border-slate-200 bg-[linear-gradient(180deg,#fffdf8_0%,#fff5e8_100%)] shadow-[0_28px_72px_rgba(15,23,42,0.12)]">
      <div className="p-5 sm:p-6 lg:p-7">
        <div className="rounded-[30px] bg-white p-4 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
          <div className="relative isolate min-h-[360px] overflow-hidden rounded-[28px] bg-[#eef6ff] sm:min-h-[440px] lg:min-h-[520px]">
            <img
              src={displayIllustrationUrl}
              alt={pageTitle}
              className="absolute inset-0 h-full w-full object-cover saturate-[1.08] brightness-[1.05]"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.42)_0%,transparent_34%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.22)_100%)]" />

            <div className="absolute left-5 top-5 z-20 rounded-full bg-white/95 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-orange-700 shadow-lg sm:left-6 sm:top-6">
              Storybook Cover
            </div>

            {isGenerating ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center p-8">
                <div className="max-w-lg rounded-[28px] bg-white/86 px-8 py-8 text-center shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur-md">
                  <div
                    className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-4"
                    style={{
                      borderColor: `${frameTheme.primary}30`,
                      borderTopColor: frameTheme.primary,
                    }}
                  />
                  <p className="text-2xl font-black text-slate-900">
                    Painting your storybook illustration...
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                    {statusMessage ||
                      "We are painting a premium 2D storybook scene and preserving your child's key facial details in an illustrated style."}
                  </p>
                </div>
              </div>
            ) : null}

            {!isGenerating && error ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center p-8">
                <div className="max-w-lg rounded-[28px] bg-white/88 px-8 py-8 text-center shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur-md">
                  <p className="text-2xl font-black text-slate-900">
                    We are still polishing this illustration
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                    {error ||
                      "Add a child photo to generate this page's personalized illustration."}
                  </p>
                  {prompt && subjectImage ? (
                    <button
                      type="button"
                      onClick={() =>
                        setRetryCount((currentRetryCount) => currentRetryCount + 1)
                      }
                      className="mt-6 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-105"
                      style={{
                        background: frameTheme.gradient,
                      }}
                    >
                      Retry illustration
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-5 px-5 pb-5 sm:px-6 sm:pb-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)] lg:px-7 lg:pb-7">
        <div className="space-y-4">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-[0.35em]"
              style={{ color: frameTheme.primary }}
            >
              Page {pageNumberLabel}
            </p>
            <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {pageTitle}
            </h3>
          </div>

          <div
            className="rounded-[28px] border bg-white/92 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:p-6"
            style={{
              borderColor: `${frameTheme.primary}24`,
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: frameTheme.primary }}
            >
              Story Text
            </p>
            <p className="mt-4 text-base leading-8 text-slate-700 sm:text-lg sm:leading-9">
              {pageBody}
            </p>
          </div>
        </div>

        <div className="space-y-4">
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

          {showIllustrationPrompt ? (
            <div className="rounded-[22px] border border-amber-200 bg-white/80 px-5 py-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-700">
                Illustration Prompt
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{prompt}</p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
