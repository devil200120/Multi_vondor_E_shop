import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { server } from "../server";

// Currency data with symbols and names
export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", position: "before" },
  { code: "EUR", symbol: "€", name: "Euro", position: "before" },
  { code: "GBP", symbol: "£", name: "British Pound", position: "before" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", position: "before" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", position: "before" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", position: "before" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", position: "before" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", position: "before" },
  { code: "KYD", symbol: "CI$", name: "Cayman Islands Dollar", position: "before" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", position: "before" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", position: "before" },
  { code: "MXN", symbol: "$", name: "Mexican Peso", position: "before" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", position: "before" },
  { code: "ZAR", symbol: "R", name: "South African Rand", position: "before" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", position: "before" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", position: "before" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", position: "before" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", position: "after" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", position: "after" },
  { code: "DKK", symbol: "kr", name: "Danish Krone", position: "after" },
];

// Default currency settings
const defaultCurrency = {
  code: "USD",
  symbol: "$",
  name: "US Dollar",
  position: "before",
  decimalPlaces: 2,
  thousandsSeparator: ",",
  decimalSeparator: "."
};

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(defaultCurrency);
  const [loading, setLoading] = useState(true);

  // Fetch currency settings from server
  useEffect(() => {
    const fetchCurrencySettings = async () => {
      try {
        const { data } = await axios.get(`${server}/site-settings/get-site-settings`);
        if (data.success && data.settings?.currency) {
          setCurrency({
            ...defaultCurrency,
            ...data.settings.currency
          });
        }
      } catch (error) {
        console.error("Error fetching currency settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencySettings();
  }, []);

  // Format price according to currency settings
  const formatPrice = (amount, options = {}) => {
    if (amount === null || amount === undefined) return "";
    
    const {
      showSymbol = true,
      showCode = false
    } = options;

    // Convert to number if string
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) return "";

    // Format the number
    const formattedNumber = numAmount.toFixed(currency.decimalPlaces);
    
    // Split into integer and decimal parts
    const [integerPart, decimalPart] = formattedNumber.split(".");
    
    // Add thousands separator
    const formattedInteger = integerPart.replace(
      /\B(?=(\d{3})+(?!\d))/g, 
      currency.thousandsSeparator
    );
    
    // Combine with decimal separator
    let formattedPrice = decimalPart 
      ? `${formattedInteger}${currency.decimalSeparator}${decimalPart}`
      : formattedInteger;
    
    // Add symbol
    if (showSymbol) {
      if (currency.position === "before") {
        formattedPrice = `${currency.symbol}${formattedPrice}`;
      } else {
        formattedPrice = `${formattedPrice} ${currency.symbol}`;
      }
    }
    
    // Add code if requested
    if (showCode) {
      formattedPrice = `${formattedPrice} ${currency.code}`;
    }
    
    return formattedPrice;
  };

  // Update currency (for admin use)
  const updateCurrency = (newCurrency) => {
    setCurrency(prev => ({
      ...prev,
      ...newCurrency
    }));
  };

  // Refresh currency from server
  const refreshCurrency = async () => {
    try {
      const { data } = await axios.get(`${server}/site-settings/get-site-settings`);
      if (data.success && data.settings?.currency) {
        setCurrency({
          ...defaultCurrency,
          ...data.settings.currency
        });
      }
    } catch (error) {
      console.error("Error refreshing currency settings:", error);
    }
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      formatPrice, 
      updateCurrency,
      refreshCurrency,
      loading,
      CURRENCIES
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom hook to use currency context
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

// Simple formatPrice function for use outside of React components
export const formatPriceStatic = (amount, currencySettings = defaultCurrency) => {
  if (amount === null || amount === undefined) return "";
  
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return "";

  const formattedNumber = numAmount.toFixed(currencySettings.decimalPlaces || 2);
  const [integerPart, decimalPart] = formattedNumber.split(".");
  
  const formattedInteger = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g, 
    currencySettings.thousandsSeparator || ","
  );
  
  let formattedPrice = decimalPart 
    ? `${formattedInteger}${currencySettings.decimalSeparator || "."}${decimalPart}`
    : formattedInteger;
  
  if (currencySettings.position === "after") {
    return `${formattedPrice} ${currencySettings.symbol || "$"}`;
  }
  return `${currencySettings.symbol || "$"}${formattedPrice}`;
};

export default CurrencyContext;
