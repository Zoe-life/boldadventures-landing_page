const express = require('express');
const {
  getExchangeRate,
  convertCurrency,
  getSupportedCurrencies,
} = require('../utils/currencyConverter');

const router = express.Router();

/**
 * @desc    Get exchange rate between two currencies
 * @route   GET /api/currency/rate?from=KES&to=USD
 * @access  Public
 */
router.get('/rate', async (req, res) => {
  try {
    const { from = 'KES', to = 'USD' } = req.query;

    const rate = await getExchangeRate(from, to);

    res.status(200).json({
      success: true,
      data: {
        from,
        to,
        rate,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Get exchange rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exchange rate',
      error: error.message,
    });
  }
});

/**
 * @desc    Convert amount between currencies
 * @route   GET /api/currency/convert?amount=100000&from=KES&to=USD
 * @access  Public
 */
router.get('/convert', async (req, res) => {
  try {
    const { amount, from = 'KES', to = 'USD' } = req.query;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      });
    }

    const convertedAmount = await convertCurrency(
      parseFloat(amount),
      from,
      to
    );

    res.status(200).json({
      success: true,
      data: {
        originalAmount: parseFloat(amount),
        convertedAmount: parseFloat(convertedAmount.toFixed(2)),
        from,
        to,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Currency conversion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert currency',
      error: error.message,
    });
  }
});

/**
 * @desc    Get list of supported currencies
 * @route   GET /api/currency/supported
 * @access  Public
 */
router.get('/supported', (req, res) => {
  try {
    const currencies = getSupportedCurrencies();

    res.status(200).json({
      success: true,
      data: {
        currencies,
        count: currencies.length,
      },
    });
  } catch (error) {
    console.error('Get supported currencies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get supported currencies',
      error: error.message,
    });
  }
});

module.exports = router;
