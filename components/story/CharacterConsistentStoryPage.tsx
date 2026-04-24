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
};

const illustrationCache = new Map<string, string>();

export default function CharacterConsistentStoryPage({
  page,
  pageIndex,
  subjectImage,
  onIllustrationReady,
}: CharacterConsistentStoryPageProps) {
  const initialImage = page.illustrationUrl || null;
  const [imageUrl, setImageUrl] = useState<string | null>(initialImage);
  const [isGenerating, setIsGenerating] = useState(!initialImage);
  const [error, setError] = useState<string | null>(null);
  const onIllustrationReadyRef = useRef(onIllustrationReady);

  useEffect(() => {
    onIllustrationReadyRef.current = onIllustrationReady;
  }, [onIllustrationReady]);

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
      illustrationCache.set(cacheKey, page.illustrationUrl);
      return;
    }

    if (!prompt || !subjectImage) {
      setImageUrl(null);
      setIsGenerating(false);
      setError(null);
      return;
    }

    const cachedImage = illustrationCache.get(cacheKey);
    if (cachedImage) {
      setImageUrl(cachedImage);
      setIsGenerating(false);
      setError(null);
      onIllustrationReadyRef.current?.(cachedImage);
      return;
    }

    let cancelled = false;

    async function generateIllustration() {
      setImageUrl(null);
      setIsGenerating(true);
      setError(null);

      try {
        const response = await fetch("/api/generate-story-page", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

        const nextImageUrl = payload.imageUrl as string;
        illustrationCache.set(cacheKey, nextImageUrl);
        setImageUrl(nextImageUrl);
        onIllustrationReadyRef.current?.(nextImageUrl);
      } catch (generationError) {
        if (!cancelled) {
          setError(
            generationError instanceof Error
              ? generationError.message
              : "Illustration generation failed."
          );
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
    };
  }, [cacheKey, page.illustrationUrl, prompt, subjectImage]);

  return (
    <div className="grid h-full grid-cols-1 overflow-hidden rounded-r-3xl bg-[linear-gradient(180deg,#fdf6e3_0%,#f8efe0_100%)] md:grid-cols-[1.15fr_0.85fr]">
      <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#fde68a_0%,#f59e0b_45%,#d97706_100%)] p-6">
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
              Generating a character-consistent storybook illustration from your child's photo.
            </p>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-white/70 bg-white/30 p-8 text-center text-white shadow-inner">
            <p className="text-lg font-semibold">Illustration unavailable</p>
            <p className="mt-2 max-w-xs text-sm text-white/85">
              {error || "Add a child photo to generate this page's personalized illustration."}
            </p>
          </div>
        )}

        <div className="absolute left-6 top-6 rounded-full bg-white/85 px-4 py-1 text-xs font-bold uppercase tracking-[0.25em] text-amber-700">
          Storybook Scene
        </div>
      </div>

      <div className="flex h-full flex-col justify-between bg-[linear-gradient(180deg,#fff8eb_0%,#fde7d7_100%)] p-6 text-slate-800 md:p-8">
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
