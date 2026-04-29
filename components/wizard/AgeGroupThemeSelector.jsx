'use client';

import { getAllAgeGroups } from '@/utils/themes';

/**
 * Age Group Selector Component
 * Displays all age groups with their categories and helps user select themes
 */
export default function AgeGroupThemeSelector({
  selectedAgeGroup,
  onAgeGroupSelect,
}) {
  const ageGroups = getAllAgeGroups();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Choose Your Age Group
        </h2>
        <p className="text-gray-600">
          We've organized themes by age for the best story experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ageGroups.map((group) => (
          <button
            key={group.key}
            onClick={() => onAgeGroupSelect(group.key)}
            className={`p-6 rounded-2xl transition-all transform hover:scale-105 ${
              selectedAgeGroup === group.key
                ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-xl ring-4 ring-purple-300'
                : 'bg-white border-2 border-gray-200 text-gray-800 hover:border-purple-400 shadow-md'
            }`}
          >
            <div className="text-5xl mb-3">{group.icon}</div>
            <h3 className="text-xl font-bold mb-1">{group.ageGroup}</h3>
            <p className={`text-sm mb-3 ${
              selectedAgeGroup === group.key ? 'text-purple-100' : 'text-gray-600'
            }`}>
              {group.ageRange}
            </p>
            <p className={`text-xs ${
              selectedAgeGroup === group.key ? 'text-purple-100' : 'text-gray-500'
            }`}>
              {group.categoryCount} categories
            </p>
          </button>
        ))}
      </div>

      {selectedAgeGroup && (
        <div className="mt-8 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
          <p className="text-green-900 text-center">
            <strong>✓ Age group selected!</strong> Now explore categories to find the perfect theme.
          </p>
        </div>
      )}
    </div>
  );
}
