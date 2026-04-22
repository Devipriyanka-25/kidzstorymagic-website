'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTheme } from '@/utils/themes';
import { storyAPI } from '@/utils/api';

export default function DraftStories({ drafts, onContinue, onRefresh }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(null);
  const [resuming, setResuming] = useState(null);

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
    return 'from-yellow-400 to-orange-500';
  };

  // Calculate progress percentage
  const getProgressPercentage = (draft) => {
    const steps = 6; // Total wizard steps
    const currentStep = draft.current_step || 1;
    return Math.round((currentStep / steps) * 100);
  };

  // Format time since last edit
  const getTimeAgo = (date) => {
    if (!date) return 'Just now';
    
    const now = new Date();
    const edited = new Date(date);
    const diffMs = now - edited;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return edited.toLocaleDateString();
  };

  // Handle resume draft
  const handleResume = async (draft) => {
    try {
      setResuming(draft.id);
      // Navigate to wizard with draft ID
      router.push(`/wizard?draftId=${draft.id}`);
    } catch (error) {
      console.error('Error resuming draft:', error);
      alert('Failed to resume draft. Please try again.');
    } finally {
      setResuming(null);
    }
  };

  // Handle draft deletion
  const handleDelete = async (draftId) => {
    if (!window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(draftId);
      await storyAPI.deleteDraft(draftId);
      onRefresh();
    } catch (error) {
      console.error('Error deleting draft:', error);
      alert('Failed to delete draft. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {drafts.map((draft) => {
        const progress = getProgressPercentage(draft);
        const timeAgo = getTimeAgo(draft.updated_at);

        return (
          <div
            key={draft.id}
            className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            {/* Thumbnail Container */}
            <div
              className={`bg-gradient-to-br ${getThemeGradient(draft.theme)} h-48 flex items-center justify-center relative overflow-hidden`}
            >
              {/* Decorative Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%, rgba(255,255,255,0.3), transparent)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%, rgba(255,255,255,0.2), transparent)]" />
              </div>

              {/* Image or Placeholder */}
              {draft.preview_url ? (
                <img
                  src={draft.preview_url}
                  alt={draft.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center z-10">
                  <p className="text-6xl mb-2">📝</p>
                  <p className="text-white font-bold text-sm">In Progress</p>
                </div>
              )}

            {/* Draft Badge */}
              <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse capitalize">
                <span>✏️</span>
                <span>{draft.status || 'draft'}</span>
              </div>

              {/* Progress Bar Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/30 h-1">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Content Section */}
            <div className="p-5">
              {/* Title */}
              <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition">
                {draft.title || `Story for ${draft.child_name}`}
              </h3>

              {/* Last Edited Info */}
              <p className="text-xs text-gray-500 mb-3">
                Last edited: <span className="font-semibold text-gray-700">{timeAgo}</span>
              </p>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                {/* Child Name */}
                <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                  <p className="text-gray-500 text-xs font-semibold">Child</p>
                  <p className="text-gray-900 font-bold truncate">{draft.child_name}</p>
                </div>

                {/* Theme */}
                <div className="bg-purple-50 rounded-lg p-2 border border-purple-200">
                  <p className="text-gray-500 text-xs font-semibold">Theme</p>
                  <p className="text-gray-900 font-bold truncate text-xs">
                    {formatThemeName(draft.theme)}
                  </p>
                </div>

                {/* Progress */}
                <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                  <p className="text-gray-500 text-xs font-semibold">Progress</p>
                  <p className="text-gray-900 font-bold">{progress}%</p>
                </div>

                {/* Step Info */}
                <div className="bg-indigo-50 rounded-lg p-2 border border-indigo-200">
                  <p className="text-gray-500 text-xs font-semibold">Step</p>
                  <p className="text-gray-900 font-bold">{draft.current_step || 1}/6</p>
                </div>
              </div>

              {/* Progress Visualization */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-gray-600">Progress</span>
                  <span className="text-xs font-bold text-orange-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Auto-save Indicator */}
              <div className="mb-4 flex items-center gap-2 text-xs text-green-600 font-semibold">
                <span className="inline-block w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                Auto-saving enabled
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {/* Resume Button */}
                <button
                  onClick={() => handleResume(draft)}
                  disabled={resuming === draft.id}
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                >
                  <span>{resuming === draft.id ? '⏳' : '▶️'}</span>
                  <span>{resuming === draft.id ? 'Loading...' : 'Resume'}</span>
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(draft.id)}
                  disabled={deleting === draft.id}
                  className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete draft"
                >
                  {deleting === draft.id ? '⏳' : '🗑️'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
