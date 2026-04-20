'use client';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-6xl font-black mb-4">Kidz Story Magic</h1>
        <p className="text-2xl mb-8">Creating magical stories for children</p>
        <div className="flex gap-4 justify-center">
          <a href="/wizard" className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50">
            Create Story
          </a>
          <a href="/dashboard" className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-blue-600">
            My Stories
          </a>
        </div>
      </div>
    </div>
  );
}
