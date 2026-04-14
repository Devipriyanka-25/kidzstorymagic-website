// Currency Conversion Routes
const express = require('express');
const CurrencyConverter = require('../utils/currencyConverter');
const config = require('../config/config');

const router = express.Router();

// Get all supported currencies
router.get('/supported', (req, res) => {
  try {
    const currencies = CurrencyConverter.getSupportedCurrencies();
    res.json({ currencies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch supported currencies' });
  }
});

// Get exchange rates
router.get('/rates', async (req, res) => {
  try {
    const { from = 'USD', to } = req.query;

    if (!to) {
      // Get rates from base currency to all supported
      const allRates = {};
      for (const currency of config.currency.supportedCurrencies) {
        if (currency !== from) {
          const rate = await CurrencyConverter.getExchangeRate(from, currency);
          allRates[currency] = rate;
        }
      }
      return res.json({ base: from, rates: allRates });
    }

    // Get specific rate
    const rate = await CurrencyConverter.getExchangeRate(from, to);
    res.json({ from, to, rate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
});

// Convert amount
router.post('/convert', async (req, res) => {
  try {
    const { amount, from, to } = req.body;

    if (!amount || !from || !to) {
      return res.status(400).json({
        error: 'amount, from, and to are required'
      });
    }

    const result = await CurrencyConverter.convertCurrency(
      parseFloat(amount),
      from.toUpperCase(),
      to.toUpperCase()
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Conversion failed' });
  }
});

// Get pricing in user's currency
router.post('/pricing', async (req, res) => {
  try {
    const { currency, baseCurrency = config.pricing.currency } = req.body;

    const pricing = await CurrencyConverter.getPricingInCurrency(
      config.pricing.base,
      baseCurrency,
      currency
    );

    res.json({
      pricing,
      displayMessage: `You are paying in ${currency}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to calculate pricing' });
  }
});

// Detect user currency by IP
router.get('/detect', async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const currency = await CurrencyConverter.detectUserCurrency(ip);

    res.json({
      currency,
      message: `Detected currency: ${currency}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to detect currency' });
  }
});

// Refresh exchange rates
router.post('/refresh-rates', async (req, res) => {
  try {
    await CurrencyConverter.updateCachedRates();
    res.json({ message: 'Exchange rates updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to refresh rates' });
  }
});

module.exports = router;
