'use client';

import React, { useEffect, Suspense } from 'react';
import { useAuthStore } from '@/utils/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GlobalErrorBoundary from '@/components/GlobalErrorBoundary';

/**
 * Providers Component
 * Wraps the entire application with necessary providers and contexts
 * - Authentication initialization
 * - Toast notifications
 * - Global error boundary
 */
export function Providers({ children }) {
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { initAuth } = useAuthStore.getState();
        await initAuth();
      } catch (error) {
        console.error('[PROVIDERS] Auth initialization error:', error);
        // Don't block app initialization on auth errors
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      initializeAuth();
    }
  }, []);

  return (
    <GlobalErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        {children}
        
        {/* Toast notification container */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Suspense>
    </GlobalErrorBoundary>
  );
}

