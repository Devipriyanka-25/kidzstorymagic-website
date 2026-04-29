'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useWizardStore } from '@/utils/store';
import MilestoneSelector from './MilestoneSelector';
import { getMilestoneById, getMilestoneFormData } from '@/utils/milestones';
import {
  getBookThemePreviewArt,
  getCategoriesByAgeGroup,
  getStoryThemesForAgeGroup,
  getTheme,
  getThemesByCategory,
} from '@/utils/themes';

export default function Step2ThemeSelection() {
  const { formData, updateFormData, nextStep, prevStep } = useWizardStore();
  const [customPrompt, setCustomPrompt] = useState(
    formData.customIllustrationPrompt || ''
  );
  const [selectedCategory, setSelectedCategory] = useState(null);

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
  const themeCategories = useMemo(
    () => getCategoriesByAgeGroup(formData.ageGroup),
    [formData.ageGroup]
  );
  const categoryEntries = useMemo(
    () => Object.entries(themeCategories),
    [themeCategories]
  );
  const themesInSelectedCategory = useMemo(
    () =>
      selectedCategory
        ? getThemesByCategory(formData.ageGroup, selectedCategory)
        : availableThemes,
    [availableThemes, formData.ageGroup, selectedCategory]
  );
  const activeCategory = useMemo(
    () => (selectedCategory ? themeCategories[selectedCategory] || null : null),
    [selectedCategory, themeCategories]
  );

  const selectedTheme = useMemo(
    () => availableThemes.find((theme) => theme.value === formData.theme) || null,
    [availableThemes, formData.theme]
  );
  const selectedMilestone = useMemo(
    () => getMilestoneById(formData.selectedMilestoneId),
    [formData.selectedMilestoneId]
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

  useEffect(() => {
    if (!categoryEntries.length) {
      setSelectedCategory(null);
      return;
    }

    const categoryWithSelectedTheme = categoryEntries.find(([, category]) =>
      category.themes.includes(formData.theme)
    );

    setSelectedCategory((currentCategory) => {
      if (categoryWithSelectedTheme) {
        return categoryWithSelectedTheme[0];
      }

      if (currentCategory && themeCategories[currentCategory]) {
        return currentCategory;
      }

      return categoryEntries[0][0];
    });
  }, [categoryEntries, formData.theme, themeCategories]);

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

  const handleMilestoneSelect = (milestone) => {
    Object.entries(getMilestoneFormData(milestone)).forEach(
      ([field, value]) => {
        updateFormData(field, value);
      }
    );
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

      {formData.isSeries ? (
        <div className="mt-8 rounded-[28px] border border-sky-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-sky-600">
            Chapter {formData.seriesChapterNumber || 2}
          </p>
          <h3 className="mt-2 text-2xl font-black text-slate-900">
            Sequel flow is pre-filled
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            We carried forward the child details from the previous purchase so
            families can start the next adventure faster.
          </p>
        </div>
      ) : null}

      <div className="mt-10">
        <MilestoneSelector
          ageGroup={formData.ageGroup}
          selectedId={formData.selectedMilestoneId}
          onSelect={handleMilestoneSelect}
        />
      </div>

      {selectedMilestone ? (
        <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 px-6 py-5 text-sm leading-7 text-amber-900">
          <span className="font-black">{selectedMilestone.title} selected.</span>{' '}
          We will carry that moment into the story prompt and cover treatment
          later in the flow.
        </div>
      ) : null}

      {categoryEntries.length ? (
        <section className="mt-12 rounded-[28px] border border-sky-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-sky-600">
                Theme Categories
              </p>
              <h3 className="mt-2 text-3xl font-black text-slate-900">
                Browse by what this age group loves most
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                We grouped the books into categories so parents can quickly find
                the right direction, like fairytales, milestone stories,
                confidence-building stories, or animal adventures.
              </p>
            </div>
            <div className="rounded-full bg-sky-100 px-4 py-2 text-sm font-bold text-sky-800">
              {categoryEntries.length} categories
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {categoryEntries.map(([categoryKey, category]) => {
              const isActive = categoryKey === selectedCategory;

              return (
                <button
                  key={categoryKey}
                  type="button"
                  onClick={() => setSelectedCategory(categoryKey)}
                  className={`rounded-full border px-4 py-3 text-left transition-all duration-300 ${
                    isActive
                      ? 'border-sky-400 bg-sky-600 text-white shadow-[0_18px_32px_rgba(37,99,235,0.24)]'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-300 hover:bg-white'
                  }`}
                >
                  <span className="text-sm font-bold">
                    {category.icon} {category.name}
                  </span>
                  <span
                    className={`ml-2 text-xs font-semibold ${
                      isActive ? 'text-sky-100' : 'text-slate-500'
                    }`}
                  >
                    {category.themes.length} theme
                    {category.themes.length === 1 ? '' : 's'}
                  </span>
                </button>
              );
            })}
          </div>

          {activeCategory ? (
            <div className="mt-6 rounded-[22px] border border-sky-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_100%)] px-5 py-4 text-sm leading-7 text-slate-700">
              <span className="font-black text-slate-900">
                {activeCategory.icon} {activeCategory.name}:
              </span>{' '}
              {activeCategory.description}
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {themesInSelectedCategory.map((theme) => {
          const isSelected = formData.theme === theme.value;
          const themeColors = getTheme(theme.value);

          return (
            <button
              key={theme.value}
              type="button"
              onClick={() => handleSelect(theme)}
              className={`group overflow-hidden rounded-[32px] bg-white text-left transition-all duration-300 transform ${
                isSelected
                  ? 'scale-[1.05] shadow-[0_32px_64px_rgba(15,23,42,0.25)] ring-4 ring-sky-300'
                  : 'shadow-[0_16px_40px_rgba(15,23,42,0.15)] hover:-translate-y-2 hover:shadow-[0_28px_60px_rgba(15,23,42,0.22)]'
              }`}
            >
              <div className="relative h-[340px] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                <img
                  src={getBookThemePreviewArt(theme.value, referenceImage)}
                  alt={theme.label}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.08]"
                />
                
                {/* Top-left theme label */}
                <div className="absolute left-4 top-4 rounded-full bg-white/95 backdrop-blur-sm px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-orange-700 shadow-lg">
                  Theme Preview
                </div>
                
                {/* Selection checkmark */}
                {isSelected ? (
                  <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-xl font-bold text-white shadow-xl ring-2 ring-white">
                    ✓
                  </div>
                ) : null}

                {/* Photo placeholder badge */}
                <div className="absolute bottom-4 left-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border-4 border-white shadow-xl">
                  <div className="text-3xl">📸</div>
                </div>
              </div>

              <div className="space-y-5 px-7 py-7">
                <div>
                  <h3 className="text-3xl font-black tracking-tight text-slate-900">
                    {theme.label}
                  </h3>
                  <p className="mt-3 text-sm font-bold text-sky-600 uppercase tracking-[0.15em]">
                    {theme.ageRange}
                  </p>
                </div>

                <p className="min-h-[60px] text-sm leading-7 text-slate-600 font-medium">
                  {theme.description}
                </p>

                <div
                  className="inline-flex rounded-full px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform duration-300 hover:scale-105"
                  style={{
                    background: themeColors.gradient,
                    boxShadow: `0 12px 32px ${themeColors.shadowColor}`,
                  }}
                >
                  {isSelected ? '✓ Selected Book' : 'Choose This Book'}
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
