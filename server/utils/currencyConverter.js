const axios = require('axios');

/**
 * Currency Converter Utility
 * Uses exchangerate-api.io for real-time exchange rates
 * Falls back to configured rate if API fails
 */

// Cache for exchange rates (valid for 1 hour)
let rateCache = {
  rates: {},
  timestamp: null,
  ttl: 3600000, // 1 hour in milliseconds
};

/**
 * Get exchange rate from API or cache
 * @param {string} fromCurrency - Source currency code (e.g., 'KES')
 * @param {string} toCurrency - Target currency code (e.g., 'USD')
 * @returns {Promise<number>} Exchange rate
 */
async function getExchangeRate(fromCurrency = 'KES', toCurrency = 'USD') {
  try {
    // Check if we have a valid cached rate
    const cacheKey = `${fromCurrency}_${toCurrency}`;
    const now = Date.now();
    
    if (
      rateCache.timestamp &&
      now - rateCache.timestamp < rateCache.ttl &&
      rateCache.rates[cacheKey]
    ) {
      console.log(`Using cached exchange rate: 1 ${fromCurrency} = ${rateCache.rates[cacheKey]} ${toCurrency}`);
      return rateCache.rates[cacheKey];
    }

    // Fetch from API
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    let rate;

    if (apiKey) {
      // Use exchangerate-api.io with API key (more requests allowed)
      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${toCurrency}`,
        { timeout: 5000 }
      );
      
      if (response.data.result === 'success') {
        rate = response.data.conversion_rate;
      }
    } else {
      // Use free tier without API key (limited requests)
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`,
        { timeout: 5000 }
      );
      
      if (response.data && response.data.rates && response.data.rates[toCurrency]) {
        rate = response.data.rates[toCurrency];
      }
    }

    if (rate) {
      // Cache the rate
      rateCache.rates[cacheKey] = rate;
      rateCache.timestamp = now;
      
      console.log(`Fetched exchange rate from API: 1 ${fromCurrency} = ${rate} ${toCurrency}`);
      return rate;
    }

    // If API call succeeded but no rate found, throw error
    throw new Error('Exchange rate not found in API response');
    
  } catch (error) {
    console.error('Currency conversion API error:', error.message);
    
    // Fallback to configured rate
    const fallbackRate = parseFloat(process.env.KES_TO_USD_RATE || '0.0077');
    console.log(`Using fallback exchange rate: 1 ${fromCurrency} = ${fallbackRate} ${toCurrency}`);
    
    return fallbackRate;
  }
}

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<number>} Converted amount
 */
async function convertCurrency(amount, fromCurrency = 'KES', toCurrency = 'USD') {
  const rate = await getExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
}

/**
 * Clear the exchange rate cache
 */
function clearCache() {
  rateCache = {
    rates: {},
    timestamp: null,
    ttl: 3600000,
  };
  console.log('Exchange rate cache cleared');
}

/**
 * Get supported currencies
 * @returns {Array<string>} List of supported currency codes
 */
function getSupportedCurrencies() {
  return ['KES', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'];
}

module.exports = {
  getExchangeRate,
  convertCurrency,
  clearCache,
  getSupportedCurrencies,
};
