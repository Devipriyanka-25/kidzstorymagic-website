'use client';

/**
 * Loading Skeleton Components for Better UX
 */

// Story Card Skeleton
export function StoryCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 animate-pulse">
      <div className="w-full h-48 bg-gray-300 rounded-lg mb-4"></div>
      <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded mb-4 w-1/2"></div>
      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-4/5"></div>
    </div>
  );
}

// Story Grid Skeleton
export function StoryGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <StoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-md animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          </div>
        ))}
      </div>

      {/* Stories Grid */}
      <StoryGridSkeleton />
    </div>
  );
}

// Step Wizard Skeleton
export function WizardStepSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
      <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center p-4 border border-gray-200 rounded-lg"
          >
            <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <div className="h-12 bg-gray-300 rounded w-1/3"></div>
        <div className="h-12 bg-gray-300 rounded flex-1"></div>
      </div>
    </div>
  );
}

// Story Preview Skeleton
export function StoryPreviewSkeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="h-12 bg-gray-300 rounded w-1/2 mb-8"></div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Page Display */}
        <div className="mb-8">
          <div className="w-full h-96 bg-gray-300 rounded-lg mb-4"></div>
          <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <div className="h-12 bg-gray-300 rounded w-1/4"></div>
          <div className="h-12 bg-gray-300 rounded w-1/4"></div>
          <div className="h-12 bg-gray-300 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
}

// Profile Skeleton
export function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      {/* Avatar and Name */}
      <div className="text-center mb-8">
        <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
      </div>

      {/* Info Sections */}
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-md">
            <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Image Upload Skeleton
export function ImageUploadSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-4">
        <div className="h-12 bg-gray-300 rounded w-1/3 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-full h-32 bg-gray-300 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}

// Login Form Skeleton
export function LoginFormSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full animate-pulse">
      <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto mb-6"></div>

      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="h-10 bg-gray-300 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
      </div>
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="w-full animate-pulse">
      <table className="w-full">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="p-4 text-left">
                <div className="h-4 bg-gray-300 rounded"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-t">
              {Array.from({ length: columns }).map((_, j) => (
                <td key={j} className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Circular Progress Skeleton
export function ProgressSkeleton() {
  return (
    <div className="flex items-center justify-center animate-pulse">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 bg-gray-300 rounded-full opacity-30"></div>
        <div className="absolute inset-1 bg-gray-300 rounded-full opacity-20"></div>
      </div>
    </div>
  );
}

// Card Skeleton (Generic)
export function CardSkeleton({ lines = 5 } = {}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="space-y-4">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 bg-gray-300 rounded ${i === 0 ? 'w-3/4' : 'w-full'}`}
          ></div>
        ))}
      </div>
    </div>
  );
}
