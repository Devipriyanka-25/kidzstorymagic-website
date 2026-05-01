'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FreePreview from '@/components/preview/FreePreview';

export default function MagicPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [story, setStory] = useState(null);
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      if (!token) {
        setError('Preview link is invalid.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `/api/story/preview?token=${encodeURIComponent(token)}`,
          { cache: 'no-store' }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || 'Failed to load your secure preview link.'
          );
        }

        if (!cancelled) {
          setStory(data.story);
          setExpiresAt(data.magicLink?.expiresAt || '');
        }
      } catch (previewError) {
        if (!cancelled) {
          setError(previewError.message || 'Failed to load preview.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleCheckout = () => {
    if (!story?.storyId) {
      router.push('/dashboard');
      return;
    }

    router.push(
      `/wizard?step=6&resume=preview-email&projectId=${encodeURIComponent(
        story.storyId
      )}`
    );
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#eef2ff_0%,#fff7ed_100%)] px-4">
        <div className="max-w-md rounded-2xl bg-white px-8 py-10 text-center shadow-xl">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue-700">
            Kidz Story Magic
          </p>
          <h1 className="mt-4 text-3xl font-black text-slate-900">
            Opening your preview
          </h1>
          <p className="mt-3 text-slate-600">
            We are loading the saved story data from your secure link.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fff1f2_0%,#fff7ed_100%)] px-4">
        <div className="max-w-md rounded-2xl bg-white px-8 py-10 text-center shadow-xl">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-red-700">
            Preview Link
          </p>
          <h1 className="mt-4 text-3xl font-black text-slate-900">
            Unable to open preview
          </h1>
          <p className="mt-3 text-slate-700">{error}</p>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="mt-6 rounded-full bg-slate-900 px-6 py-3 font-bold text-white transition hover:bg-slate-700"
          >
            Go to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef2ff_0%,#fff7ed_100%)] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue-700">
            Secure Preview
          </p>
          <h1 className="mt-3 text-4xl font-black text-slate-900">
            {story?.title || 'Your Story Preview'}
          </h1>
          {expiresAt ? (
            <p className="mt-2 text-sm text-slate-600">
              This link expires at {new Date(expiresAt).toLocaleString()}.
            </p>
          ) : null}
        </div>

        <FreePreview
          pages={story?.pages || []}
          totalPages={story?.totalPages || story?.pageCount}
          childName={story?.childName || 'your child'}
          priceLabel="Continue to Checkout"
          onUnlock={handleCheckout}
        />
      </div>
    </main>
  );
}
