// Currency Conversion Utilities
const axios = require('axios');
const pool = require('../config/database');
const config = require('../config/config');

class CurrencyConverter {
  /**
   * Fetch exchange rates from API
   */
  static async fetchExchangeRates() {
    try {
      const apiKey = config.currency.exchangeRateApiKey;
      
      // If no API key is configured, return default rates for supported currencies
      if (!apiKey || apiKey === 'your_exchange_rate_api_key') {
        console.warn('[CURRENCY] Exchange rate API key not configured, using default rates');
        return this.getDefaultExchangeRates();
      }
      
      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`,
        { timeout: 5000 }
      );

      if (response.data.result === 'success') {
        return response.data.conversion_rates;
      }

      throw new Error('Failed to fetch exchange rates');
    } catch (err) {
      console.error('[CURRENCY] Exchange rate API error:', err.message);
      console.warn('[CURRENCY] Falling back to default exchange rates');
      return this.getDefaultExchangeRates();
    }
  }

  /**
   * Get default exchange rates (fallback)
   */
  static getDefaultExchangeRates() {
    return {
      USD: 1.0,
      CAD: 1.36,
      GBP: 0.79,
      EUR: 0.92,
      AUD: 1.52,
      INR: 83.12
    };
  }

  /**
   * Update cached exchange rates in database
   */
  static async updateCachedRates() {
    try {
      const rates = await this.fetchExchangeRates();
      const baseCurrency = 'USD';

      // Update rates in database
      for (const [currency, rate] of Object.entries(rates)) {
        if (config.currency.supportedCurrencies.includes(currency)) {
          await pool.query(
            `INSERT INTO currency_rates (from_currency, to_currency, rate, last_updated)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
             ON CONFLICT (from_currency, to_currency) 
             DO UPDATE SET rate = EXCLUDED.rate, last_updated = CURRENT_TIMESTAMP`,
            [baseCurrency, currency, rate]
          );
        }
      }

      return rates;
    } catch (err) {
      console.error('Failed to update cached rates:', err);
      throw err;
    }
  }

  /**
   * Get exchange rate from cache
   */
  static async getExchangeRate(fromCurrency, toCurrency) {
    try {
      // Check if we have cached rate
      const result = await pool.query(
        `SELECT rate, last_updated FROM currency_rates 
         WHERE from_currency = $1 AND to_currency = $2`,
        [fromCurrency, toCurrency]
      );

      if (result.rows.length > 0) {
        const row = result.rows[0];
        const lastUpdated = new Date(row.last_updated);
        const hoursOld = (Date.now() - lastUpdated) / (1000 * 60 * 60);

        // If rate is older than 24 hours, refresh it
        if (hoursOld > 24) {
          await this.updateCachedRates();
        }

        return row.rate;
      }

      // If no cached rate, fetch fresh rates
      await this.updateCachedRates();
      return await this.getExchangeRate(fromCurrency, toCurrency);
    } catch (err) {
      console.error('Failed to get exchange rate:', err);
      throw err;
    }
  }

  /**
   * Convert amount from one currency to another
   */
  static async convertCurrency(amount, fromCurrency, toCurrency) {
    try {
      if (fromCurrency === toCurrency) {
        return {
          original: amount,
          originalCurrency: fromCurrency,
          converted: amount,
          currency: toCurrency,
          rate: '1.0000',
          timestamp: new Date().toISOString()
        };
      }

      const rate = parseFloat(await this.getExchangeRate(fromCurrency, toCurrency));
      const convertedAmount = (amount * rate).toFixed(2);

      return {
        original: amount,
        originalCurrency: fromCurrency,
        converted: parseFloat(convertedAmount),
        currency: toCurrency,
        rate: rate.toFixed(4),
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.error('Currency conversion failed:', err);
      throw err;
    }
  }

  /**
   * Get user's currency based on location
   */
  static async detectUserCurrency(ipAddress) {
    try {
      // Using IP to location API (you can use geoip-lite library instead)
      const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
      const currencyCode = response.data.currency_code;

      if (config.currency.supportedCurrencies.includes(currencyCode)) {
        return currencyCode;
      }

      return config.currency.defaultCurrency;
    } catch (err) {
      console.error('Currency detection failed:', err);
      return config.currency.defaultCurrency;
    }
  }

  /**
   * Get pricing in user's currency
   */
  static async getPricingInCurrency(basePrice, baseCurrency, targetCurrency) {
    try {
      const result = await this.convertCurrency(basePrice, baseCurrency, targetCurrency);
      return {
        price: result.converted,
        currency: result.currency,
        display: `${result.currency} ${result.converted.toFixed(2)}`,
        rate: result.rate
      };
    } catch (err) {
      console.error('Failed to get pricing:', err);
      return {
        price: basePrice,
        currency: baseCurrency,
        display: `${baseCurrency} ${basePrice.toFixed(2)}`
      };
    }
  }

  /**
   * Get all supported currencies
   */
  static getSupportedCurrencies() {
    return config.currency.supportedCurrencies;
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount, currency) {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    });

    return formatter.format(amount);
  }
}

module.exports = CurrencyConverter;
