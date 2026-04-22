'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center">
        {/* Animated 404 */}
        <div className="mb-8 inline-block">
          <div className="text-9xl font-bold text-blue-600 animate-bounce">
            404
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist. But don't worry, we have plenty to explore!
        </p>

        {/* Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
          <Link
            href="/"
            className="p-4 bg-white rounded-lg hover:shadow-lg transition shadow transform hover:scale-105"
          >
            <div className="text-3xl mb-2">🏠</div>
            <p className="text-sm font-semibold text-gray-800">Home</p>
          </Link>

          <Link
            href="/dashboard"
            className="p-4 bg-white rounded-lg hover:shadow-lg transition shadow transform hover:scale-105"
          >
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm font-semibold text-gray-800">Dashboard</p>
          </Link>

          <Link
            href="/wizard"
            className="p-4 bg-white rounded-lg hover:shadow-lg transition shadow transform hover:scale-105"
          >
            <div className="text-3xl mb-2">✨</div>
            <p className="text-sm font-semibold text-gray-800">Create Story</p>
          </Link>

          <Link
            href="/profile"
            className="p-4 bg-white rounded-lg hover:shadow-lg transition shadow transform hover:scale-105"
          >
            <div className="text-3xl mb-2">👤</div>
            <p className="text-sm font-semibold text-gray-800">Profile</p>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={() => router.back()}
            className="px-8 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition-all"
          >
            ← Go Back
          </button>
          <Link
            href="/"
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
          >
            Go to Home →
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-gray-600 text-sm">
          Can't find what you're looking for?{' '}
          <a href="/dashboard" className="text-blue-600 hover:underline font-semibold">
            Contact Support
          </a>
        </p>
      </div>
    </main>
  );
}
