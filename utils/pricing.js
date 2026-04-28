export const STORY_BASE_PRICES_USD = {
  10: 9.99,
  20: 14.99,
  30: 19.99,
};

export const DEFAULT_EXCHANGE_RATES = {
  USD: 1,
  CAD: 1.35,
  GBP: 0.79,
  EUR: 0.92,
  AUD: 1.52,
  INR: 83.12,
};

export const COUNTRY_CURRENCY_OPTIONS = [
  { country: 'United States', currency: 'USD' },
  { country: 'Canada', currency: 'CAD' },
  { country: 'United Kingdom', currency: 'GBP' },
  { country: 'European Union', currency: 'EUR' },
  { country: 'Australia', currency: 'AUD' },
  { country: 'India', currency: 'INR' },
];

export const CURRENCY_SYMBOLS = {
  USD: '$',
  CAD: 'C$',
  GBP: 'GBP ',
  EUR: 'EUR ',
  AUD: 'A$',
  INR: 'INR ',
};

export function normalizeStoryPageCount(pageCount) {
  const parsedCount = Number(pageCount);

  if (Object.prototype.hasOwnProperty.call(STORY_BASE_PRICES_USD, parsedCount)) {
    return parsedCount;
  }

  return 10;
}

export function getStoryBasePriceUSD(pageCount) {
  return STORY_BASE_PRICES_USD[normalizeStoryPageCount(pageCount)];
}

export function getExchangeRateForCurrency(
  currency,
  exchangeRates = DEFAULT_EXCHANGE_RATES
) {
  const normalizedCurrency = String(currency || 'USD').trim().toUpperCase();

  return (
    exchangeRates?.[normalizedCurrency] ||
    DEFAULT_EXCHANGE_RATES[normalizedCurrency] ||
    1
  );
}

export function getConvertedStoryPrice(
  pageCount,
  currency,
  exchangeRates = DEFAULT_EXCHANGE_RATES
) {
  const normalizedCurrency = String(currency || 'USD').trim().toUpperCase();
  const basePriceUSD = getStoryBasePriceUSD(pageCount);
  const exchangeRate = getExchangeRateForCurrency(
    normalizedCurrency,
    exchangeRates
  );
  const amount = Number((basePriceUSD * exchangeRate).toFixed(2));

  return {
    amount,
    basePriceUSD,
    currency: normalizedCurrency,
    exchangeRate,
  };
}

export function getCountryCurrencyOption(country) {
  return COUNTRY_CURRENCY_OPTIONS.find((option) => option.country === country);
}

export function getCountryOptionByCurrency(currency) {
  const normalizedCurrency = String(currency || 'USD').trim().toUpperCase();

  return COUNTRY_CURRENCY_OPTIONS.find(
    (option) => option.currency === normalizedCurrency
  );
}
