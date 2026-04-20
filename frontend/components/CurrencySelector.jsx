'use client';

import { useState } from 'react';
import { useCurrencyStore } from '@/utils/store';
import { useCurrencyConversion } from '@/hooks/useCurrencyDetection';
import { motion } from 'framer-motion';

/**
 * Currency Selector Component
 * Allows users to select their preferred currency
 */
export default function CurrencySelector() {
  const { selectedCurrency, supportedCurrencies, setCurrency } = useCurrencyStore();
  const { formatCurrency } = useCurrencyConversion();
  const [isOpen, setIsOpen] = useState(false);

  const currencyInfo = {
    USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    CAD: { name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
    GBP: { name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺' },
    AUD: { name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
    INR: { name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' }
  };

  const handleSelectCurrency = (currency) => {
    setCurrency(currency);
    localStorage.setItem('userCurrency', currency);
    setIsOpen(false);
  };

  const currentInfo = currencyInfo[selectedCurrency] || currencyInfo.USD;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:border-blue-500 bg-white hover:bg-blue-50 transition-all"
      >
        <span className="text-xl">{currentInfo.flag}</span>
        <span className="font-semibold text-gray-700">{selectedCurrency}</span>
        <span className="text-lg text-gray-600">▼</span>
      </motion.button>

      {/* Dropdown Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-200"
        >
          <div className="p-2">
            {supportedCurrencies.map((currency) => {
              const info = currencyInfo[currency];
              const isSelected = currency === selectedCurrency;

              return (
                <motion.button
                  key={currency}
                  whileHover={{ x: 4 }}
                  onClick={() => handleSelectCurrency(currency)}
                  className={`w-full text-left px-4 py-3 rounded-md flex items-center gap-3 transition-all ${
                    isSelected
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="text-2xl">{info.flag}</span>
                  <div className="flex-1">
                    <div className="font-semibold">{currency}</div>
                    <div className="text-xs text-gray-600">{info.name}</div>
                  </div>
                  {isSelected && (
                    <span className="text-lg">✓</span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Footer with info */}
          <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
            <p className="text-xs text-gray-600">
              💱 Prices update automatically
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
