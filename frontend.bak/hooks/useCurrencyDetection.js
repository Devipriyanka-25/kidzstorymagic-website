'use client';

import { useEffect } from 'react';
import { useCurrencyStore } from '@/utils/store';
import { useLogger } from './useLogger';

/**
 * Hook to auto-detect and manage user's currency based on geolocation
 */
export const useCurrencyDetection = () => {
  const { selectedCurrency, setCurrency, setExchangeRates } = useCurrencyStore();
  const log = useLogger('CurrencyDetection');

  useEffect(() => {
    const detectAndSetCurrency = async () => {
      // Check if currency preference is already stored
      if (typeof window === 'undefined') return;

      const storedCurrency = localStorage.getItem('userCurrency');
      if (storedCurrency) {
        log.info('Using stored currency preference:', storedCurrency);
        setCurrency(storedCurrency);
        return;
      }

      // Detect currency by IP
      try {
        log.info('Detecting currency from IP geolocation...');
        const response = await fetch('/api/currency/detect', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          throw new Error(`Detection failed with status ${response.status}`);
        }

        const data = await response.json();
        const detectedCurrency = data.currency || 'USD';

        log.success('Currency detected:', detectedCurrency);
        setCurrency(detectedCurrency);

        // Store preference
        localStorage.setItem('userCurrency', detectedCurrency);

        // Fetch exchange rates
        await fetchExchangeRates(detectedCurrency);
      } catch (err) {
        log.error('Currency detection failed:', err.message);
        // Fallback to USD
        setCurrency('USD');
        localStorage.setItem('userCurrency', 'USD');
        await fetchExchangeRates('USD');
      }
    };

    detectAndSetCurrency();
  }, [setCurrency, setExchangeRates, log]);

  const fetchExchangeRates = async (fromCurrency = 'USD') => {
    try {
      log.info('Fetching exchange rates from:', fromCurrency);
      const response = await fetch(`/api/currency/rates?from=${fromCurrency}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Exchange rate fetch failed with status ${response.status}`);
      }

      const data = await response.json();
      log.success('Exchange rates fetched');
      
      // Store rates in the store
      const ratesObject = {
        [fromCurrency]: 1,
        ...data.rates
      };
      setExchangeRates(ratesObject);

      return ratesObject;
    } catch (err) {
      log.error('Failed to fetch exchange rates:', err.message);
      // Use default rates
      setExchangeRates({
        USD: 1.0,
        CAD: 1.36,
        GBP: 0.79,
        EUR: 0.92,
        AUD: 1.52,
        INR: 83.12
      });
    }
  };

  const changeCurrency = async (newCurrency) => {
    log.info('Changing currency to:', newCurrency);
    setCurrency(newCurrency);
    localStorage.setItem('userCurrency', newCurrency);
    await fetchExchangeRates(newCurrency);
  };

  return {
    currentCurrency: selectedCurrency,
    changeCurrency,
    fetchExchangeRates
  };
};

/**
 * Hook for currency conversion display
 */
export const useCurrencyConversion = () => {
  const { selectedCurrency, exchangeRates } = useCurrencyStore();

  const convertPrice = (basePrice, fromCurrency = 'USD') => {
    if (selectedCurrency === fromCurrency) {
      return basePrice;
    }

    const rate = exchangeRates[selectedCurrency] || 1;
    return (basePrice * rate).toFixed(2);
  };

  const formatCurrency = (amount) => {
    const symbols = {
      USD: '$',
      CAD: 'C$',
      GBP: '£',
      EUR: '€',
      AUD: 'A$',
      INR: '₹'
    };

    const symbol = symbols[selectedCurrency] || '$';
    return `${symbol}${Number(amount).toFixed(2)}`;
  };

  const getExchangeRateInfo = (fromCurrency = 'USD') => {
    if (!exchangeRates || !exchangeRates[selectedCurrency]) {
      return null;
    }

    return {
      from: fromCurrency,
      to: selectedCurrency,
      rate: exchangeRates[selectedCurrency],
      display: `1 ${fromCurrency} = ${exchangeRates[selectedCurrency].toFixed(4)} ${selectedCurrency}`
    };
  };

  return {
    convertPrice,
    formatCurrency,
    getExchangeRateInfo,
    currentCurrency: selectedCurrency,
    exchangeRates
  };
};
