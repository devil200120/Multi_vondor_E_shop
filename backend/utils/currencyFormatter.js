const SiteSettings = require("../model/siteSettings");

// Currency configuration cache
let cachedCurrency = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Default currency settings (fallback)
const defaultCurrency = {
  code: "USD",
  symbol: "$",
  name: "US Dollar",
  position: "before",
  decimalPlaces: 2,
  thousandsSeparator: ",",
  decimalSeparator: "."
};

/**
 * Get current currency settings from database with caching
 * @returns {Promise<Object>} Currency settings object
 */
const getCurrencySettings = async () => {
  try {
    const now = Date.now();
    
    // Return cached currency if still valid
    if (cachedCurrency && (now - cacheTimestamp) < CACHE_DURATION) {
      return cachedCurrency;
    }
    
    // Fetch from database
    const settings = await SiteSettings.findOne({ isActive: true });
    
    if (settings && settings.currency) {
      cachedCurrency = {
        code: settings.currency.code || defaultCurrency.code,
        symbol: settings.currency.symbol || defaultCurrency.symbol,
        name: settings.currency.name || defaultCurrency.name,
        position: settings.currency.position || defaultCurrency.position,
        decimalPlaces: settings.currency.decimalPlaces ?? defaultCurrency.decimalPlaces,
        thousandsSeparator: settings.currency.thousandsSeparator || defaultCurrency.thousandsSeparator,
        decimalSeparator: settings.currency.decimalSeparator || defaultCurrency.decimalSeparator
      };
    } else {
      cachedCurrency = { ...defaultCurrency };
    }
    
    cacheTimestamp = now;
    return cachedCurrency;
  } catch (error) {
    console.error("Error fetching currency settings:", error);
    return { ...defaultCurrency };
  }
};

/**
 * Clear the currency cache (call this when currency settings are updated)
 */
const clearCurrencyCache = () => {
  cachedCurrency = null;
  cacheTimestamp = 0;
};

/**
 * Format a number with thousands separator
 * @param {number} num - Number to format
 * @param {string} separator - Thousands separator character
 * @param {string} decimalSep - Decimal separator character
 * @param {number} decimalPlaces - Number of decimal places
 * @returns {string} Formatted number string
 */
const formatNumber = (num, separator, decimalSep, decimalPlaces) => {
  if (isNaN(num) || num === null || num === undefined) {
    return `0${decimalSep}${'0'.repeat(decimalPlaces)}`;
  }
  
  const fixed = parseFloat(num).toFixed(decimalPlaces);
  const parts = fixed.split('.');
  
  // Add thousands separator
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  
  return parts.join(decimalSep);
};

/**
 * Format price with currency symbol (async version - fetches settings from DB)
 * @param {number} amount - Amount to format
 * @returns {Promise<string>} Formatted price string with currency symbol
 */
const formatPrice = async (amount) => {
  const currency = await getCurrencySettings();
  return formatPriceSync(amount, currency);
};

/**
 * Format price with currency symbol (sync version - requires currency settings to be passed)
 * @param {number} amount - Amount to format
 * @param {Object} currency - Currency settings object
 * @returns {string} Formatted price string with currency symbol
 */
const formatPriceSync = (amount, currency) => {
  if (!currency) {
    currency = defaultCurrency;
  }
  
  const formattedNumber = formatNumber(
    amount,
    currency.thousandsSeparator,
    currency.decimalSeparator,
    currency.decimalPlaces
  );
  
  if (currency.position === "after") {
    return `${formattedNumber}${currency.symbol}`;
  }
  return `${currency.symbol}${formattedNumber}`;
};

/**
 * Get the currency symbol only
 * @returns {Promise<string>} Currency symbol
 */
const getCurrencySymbol = async () => {
  const currency = await getCurrencySettings();
  return currency.symbol;
};

/**
 * Get the currency code only
 * @returns {Promise<string>} Currency code (e.g., "USD", "INR")
 */
const getCurrencyCode = async () => {
  const currency = await getCurrencySettings();
  return currency.code;
};

/**
 * Create a currency formatter object with pre-loaded settings
 * This is useful when you need to format multiple prices in a single request
 * @returns {Promise<Object>} Object with sync format functions
 */
const createCurrencyFormatter = async () => {
  const currency = await getCurrencySettings();
  
  return {
    format: (amount) => formatPriceSync(amount, currency),
    symbol: currency.symbol,
    code: currency.code,
    position: currency.position,
    decimalPlaces: currency.decimalPlaces,
    settings: currency
  };
};

module.exports = {
  getCurrencySettings,
  clearCurrencyCache,
  formatPrice,
  formatPriceSync,
  getCurrencySymbol,
  getCurrencyCode,
  createCurrencyFormatter,
  defaultCurrency
};
