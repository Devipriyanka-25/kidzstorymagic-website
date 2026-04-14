'use client';

import { useAuthStore } from '@/utils/store';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          ✨ Kidz Story Magic
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {user ? (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                My Stories
              </Link>
              <Link href="/wizard" className="text-gray-700 hover:text-blue-600">
                Create Story
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Hello, {user.name}!
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-700 hover:text-blue-600">
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-700"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-50 border-t border-gray-200">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                  My Stories
                </Link>
                <Link href="/wizard" className="text-gray-700 hover:text-blue-600">
                  Create Story
                </Link>
                <span className="text-sm text-gray-600">
                  {user.name}
                </span>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="text-left text-gray-700 hover:text-red-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-700 hover:text-blue-600">
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-center"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
