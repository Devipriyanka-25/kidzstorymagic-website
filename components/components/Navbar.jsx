'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/utils/store';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.replace('/auth/login?next=%2Fdashboard');
  };

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 w-full bg-white shadow-lg z-50"
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="relative w-12 h-12 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Kidz Story Magic Logo"
              width={48}
              height={48}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Kidz Story Magic
            </h1>
            <p className="text-xs text-gray-600">Magical Stories for Kids</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {user ? (
            <>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link href="/wizard" className="text-gray-700 hover:text-blue-600 font-semibold transition-colors">
                  Create Story
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-semibold transition-colors">
                  My Stories
                </Link>
              </motion.div>
              <div className="flex items-center gap-4 border-l-2 border-gray-200 pl-8">
                <span className="text-sm text-gray-600">👋 {user.name}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-700 hover:text-red-600 font-semibold transition-colors"
                >
                  Sign Out
                </motion.button>
              </div>
            </>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 font-semibold transition-colors">
                  Sign In
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/auth/signup"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  Get Started Free
                </Link>
              </motion.div>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-2xl text-gray-700"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-white border-t border-gray-200"
        >
          <nav className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-4">
            {user ? (
              <>
                <Link href="/wizard" className="text-gray-700 hover:text-blue-600 font-semibold py-2">
                  Create Story
                </Link>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-semibold py-2">
                  My Stories
                </Link>
                <span className="text-sm text-gray-600 py-2">👋 {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-left text-gray-700 hover:text-red-600 font-semibold py-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 font-semibold py-2">
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-center"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
