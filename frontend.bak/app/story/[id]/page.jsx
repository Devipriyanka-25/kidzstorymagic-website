'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { storyAPI } from '@/utils/api';
import Link from 'next/link';

export default function StoryDetailPage() {
  const params = useParams();
  const storyId = params.id;
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await storyAPI.getStory(storyId);
        setStory(response.data.story);
      } catch (err) {
        setError(err.message || 'Failed to load story');
      } finally {
        setLoading(false);
      }
    };

    if (storyId) {
      fetchStory();
    }
  }, [storyId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">Loading story...</p>
        </div>
      </main>
    );
  }

  if (error || !story) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-600 mb-6">{error || 'Story not found'}</p>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:underline font-semibold"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Link
          href="/dashboard"
          className="text-blue-600 hover:underline mb-6 inline-block"
        >
          ← Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {story.title}
            </h1>
            <div className="flex gap-4 text-gray-600 text-sm">
              <span>👶 {story.child_name}</span>
              <span>📚 {story.theme}</span>
              <span>📄 {story.page_count} pages</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Story Details</h3>
              <div className="space-y-3">
                <p>
                  <strong>Child Name:</strong> {story.child_name}
                </p>
                <p>
                  <strong>Child Gender:</strong> {story.child_gender}
                </p>
                <p>
                  <strong>Age Group:</strong> {story.age_group}
                </p>
                <p>
                  <strong>Theme:</strong>{' '}
                  <span className="capitalize">{story.theme}</span>
                </p>
                <p>
                  <strong>Pages:</strong> {story.page_count}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">Status</h3>
              <div className="space-y-3">
                <p>
                  <strong>Status:</strong>{' '}
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      story.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {story.status}
                  </span>
                </p>
                <p>
                  <strong>Created:</strong>{' '}
                  {new Date(story.created_at).toLocaleDateString()}
                </p>
                {story.published_pdf_url && (
                  <p>
                    <strong>PDF Ready:</strong> ✅
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Content Preview */}
          {story.content && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-4">Story Preview</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {story.content.substring(0, 500)}...
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            {story.published_pdf_url && (
              <a
                href={story.published_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                📥 Download PDF
              </a>
            )}
            <a
              href={`mailto:?subject=Check out ${story.title}&body=I created a personalized storybook: ${story.published_pdf_url || ''}`}
              className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50"
            >
              📧 Share
            </a>
            <Link
              href="/wizard"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
            >
              ✨ Create Another
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
