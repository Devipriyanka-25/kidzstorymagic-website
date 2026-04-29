'use client';

import { useState } from 'react';
import {
  getCategoriesByAgeGroup,
  getThemesByCategory,
  getCategoryInfo,
  getBookTheme,
  getBookThemePreviewArt,
} from '@/utils/themes';

/**
 * Theme Category Selector Component
 * Displays themes organized by categories within an age group
 * Allows users to explore and select themes based on category
 */
export default function ThemeCategorySelector({ ageGroup, selectedTheme, onThemeSelect }) {
  const categories = getCategoriesByAgeGroup(ageGroup);
  const [selectedCategory, setSelectedCategory] = useState(
    Object.keys(categories)[0] || null
  );

  if (!categories || Object.keys(categories).length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No themes available for this age group</p>
      </div>
    );
  }

  const currentCategory = selectedCategory && categories[selectedCategory];
  const themesInCategory = selectedCategory
    ? getThemesByCategory(ageGroup, selectedCategory)
    : [];

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(categories).map(([categoryKey, categoryData]) => (
          <button
            key={categoryKey}
            onClick={() => setSelectedCategory(categoryKey)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === categoryKey
                ? 'bg-purple-600 text-white shadow-lg scale-105'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <span className="mr-2">{categoryData.icon}</span>
            {categoryData.name}
          </button>
        ))}
      </div>

      {/* Category Description */}
      {currentCategory && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>{currentCategory.name}:</strong> {currentCategory.description}
          </p>
        </div>
      )}

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themesInCategory.map((theme) => (
          <ThemeCard
            key={theme.value}
            theme={theme}
            isSelected={selectedTheme === theme.value}
            onSelect={onThemeSelect}
          />
        ))}
      </div>

      {themesInCategory.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No themes in this category yet</p>
        </div>
      )}
    </div>
  );
}

/**
 * Individual Theme Card Component
 */
function ThemeCard({ theme, isSelected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(theme.value)}
      className={`relative overflow-hidden rounded-xl transition-all transform hover:scale-105 ${
        isSelected ? 'ring-4 ring-purple-500 shadow-2xl' : 'shadow-lg hover:shadow-xl'
      }`}
      style={{ background: theme.cardGradient }}
    >
      {/* Preview SVG */}
      <div className="h-48 bg-white bg-opacity-90 flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 640 200"
          className="w-full h-full"
          dangerouslySetInnerHTML={{
            __html: getBookThemePreviewArt(theme.value)
              .split('data:image/svg+xml;charset=UTF-8,')[1]
              ? decodeURIComponent(
                  getBookThemePreviewArt(theme.value).split(
                    'data:image/svg+xml;charset=UTF-8,'
                  )[1]
                )
              : '',
          }}
        />
      </div>

      {/* Theme Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800">{theme.label}</h3>
        <p className="text-sm text-gray-600 mt-1">{theme.description}</p>
        <p className="text-xs text-gray-500 mt-2">
          <strong>Age Range:</strong> {theme.ageRangeShort}
        </p>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg">
          ✓
        </div>
      )}
    </button>
  );
}
