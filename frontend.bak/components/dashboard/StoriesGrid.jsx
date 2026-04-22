'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getTheme } from '@/utils/themes';
import { storyAPI } from '@/utils/api';

export default function StoriesGrid({ stories, onRefresh }) {
  const [deleting, setDeleting] = useState(null);

  // Helper to format theme name
  const formatThemeName = (theme) => {
    return theme?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  };

  // Helper to get theme color gradient
  const getThemeGradient = (theme) => {
    const themeData = getTheme(theme);
    if (themeData?.gradient) {
      return themeData.gradient;
    }
    // Default gradient if theme not found
    return 'from-blue-400 to-purple-500';
  };

  // Handle story deletion
  const handleDelete = async (storyId) => {
    if (!window.confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(storyId);
      await storyAPI.deleteProject(storyId);
      onRefresh();
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete story. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map((story) => (
        <div
          key={story.id}
          className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
        >
          {/* Thumbnail Container */}
          <div
            className={`bg-gradient-to-br ${getThemeGradient(story.theme)} h-48 flex items-center justify-center relative overflow-hidden`}
          >
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%, rgba(255,255,255,0.3), transparent)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%, rgba(255,255,255,0.2), transparent)]" />
            </div>

            {/* Image or Placeholder */}
            {story.preview_url ? (
              <img
                src={story.preview_url}
                alt={story.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center z-10">
                <p className="text-6xl mb-2">📖</p>
                <p className="text-white font-bold text-sm">Story Preview</p>
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
              <span>✓</span>
              <span>Published</span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-5">
            {/* Title */}
            <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition">
              {story.title || `Story for ${story.child_name}`}
            </h3>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              {/* Child Name */}
              <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                <p className="text-gray-500 text-xs font-semibold">Child</p>
                <p className="text-gray-900 font-bold truncate">{story.child_name}</p>
              </div>

              {/* Theme */}
              <div className="bg-purple-50 rounded-lg p-2 border border-purple-200">
                <p className="text-gray-500 text-xs font-semibold">Theme</p>
                <p className="text-gray-900 font-bold truncate text-xs">
                  {formatThemeName(story.theme)}
                </p>
              </div>

              {/* Page Count */}
              <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                <p className="text-gray-500 text-xs font-semibold">Pages</p>
                <p className="text-gray-900 font-bold">{story.page_count || 20}</p>
              </div>

              {/* Created Date */}
              <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
                <p className="text-gray-500 text-xs font-semibold">Created</p>
                <p className="text-gray-900 font-bold text-xs">
                  {story.created_at
                    ? new Date(story.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>

            {/* Description (if available) */}
            {story.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {story.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* View/Download Button */}
              {story.published_pdf_url ? (
                <a
                  href={story.published_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 text-center flex items-center justify-center gap-1"
                >
                  <span>📥</span>
                  <span>Download</span>
                </a>
              ) : (
                <Link
                  href={`/story/${story.id}`}
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 text-center flex items-center justify-center gap-1"
                >
                  <span>👁️</span>
                  <span>View</span>
                </Link>
              )}

              {/* Edit Button */}
              <button
                className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold rounded-lg transition-all text-sm"
                title="Edit story"
              >
                ✏️
              </button>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(story.id)}
                disabled={deleting === story.id}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete story"
              >
                {deleting === story.id ? '⏳' : '🗑️'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
