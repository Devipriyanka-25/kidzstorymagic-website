'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/utils/store';

export default function DashboardSidebar({ activeTab, setActiveTab, user }) {
  const router = useRouter();
  const { logout: authLogout } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const tabs = [
    { id: 'all', label: 'All Stories', icon: '📚' },
    { id: 'published', label: 'Published', icon: '✨' },
    { id: 'drafts', label: 'Drafts', icon: '📝' },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileOpen(false);
  };

  const handleLogout = async () => {
    try {
      // Clear auth state
      authLogout();
      // Redirect away from any mounted wizard state and return to dashboard after login.
      router.replace('/auth/login?next=%2Fdashboard');
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if error
      router.replace('/auth/login?next=%2Fdashboard');
    }
  };

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-lg shadow-lg"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative z-40 left-0 top-0 h-screen w-72 bg-gradient-to-b from-blue-900 via-blue-800 to-purple-900 text-white p-6 overflow-y-auto transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo/Branding */}
        <div className="mb-10">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold hover:opacity-80 transition">
            <span className="text-3xl">📚</span>
            <span>Kidz Story</span>
          </Link>
          <p className="text-blue-200 text-sm mt-2">Magic Storybooks</p>
        </div>

        {/* User Profile */}
        {user && (
          <div className="mb-8 p-4 bg-white/10 rounded-lg border border-blue-400/30">
            <p className="text-blue-100 text-sm">Logged in as</p>
            <p className="text-white font-bold text-lg truncate">{user.name || user.email}</p>
            <p className="text-blue-200 text-sm truncate">{user.email}</p>
          </div>
        )}

        <hr className="border-blue-400/30 mb-6" />

        {/* Navigation Tabs */}
        <nav className="space-y-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${
                activeTab === tab.id
                  ? 'bg-white/20 border-2 border-white text-white'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <hr className="border-blue-400/30 mb-6" />

        {/* Quick Actions */}
        <div className="space-y-3 mb-8">
          <Link
            href="/wizard"
            className="block w-full text-center px-4 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-lg hover:from-green-500 hover:to-emerald-600 transition-all transform hover:scale-105"
          >
            ✏️ Write New Story
          </Link>
          <Link
            href="/settings"
            className="block w-full text-center px-4 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 border border-blue-400/50 transition-all"
          >
            ⚙️ Settings
          </Link>
        </div>

        <hr className="border-blue-400/30 mb-6" />

        {/* Footer */}
        <div className="mt-auto space-y-4">
          {/* Help Link */}
          <Link
            href="/help"
            className="block text-center text-blue-200 hover:text-white font-semibold text-sm transition"
          >
            💬 Need Help?
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full text-center px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-100 font-semibold rounded-lg border border-red-400/50 transition-all"
          >
            🚪 Logout
          </button>

          {/* Version Info */}
          <p className="text-center text-blue-300 text-xs opacity-70 mt-4">
            v1.0.0 • Kidz Story Magic
          </p>
        </div>
      </div>
    </>
  );
}
