'use client';

/**
 * Simple logging hook for debugging
 */
export const useLogger = (moduleName) => {
  return {
    info: (message, data) => {
      console.log(`[${moduleName}] ℹ️  ${message}`, data || '');
    },
    success: (message, data) => {
      console.log(`[${moduleName}] ✅ ${message}`, data || '');
    },
    error: (message, data) => {
      console.error(`[${moduleName}] ❌ ${message}`, data || '');
    },
    warn: (message, data) => {
      console.warn(`[${moduleName}] ⚠️  ${message}`, data || '');
    }
  };
};
