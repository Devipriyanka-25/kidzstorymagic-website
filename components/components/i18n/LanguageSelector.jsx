/**
 * frontend/components/i18n/LanguageSelector.jsx
 *
 * Language selector dropdown component
 * Displays all supported languages with native labels
 * Integrated with useLanguage hook
 */

'use client';

import React, { useEffect, useRef } from 'react';
import useLanguage from '@/hooks/useLanguage';
import { SUPPORTED_LANGUAGES } from '@/constants/languages';
import { getFontFamily } from '@/utils/i18n/unicodeUtils';

const LanguageSelector = ({ 
  className = '', 
  showLabel = true,
  size = 'md',
  onLanguageChange = null,
}) => {
  const { currentLanguage, changeLanguage, translate, isLoading } = useLanguage();
  const dropdownRef = useRef(null);

  /**
   * Handle language selection
   */
  const handleLanguageSelect = (e) => {
    const newLanguage = e.target.value;
    changeLanguage(newLanguage);
    
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };

  /**
   * Size classes
   */
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <label 
          htmlFor="language-select"
          className="font-medium text-gray-700 whitespace-nowrap"
        >
          {translate('storyLanguage')}:
        </label>
      )}
      
      <div className="relative">
        <select
          id="language-select"
          ref={dropdownRef}
          value={currentLanguage}
          onChange={handleLanguageSelect}
          aria-label="Select story language"
          style={{
            fontFamily: getFontFamily(currentLanguage),
          }}
          className={`
            appearance-none
            bg-white
            border border-gray-300
            rounded-lg
            font-medium
            text-gray-900
            cursor-pointer
            transition-colors
            duration-200
            hover:border-purple-400
            focus:outline-none
            focus:ring-2
            focus:ring-purple-500
            focus:border-transparent
            ${sizeClasses[size]}
            ${className}
          `}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option 
              key={lang.code} 
              value={lang.code}
              style={{
                fontFamily: getFontFamily(lang.code),
              }}
            >
              {lang.label} / {lang.nativeLabel}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow icon */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <svg
            className="w-5 h-5 text-gray-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* Language badge showing current language native label */}
      <div 
        className="hidden sm:flex items-center gap-2 ml-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-200"
        style={{
          fontFamily: getFontFamily(currentLanguage),
        }}
      >
        <span className="text-sm font-medium text-purple-900">
          {SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.nativeLabel}
        </span>
      </div>
    </div>
  );
};

/**
 * Language Selector with Popover - Alternative compact version
 * Useful for header/navigation
 */
export const LanguageSelectorCompact = ({ className = '' }) => {
  const { currentLanguage, changeLanguage, isLoading } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (isLoading) {
    return (
      <button
        disabled
        className="w-12 h-10 bg-gray-200 rounded animate-pulse"
      />
    );
  }

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          fontFamily: getFontFamily(currentLanguage),
        }}
        className={`
          flex items-center gap-2
          px-3 py-2
          rounded-lg
          font-medium
          transition-colors
          duration-200
          ${isOpen 
            ? 'bg-purple-500 text-white' 
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }
        `}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span className="text-sm">{currentLang?.nativeLabel}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute
            top-full
            right-0
            mt-2
            bg-white
            border border-gray-200
            rounded-lg
            shadow-lg
            z-50
            min-w-max
            overflow-hidden
          `}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code);
                setIsOpen(false);
              }}
              style={{
                fontFamily: getFontFamily(lang.code),
              }}
              className={`
                w-full
                text-left
                px-4
                py-2
                transition-colors
                duration-150
                ${currentLanguage === lang.code
                  ? 'bg-purple-500 text-white font-medium'
                  : 'text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              <div className="flex flex-col">
                <span className="font-medium">{lang.label}</span>
                <span className="text-sm opacity-75">{lang.nativeLabel}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
