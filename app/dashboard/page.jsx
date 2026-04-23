'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/utils/store';
import { storyAPI, paymentAPI } from '@/utils/api';
import Link from 'next/link';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import StoriesGrid from '@/components/dashboard/StoriesGrid';
import DraftStories from '@/components/dashboard/DraftStories';
import SupportModal from '@/components/dashboard/SupportModal';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitializing } = useAuthStore();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'drafts', 'published'
  const [stories, setStories] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSupport, setShowSupport] = useState(false);

  // Check authentication and redirect if needed
  useEffect(() => {
    // Wait for auth initialization to complete
    if (isInitializing) {
      console.log('[DASHBOARD] Still initializing auth...');
      return;
    }

    if (!isAuthenticated || !user) {
      console.log('[DASHBOARD] User not authenticated, redirecting to login');
      router.push('/auth/login');
    }
  }, [isInitializing, isAuthenticated, user, router]);

  // Fetch stories on mount
  useEffect(() => {
    if (!user || !isAuthenticated) return;
    fetchStories();
  }, [user, isAuthenticated]);

  // Fetch all stories and drafts
  const fetchStories = async () => {
    try {
      setLoading(true);
      setError('');
      
      const storiesResponse = await storyAPI.getProjects();
      setStories(storiesResponse.data.stories || []);

      // Fetch drafts if available
      if (storyAPI.getDraftStories) {
        try {
          const draftsResponse = await storyAPI.getDraftStories();
          console.log('[DASHBOARD] Drafts response:', draftsResponse);
          
          // Handle different response structures
          const draftData = draftsResponse.data?.drafts || 
                           draftsResponse.drafts || 
                           draftsResponse.data || 
                           [];
          
          setDrafts(Array.isArray(draftData) ? draftData : []);
          console.log('[DASHBOARD] Drafts set:', draftData);
        } catch (e) {
          console.error('[DASHBOARD] Error fetching drafts:', e);
          // Drafts feature might not be available yet
          setDrafts([]);
        }
      }
    } catch (err) {
      console.error('Error fetching stories:', err);
      setError(err.message || 'Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  // Filter stories based on search and theme
  const filteredStories = stories
    .filter(story => story.status === 'published')
    .filter(story => {
      const matchesSearch = 
        story.child_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.theme?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTheme = selectedTheme === 'all' || story.theme === selectedTheme;
      return matchesSearch && matchesTheme;
    });

  const filteredDrafts = drafts
    .filter(draft => {
      const matchesSearch = 
        draft.child_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        draft.theme?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTheme = selectedTheme === 'all' || draft.theme === selectedTheme;
      return matchesSearch && matchesTheme;
    });

  // Get unique themes
  const allThemes = new Set();
  stories.forEach(s => s.theme && allThemes.add(s.theme));
  drafts.forEach(d => d.theme && allThemes.add(d.theme));

  // Auth check
  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Please sign in to view your dashboard
          </h1>
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex">
      {/* Sidebar Navigation */}
      <DashboardSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
      />

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              📚 My Stories
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome back, {user.name}! Create, manage, and continue your personalized stories.
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-6 space-y-4 md:flex md:gap-4 md:items-center">
            <input
              type="text"
              placeholder="Search by child name or theme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
            />

            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none bg-white"
            >
              <option value="all">All Themes</option>
              {Array.from(allThemes).map(theme => (
                <option key={theme} value={theme}>
                  {theme?.charAt(0).toUpperCase() + theme?.slice(1)}
                </option>
              ))}
            </select>

            <Link
              href="/wizard"
              className="whitespace-nowrap px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 text-center"
            >
              + Create Story
            </Link>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-100 border-2 border-red-300 text-red-800 px-6 py-4 rounded-lg">
              <p className="font-semibold">⚠️ Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📖</div>
              <p className="text-gray-600 text-lg">Loading your stories...</p>
            </div>
          ) : (
            <>
              {/* Drafts Tab */}
              {activeTab === 'drafts' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span>📝</span>
                    Draft Stories {filteredDrafts.length > 0 && <span className="text-lg text-yellow-600">({filteredDrafts.length})</span>}
                  </h2>
                  {filteredDrafts.length > 0 ? (
                    <DraftStories 
                      drafts={filteredDrafts}
                      onContinue={(draft) => router.push(`/wizard?draftId=${draft.id}`)}
                      onRefresh={fetchStories}
                    />
                  ) : (
                    <div className="text-center py-12 bg-white rounded-lg border-2 border-gray-200">
                      <div className="text-5xl mb-4">📝</div>
                      <p className="text-gray-600 text-lg mb-4 font-semibold">No draft stories yet</p>
                      <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                        When you create a story in the wizard, it will automatically be saved as a draft here. You can then continue editing, regenerate the story, or checkout to purchase the final version.
                      </p>
                      <Link
                        href="/wizard"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                      >
                        Create Your First Story
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Published Tab */}
              {activeTab === 'published' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span>✨</span>
                    Published Stories
                  </h2>
                  {filteredStories.length > 0 ? (
                    <StoriesGrid 
                      stories={filteredStories}
                      onRefresh={fetchStories}
                    />
                  ) : (
                    <div className="text-center py-12 bg-white rounded-lg border-2 border-gray-200">
                      <div className="text-5xl mb-4">📚</div>
                      <p className="text-gray-600 text-lg mb-4">No published stories yet</p>
                      <Link
                        href="/wizard"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                      >
                        Create Your First Story
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* All Stories Tab */}
              {activeTab === 'all' && (
                <div>
                  {/* Drafts Section */}
                  {filteredDrafts.length > 0 && (
                    <div className="mb-12">
                      <div className="flex items-center gap-2 mb-6">
                        <span className="text-3xl">📝</span>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Draft Stories ({filteredDrafts.length})
                        </h2>
                      </div>
                      <DraftStories 
                        drafts={filteredDrafts}
                        onContinue={(draft) => router.push(`/wizard?draftId=${draft.id}`)}
                        onRefresh={fetchStories}
                      />
                    </div>
                  )}

                  {/* Published Stories Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-3xl">✨</span>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Published Stories ({filteredStories.length})
                      </h2>
                    </div>
                    {filteredStories.length > 0 ? (
                      <StoriesGrid 
                        stories={filteredStories}
                        onRefresh={fetchStories}
                      />
                    ) : (
                      <div className="text-center py-12 bg-white rounded-lg border-2 border-gray-200">
                        <div className="text-5xl mb-4">📚</div>
                        <p className="text-gray-600 text-lg mb-4">No published stories yet</p>
                        <Link
                          href="/wizard"
                          className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                        >
                          Create Your First Story
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Floating Help Button */}
      <button
        onClick={() => setShowSupport(true)}
        className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-110 active:scale-95 flex items-center gap-2 group"
        title="Need help?"
      >
        <span className="text-2xl group-hover:animate-bounce">💬</span>
        <span className="hidden sm:inline">Need Help?</span>
      </button>

      {/* Support Modal */}
      <SupportModal isOpen={showSupport} onClose={() => setShowSupport(false)} />
    </div>
  );
}
