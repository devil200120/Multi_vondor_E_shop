import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  FiTruck,
  FiMapPin,
  FiDollarSign,
  FiClock,
  FiWeight,
  FiSettings,
  FiPlus,
  FiTrash2,
  FiSave,
  FiInfo,
} from "react-icons/fi";

const ShippingConfiguration = () => {
  const { seller } = useSelector((state) => state.seller);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    shopId: seller?._id,
    baseRate: 50,
    perKmRate: 5,
    freeShippingThreshold: 999,
    maxDeliveryDistance: 100,
    peakHourMultiplier: 1.2,
    peakHours: [
      { start: "08:00", end: "11:00" },
      { start: "17:00", end: "20:00" },
    ],
    weightBasedPricing: {
      enabled: false,
      baseWeight: 1,
      additionalWeightRate: 10,
    },
    expressDelivery: {
      enabled: true,
      multiplier: 1.5,
    },
    location: {
      address: "",
      latitude: "",
      longitude: "",
      pincode: "",
    },
    serviceAreas: [],
    isActive: true,
  });

  const fetchShippingConfig = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${server}/shipping/config/${seller._id}`
      );
      if (response.data.success) {
        setConfig(response.data.config);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Error fetching shipping config:", error);
        toast.error("Failed to load shipping configuration");
      }
    } finally {
      setLoading(false);
    }
  }, [seller._id]);

  useEffect(() => {
    if (seller?._id) {
      fetchShippingConfig();
    }
  }, [seller, fetchShippingConfig]);

  const handleConfigChange = (path, value) => {
    setConfig((prev) => {
      const newConfig = { ...prev };
      const keys = path.split(".");
      let current = newConfig;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const addPeakHour = () => {
    setConfig((prev) => ({
      ...prev,
      peakHours: [...prev.peakHours, { start: "09:00", end: "18:00" }],
    }));
  };

  const removePeakHour = (index) => {
    setConfig((prev) => ({
      ...prev,
      peakHours: prev.peakHours.filter((_, i) => i !== index),
    }));
  };

  const updatePeakHour = (index, field, value) => {
    const newPeakHours = [...config.peakHours];
    newPeakHours[index][field] = value;
    handleConfigChange("peakHours", newPeakHours);
  };

  const saveConfiguration = async () => {
    try {
      setSaving(true);

      // Validation
      if (
        !config.location.address ||
        !config.location.latitude ||
        !config.location.longitude ||
        !config.location.pincode
      ) {
        toast.error("Please fill in complete location details");
        return;
      }

      if (config.baseRate < 0 || config.perKmRate < 0) {
        toast.error("Rates cannot be negative");
        return;
      }

      const response = await axios.post(`${server}/shipping/config`, config, {
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success("Shipping configuration saved successfully!");
        setConfig(response.data.config);
      }
    } catch (error) {
      console.error("Error saving shipping config:", error);
      toast.error(
        error.response?.data?.message || "Failed to save configuration"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <FiTruck className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Shipping Configuration
            </h1>
          </div>
          <p className="text-gray-600">
            Configure your shipping rates, delivery areas, and pricing rules to
            provide accurate shipping costs to your customers.
          </p>
        </div>

        {/* Basic Pricing */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <FiDollarSign className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Basic Pricing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Rate (₹)
              </label>
              <input
                type="number"
                value={config.baseRate}
                onChange={(e) =>
                  handleConfigChange(
                    "baseRate",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Fixed base charge for all deliveries
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Per KM Rate (₹)
              </label>
              <input
                type="number"
                step="0.1"
                value={config.perKmRate}
                onChange={(e) =>
                  handleConfigChange(
                    "perKmRate",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Rate charged per kilometer
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                value={config.freeShippingThreshold}
                onChange={(e) =>
                  handleConfigChange(
                    "freeShippingThreshold",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="999"
              />
              <p className="text-xs text-gray-500 mt-1">
                Orders above this amount get free shipping
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Delivery Distance (KM)
              </label>
              <input
                type="number"
                value={config.maxDeliveryDistance}
                onChange={(e) =>
                  handleConfigChange(
                    "maxDeliveryDistance",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum distance you deliver to
              </p>
            </div>
          </div>
        </div>

        {/* Location Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <FiMapPin className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Store Location
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Address
              </label>
              <textarea
                value={config.location.address}
                onChange={(e) =>
                  handleConfigChange("location.address", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Enter your complete store address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={config.location.latitude}
                onChange={(e) =>
                  handleConfigChange(
                    "location.latitude",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="12.9716"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={config.location.longitude}
                onChange={(e) =>
                  handleConfigChange(
                    "location.longitude",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="77.5946"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode
              </label>
              <input
                type="text"
                value={config.location.pincode}
                onChange={(e) =>
                  handleConfigChange("location.pincode", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="560001"
                maxLength="6"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <FiInfo className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  How to get coordinates:
                </p>
                <p className="text-sm text-blue-700">
                  Search your store location on Google Maps, right-click on the
                  pin, and copy the coordinates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <FiSettings className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Advanced Settings
            </h2>
          </div>

          {/* Peak Hours */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Peak Hours
                </h3>
                <p className="text-sm text-gray-600">
                  Set peak hour surcharge times
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peak Hour Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.peakHourMultiplier}
                    onChange={(e) =>
                      handleConfigChange(
                        "peakHourMultiplier",
                        parseFloat(e.target.value) || 1
                      )
                    }
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="1.2"
                  />
                </div>
                <button
                  onClick={addPeakHour}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {config.peakHours.map((hour, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={hour.start}
                      onChange={(e) =>
                        updatePeakHour(index, "start", e.target.value)
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={hour.end}
                      onChange={(e) =>
                        updatePeakHour(index, "end", e.target.value)
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <button
                    onClick={() => removePeakHour(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Weight-Based Pricing */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <FiWeight className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">
                Weight-Based Pricing
              </h3>
            </div>

            <div className="flex items-center space-x-4 mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.weightBasedPricing.enabled}
                  onChange={(e) =>
                    handleConfigChange(
                      "weightBasedPricing.enabled",
                      e.target.checked
                    )
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Enable weight-based pricing
                </span>
              </label>
            </div>

            {config.weightBasedPricing.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Weight (KG)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.weightBasedPricing.baseWeight}
                    onChange={(e) =>
                      handleConfigChange(
                        "weightBasedPricing.baseWeight",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Weight Rate (₹/KG)
                  </label>
                  <input
                    type="number"
                    value={config.weightBasedPricing.additionalWeightRate}
                    onChange={(e) =>
                      handleConfigChange(
                        "weightBasedPricing.additionalWeightRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Express Delivery */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <FiClock className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">
                Express Delivery
              </h3>
            </div>

            <div className="flex items-center space-x-4 mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.expressDelivery.enabled}
                  onChange={(e) =>
                    handleConfigChange(
                      "expressDelivery.enabled",
                      e.target.checked
                    )
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Enable express delivery
                </span>
              </label>
            </div>

            {config.expressDelivery.enabled && (
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Express Delivery Multiplier
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={config.expressDelivery.multiplier}
                  onChange={(e) =>
                    handleConfigChange(
                      "expressDelivery.multiplier",
                      parseFloat(e.target.value) || 1
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1.5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  1.5 means 50% extra charge for express delivery
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveConfiguration}
            disabled={saving}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center space-x-2 transition-colors duration-200"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShippingConfiguration;
