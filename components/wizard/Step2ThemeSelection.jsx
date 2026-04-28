'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useWizardStore } from '@/utils/store';
import {
  getBookThemePreviewArt,
  getStoryThemesForAgeGroup,
  getTheme,
} from '@/utils/themes';

export default function Step2ThemeSelection() {
  const { formData, updateFormData, nextStep, prevStep } = useWizardStore();
  const [customPrompt, setCustomPrompt] = useState(
    formData.customIllustrationPrompt || ''
  );

  const referenceImage = useMemo(
    () =>
      formData.uploadedImages?.[0]?.preview ||
      formData.uploadedPhoto?.watermarkedUrl ||
      '',
    [formData.uploadedImages, formData.uploadedPhoto]
  );

  const availableThemes = useMemo(
    () => getStoryThemesForAgeGroup(formData.ageGroup),
    [formData.ageGroup]
  );

  const selectedTheme = useMemo(
    () => availableThemes.find((theme) => theme.value === formData.theme) || null,
    [availableThemes, formData.theme]
  );

  const isAdultAudience = formData.ageGroup === '12+';

  useEffect(() => {
    if (!formData.theme) {
      return;
    }

    const themeStillAvailable = availableThemes.some(
      (theme) => theme.value === formData.theme
    );

    if (!themeStillAvailable) {
      updateFormData('theme', '');
      updateFormData('illustrationStyle', '');
      if (formData.theme !== 'customizable') {
        updateFormData('customIllustrationPrompt', '');
        setCustomPrompt('');
      }
    }
  }, [
    availableThemes,
    formData.theme,
    setCustomPrompt,
    updateFormData,
  ]);

  const handleSelect = (theme) => {
    updateFormData('theme', theme.value);
    updateFormData('illustrationStyle', theme.illustrationTheme);

    if (theme.value !== 'customizable') {
      updateFormData('customIllustrationPrompt', '');
      setCustomPrompt('');
    }
  };

  const handleCustomPromptChange = (event) => {
    const value = event.target.value;
    setCustomPrompt(value);
    updateFormData('customIllustrationPrompt', value);
  };

  const isValid =
    Boolean(selectedTheme) &&
    (formData.theme !== 'customizable' || customPrompt.trim().length > 0);

  return (
    <div className="mx-auto w-full max-w-7xl rounded-[32px] bg-[linear-gradient(180deg,#f7fbff_0%,#eef4ff_100%)] px-4 py-10 shadow-[0_28px_80px_rgba(15,23,42,0.10)] sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-500">
          Step 2
        </p>
        <h2 className="mt-3 text-4xl font-black text-slate-900 sm:text-5xl">
          Choose Your Book
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
          {isAdultAudience
            ? 'Pick the premium celebration, tribute, or event-style story experience you want us to build. These cards preview the visual direction for a keepsake-quality illustrated book.'
            : 'Pick the premium story world you want us to build around your child. These cards show the theme direction only. The final Pixar-style 3D child illustration is generated later from the uploaded photos.'}
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {availableThemes.map((theme) => {
          const isSelected = formData.theme === theme.value;
          const themeColors = getTheme(theme.value);

          return (
            <button
              key={theme.value}
              type="button"
              onClick={() => handleSelect(theme)}
              className={`group overflow-hidden rounded-[28px] bg-white text-left shadow-[0_18px_48px_rgba(15,23,42,0.12)] transition-all duration-300 ${
                isSelected
                  ? 'scale-[1.02] ring-4 ring-sky-300'
                  : 'hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(15,23,42,0.18)]'
              }`}
            >
              <div className="relative h-[280px] overflow-hidden">
                <img
                  src={getBookThemePreviewArt(theme.value, referenceImage)}
                  alt={theme.label}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-orange-700">
                  Theme Preview
                </div>
                {isSelected ? (
                  <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-lg font-bold text-white shadow-lg">
                    OK
                  </div>
                ) : null}
              </div>

              <div className="space-y-4 px-6 py-6">
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-slate-900">
                    {theme.label}
                  </h3>
                  <p className="mt-2 text-base font-semibold text-slate-600">
                    {theme.ageRange}
                  </p>
                </div>

                <p className="min-h-[56px] text-sm leading-6 text-slate-600">
                  {theme.description}
                </p>

                <div
                  className="inline-flex rounded-full px-4 py-2 text-sm font-bold text-white shadow-md"
                  style={{
                    background: themeColors.gradient,
                    boxShadow: `0 10px 24px ${themeColors.shadowColor}`,
                  }}
                >
                  {isSelected ? 'Selected Book' : 'Choose This Book'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {formData.theme === 'customizable' && (
        <div className="mt-10 rounded-[28px] border border-sky-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-8">
          <h3 className="text-2xl font-black text-slate-900">
            Design Your Own Story World
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Describe the full environment you want. Think like a premium cover:
            where the child is, what magical creatures are nearby, what the
            lighting feels like, and how the scene should look overall.
          </p>
          <textarea
            id="customIllustrationPrompt"
            name="customIllustrationPrompt"
            value={customPrompt}
            onChange={handleCustomPromptChange}
            placeholder="Example: A dreamy moonlit sky kingdom with floating bridges, glowing swans, soft clouds, and a child hero in a silver cape discovering a hidden star castle..."
            className="mt-5 min-h-[180px] w-full rounded-[22px] border-2 border-slate-200 px-5 py-4 text-base text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
        </div>
      )}

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <button
          type="button"
          onClick={prevStep}
          className="flex-1 rounded-2xl bg-slate-200 px-6 py-4 text-lg font-bold text-slate-800 transition hover:bg-slate-300"
        >
          Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          disabled={!isValid}
          className="flex-1 rounded-2xl bg-[linear-gradient(135deg,#2563EB_0%,#1D4ED8_100%)] px-6 py-4 text-lg font-bold text-white shadow-[0_18px_32px_rgba(37,99,235,0.24)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {selectedTheme
            ? `Continue with ${selectedTheme.label}`
            : 'Continue'}
        </button>
      </div>
    </div>
  );
}
