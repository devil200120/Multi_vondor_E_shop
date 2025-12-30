import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { server } from "../../server";
import { useCurrency, CURRENCIES } from "../../context/CurrencyContext";
import {
  HiOutlineCurrencyDollar,
  HiOutlineCheck,
  HiOutlineRefresh,
  HiOutlineSave,
  HiOutlineGlobeAlt,
} from "react-icons/hi";

const AdminCurrencySettings = () => {
  const { user } = useSelector((state) => state.user);
  const { currency, refreshCurrency } = useCurrency();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    position: "before",
    decimalPlaces: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  });

  // Fetch current settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${server}/site-settings/admin/get-site-settings`,
        { withCredentials: true }
      );
      if (data.success && data.settings?.currency) {
        setSettings((prev) => ({
          ...prev,
          ...data.settings.currency,
        }));
      }
    } catch (error) {
      toast.error("Error fetching currency settings");
    } finally {
      setLoading(false);
    }
  };

  // Handle currency selection
  const handleCurrencySelect = (currencyData) => {
    setSettings((prev) => ({
      ...prev,
      code: currencyData.code,
      symbol: currencyData.symbol,
      name: currencyData.name,
      position: currencyData.position || "before",
    }));
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: name === "decimalPlaces" ? parseInt(value) : value,
    }));
  };

  // Save settings
  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put(
        `${server}/site-settings/admin/update-site-settings`,
        { currency: settings },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Currency settings saved successfully!");
        // Refresh the global currency context
        await refreshCurrency();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error saving currency settings"
      );
    } finally {
      setSaving(false);
    }
  };

  // Preview formatted price
  const previewPrice = (amount) => {
    const formattedNumber = amount.toFixed(settings.decimalPlaces);
    const [integerPart, decimalPart] = formattedNumber.split(".");
    const formattedInteger = integerPart.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      settings.thousandsSeparator
    );
    let price = decimalPart
      ? `${formattedInteger}${settings.decimalSeparator}${decimalPart}`
      : formattedInteger;

    if (settings.position === "after") {
      return `${price} ${settings.symbol}`;
    }
    return `${settings.symbol}${price}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <HiOutlineCurrencyDollar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Currency Settings
            </h2>
            <p className="text-gray-500 text-sm">
              Configure the currency displayed across your website
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Currency Selection */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <HiOutlineGlobeAlt className="w-5 h-5 text-blue-500" />
            Select Currency
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-2">
            {CURRENCIES.map((curr) => (
              <button
                key={curr.code}
                onClick={() => handleCurrencySelect(curr)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                  settings.code === curr.code
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl font-bold text-gray-800">
                    {curr.symbol}
                  </span>
                  {settings.code === curr.code && (
                    <HiOutlineCheck className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {curr.code}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {curr.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Settings & Preview */}
        <div className="space-y-6">
          {/* Format Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Format Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symbol Position
                </label>
                <select
                  name="position"
                  value={settings.position}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="before">
                    Before amount ({settings.symbol}100)
                  </option>
                  <option value="after">
                    After amount (100 {settings.symbol})
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Decimal Places
                </label>
                <select
                  name="decimalPlaces"
                  value={settings.decimalPlaces}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={0}>0 (100)</option>
                  <option value={1}>1 (100.0)</option>
                  <option value={2}>2 (100.00)</option>
                  <option value={3}>3 (100.000)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thousands Separator
                </label>
                <select
                  name="thousandsSeparator"
                  value={settings.thousandsSeparator}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value=",">Comma (1,000)</option>
                  <option value=".">Period (1.000)</option>
                  <option value=" ">Space (1 000)</option>
                  <option value="">None (1000)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Decimal Separator
                </label>
                <select
                  name="decimalSeparator"
                  value={settings.decimalSeparator}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value=".">Period (100.00)</option>
                  <option value=",">Comma (100,00)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Preview
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-blue-200">
                <span className="text-gray-600">Small amount:</span>
                <span className="text-xl font-bold text-blue-600">
                  {previewPrice(49.99)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-blue-200">
                <span className="text-gray-600">Medium amount:</span>
                <span className="text-xl font-bold text-blue-600">
                  {previewPrice(1234.56)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Large amount:</span>
                <span className="text-xl font-bold text-blue-600">
                  {previewPrice(99999.99)}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Current Settings</div>
              <div className="text-sm font-medium text-gray-700">
                {settings.name} ({settings.code}) - {settings.symbol}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <HiOutlineRefresh className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <HiOutlineSave className="w-5 h-5" />
                Save Currency Settings
              </>
            )}
          </button>

          {/* Info Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Currency changes will be reflected across
              the entire website immediately after saving. All prices will
              display in the selected currency format.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCurrencySettings;
