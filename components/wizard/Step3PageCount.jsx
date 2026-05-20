// Wizard Step Component 3: Page Count Selection
'use client';

import React from 'react';
import LanguageSelector from '@/components/i18n/LanguageSelector';
import { useLanguage } from '@/hooks/useLanguage';
import { useWizardStore } from '@/utils/store';
import {
  COUNTRY_CURRENCY_OPTIONS,
  CURRENCY_SYMBOLS,
  getConvertedStoryPrice,
  getCountryCurrencyOption,
  getCountryOptionByCurrency,
} from '@/utils/pricing';
import { useCurrencyStore } from '@/utils/store';

const PAGE_OPTIONS = [
  { value: 10, label: '10 Pages', description: 'Quick story' },
  { value: 20, label: '20 Pages', description: 'Standard story' },
  { value: 30, label: '30 Pages', description: 'Extended story' }
];

export default function Step3PageCount() {
  const { formData, updateFormData, nextStep, prevStep } = useWizardStore();
  const { changeLanguage } = useLanguage();
  const {
    selectedCountry,
    selectedCurrency,
    exchangeRates,
    setCountry,
    setCurrency,
  } = useCurrencyStore();

  const { amount: convertedPrice, currency } = getConvertedStoryPrice(
    formData.pageCount,
    selectedCurrency,
    exchangeRates
  );
  const currentCountryOption =
    getCountryCurrencyOption(selectedCountry) ||
    getCountryOptionByCurrency(currency) ||
    COUNTRY_CURRENCY_OPTIONS[0];

  const formatPrice = (pageCount) => {
    const { amount } = getConvertedStoryPrice(
      pageCount,
      selectedCurrency,
      exchangeRates
    );

    return `${CURRENCY_SYMBOLS[currency] || ''}${amount.toFixed(2)}`;
  };

  const handleSelect = (pageCount) => {
    updateFormData('pageCount', pageCount);
  };

  const handleLanguageChange = (nextLanguage) => {
    updateFormData('storyLanguage', nextLanguage);
    changeLanguage(nextLanguage);
  };

  const handleCountryChange = (event) => {
    const nextCountry = String(event.target.value || '');
    const nextOption = getCountryCurrencyOption(nextCountry);

    if (!nextOption) {
      return;
    }

    setCountry(nextOption.country);
    setCurrency(nextOption.currency);
    updateFormData('selectedCountry', nextOption.country);
    updateFormData('selectedCurrency', nextOption.currency);
  };

  const handleContinue = () => {
    nextStep();
  };

  return (
    <div className="step-container w-full max-w-4xl mx-auto px-4 py-10 bg-white rounded-2xl shadow-2xl">
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Step 3: Select Page Count</h2>
          <p className="text-xl text-gray-600">Set the language, currency, and story length before continuing.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
              Language
            </div>
            <LanguageSelector size="md" showLabel={true} onLanguageChange={handleLanguageChange} />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
              Currency
            </div>
            <label htmlFor="step3-currency" className="block text-sm font-medium text-gray-700 mb-2">
              Select country and currency
            </label>
            <select
              id="step3-currency"
              value={currentCountryOption.country}
              onChange={handleCountryChange}
              className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {COUNTRY_CURRENCY_OPTIONS.map((option) => (
                <option key={option.country} value={option.country}>
                  {option.country} ({option.currency})
                </option>
              ))}
            </select>
            <p className="mt-3 text-sm text-gray-500">
              Billing preview: {CURRENCY_SYMBOLS[currency] || ''}
              {convertedPrice.toFixed(2)} for {formData.pageCount} pages
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
              Page Count
            </div>
            <label htmlFor="step3-page-count" className="block text-sm font-medium text-gray-700 mb-2">
              Choose story length
            </label>
            <select
              id="step3-page-count"
              value={formData.pageCount}
              onChange={(event) => handleSelect(Number(event.target.value))}
              className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {PAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-3 text-sm text-gray-500">
              {PAGE_OPTIONS.find((option) => option.value === formData.pageCount)?.description || 'Choose the story length that fits your book.'}{' '}
              Price: {formatPrice(formData.pageCount)}
            </p>
          </div>
        </div>

        <div className="pt-6 flex gap-4">
          <button
            onClick={prevStep}
            className="flex-1 bg-gray-300 text-gray-800 font-bold py-4 px-6 rounded-xl hover:bg-gray-400 transition-all duration-300 shadow-md text-lg"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg text-lg"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
