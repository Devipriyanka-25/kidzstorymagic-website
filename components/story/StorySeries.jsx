'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getBookThemePreviewArt,
  getStoryThemesForAgeGroup,
} from '@/utils/themes';

function deriveAgeGroup(childAge, providedAgeGroup) {
  if (providedAgeGroup) {
    return providedAgeGroup;
  }

  const age = Number(childAge);
  if (!Number.isFinite(age)) {
    return '5-8';
  }

  if (age <= 2) return '0-2';
  if (age <= 5) return '3-5';
  if (age <= 8) return '5-8';
  if (age <= 12) return '8-12';
  return '12+';
}

export default function StorySeries({
  childName,
  childAge,
  ageGroup,
  originalTheme,
  storyNumber = 1,
}) {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState('');
  const [bundleSelected, setBundleSelected] = useState(false);
  const resolvedAgeGroup = deriveAgeGroup(childAge, ageGroup);

  const themeOptions = useMemo(() => {
    const themes = getStoryThemesForAgeGroup(resolvedAgeGroup).filter(
      (theme) => theme.value !== originalTheme && theme.value !== 'customizable'
    );

    return themes.slice(0, 4);
  }, [originalTheme, resolvedAgeGroup]);

  const nextChapterNumber = Number(storyNumber) + 1;

  const handleContinue = () => {
    if (!selectedTheme) {
      return;
    }

    const params = new URLSearchParams({
      childName: childName || '',
      childAge: String(childAge || ''),
      ageGroup: resolvedAgeGroup,
      theme: selectedTheme,
      isSeries: 'true',
      chapterNumber: String(nextChapterNumber),
      bundle: bundleSelected ? 'true' : 'false',
      originalTheme: originalTheme || '',
    });

    router.push(`/wizard?${params.toString()}`);
  };

  if (themeOptions.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[32px] bg-[linear-gradient(135deg,#0f172a_0%,#172554_55%,#1d4ed8_100%)] p-6 shadow-[0_28px_80px_rgba(15,23,42,0.35)] sm:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-sky-200">
            Story Series
          </p>
          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
            Keep the adventure going
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-sky-100/90 sm:text-base">
            {childName || 'Your child'} has already completed story{' '}
            <span className="font-black">#{storyNumber}</span>. Invite them back
            for chapter {nextChapterNumber} with a new world, or nudge families
            toward a bundle.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setBundleSelected((currentValue) => !currentValue)}
          className={`rounded-[24px] border px-5 py-4 text-left transition-all ${
            bundleSelected
              ? 'border-amber-300 bg-amber-50 text-amber-900 shadow-[0_16px_32px_rgba(245,158,11,0.18)]'
              : 'border-white/15 bg-white/10 text-white hover:bg-white/15'
          }`}
        >
          <p className="text-sm font-black uppercase tracking-[0.18em]">
            Bundle Offer
          </p>
          <p className="mt-1 text-lg font-black">
            3 stories for $34.99
          </p>
          <p className="mt-1 text-sm opacity-80">
            Save 22% compared with buying one at a time.
          </p>
        </button>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-4">
        {themeOptions.map((theme) => {
          const isSelected = theme.value === selectedTheme;

          return (
            <button
              key={theme.value}
              type="button"
              onClick={() => setSelectedTheme(theme.value)}
              className={`overflow-hidden rounded-[28px] border text-left transition-all duration-300 ${
                isSelected
                  ? 'border-sky-300 bg-white shadow-[0_24px_48px_rgba(96,165,250,0.22)] ring-2 ring-sky-300'
                  : 'border-white/12 bg-white/10 hover:-translate-y-1 hover:bg-white/15'
              }`}
            >
              <div className="h-40 overflow-hidden bg-slate-900/20">
                <img
                  src={getBookThemePreviewArt(theme.value)}
                  alt={theme.label}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-5">
                <p
                  className={`text-xs font-black uppercase tracking-[0.28em] ${
                    isSelected ? 'text-sky-600' : 'text-sky-200'
                  }`}
                >
                  Chapter {nextChapterNumber}
                </p>
                <h3
                  className={`mt-3 text-xl font-black ${
                    isSelected ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {theme.label}
                </h3>
                <p
                  className={`mt-3 text-sm leading-6 ${
                    isSelected ? 'text-slate-600' : 'text-sky-100/85'
                  }`}
                >
                  {theme.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedTheme}
          className="flex-1 rounded-2xl bg-[linear-gradient(135deg,#38bdf8_0%,#2563eb_100%)] px-6 py-4 text-base font-black text-white shadow-[0_18px_35px_rgba(37,99,235,0.35)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {selectedTheme
            ? `Start Chapter ${nextChapterNumber}`
            : 'Pick the next adventure'}
        </button>
        <div className="flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-sm text-sky-100/85">
          Child details and theme are pre-filled to reduce checkout friction.
        </div>
      </div>
    </section>
  );
}
