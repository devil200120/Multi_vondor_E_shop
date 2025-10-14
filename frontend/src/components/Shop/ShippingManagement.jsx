import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { server } from "../../server";
import axios from "axios";
import { FiTruck, FiSave, FiDollarSign } from "react-icons/fi";

const ShippingManagement = () => {
  const { seller } = useSelector((state) => state.seller);
  const [shippingConfig, setShippingConfig] = useState({
    baseShippingRate: 50,
    freeShippingThreshold: 999,
    isShippingEnabled: true,
  });

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Load existing shipping configuration
  const loadShippingConfig = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${server}/shipping/simple-config/${seller._id}`,
        { withCredentials: true }
      );

      if (response.data.success && response.data.config) {
        setShippingConfig({
          baseShippingRate: response.data.config.baseShippingRate || 50,
          freeShippingThreshold:
            response.data.config.freeShippingThreshold || 999,
          isShippingEnabled: response.data.config.isShippingEnabled !== false,
        });
      }
    } catch (error) {
      console.log("No existing shipping config found, using defaults");
    } finally {
      setLoading(false);
    }
  }, [seller?._id]);

  useEffect(() => {
    if (seller?._id) {
      loadShippingConfig();
    }
  }, [seller?._id, loadShippingConfig]);

  const saveShippingConfig = async () => {
    try {
      setSaveLoading(true);

      const response = await axios.post(
        `${server}/shipping/simple-config`,
        {
          shopId: seller._id,
          ...shippingConfig,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Shipping configuration saved successfully!");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save shipping configuration"
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setShippingConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="flex items-center space-x-3 mb-8">
          <FiTruck className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Simple Shipping Management
            </h2>
            <p className="text-gray-600 mt-1">
              Set your fixed delivery charges for all orders
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Enable/Disable Shipping */}
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FiTruck className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-blue-800">
                Shipping Status
              </h3>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={shippingConfig.isShippingEnabled}
                onChange={(e) =>
                  handleInputChange("isShippingEnabled", e.target.checked)
                }
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-lg font-medium text-gray-700">
                Enable shipping for my products
              </label>
            </div>
            <p className="text-sm text-gray-600 mt-2 ml-8">
              When disabled, customers will see "Contact seller for delivery"
              message
            </p>
          </div>

          {shippingConfig.isShippingEnabled && (
            <>
              {/* Basic Delivery Price */}
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <FiDollarSign className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-semibold text-green-800">
                    Delivery Charges
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-3">
                      Fixed Delivery Price (₹)
                    </label>
                    <input
                      type="number"
                      value={shippingConfig.baseShippingRate}
                      onChange={(e) =>
                        handleInputChange(
                          "baseShippingRate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="50"
                      min="0"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      This amount will be charged for all deliveries
                    </p>
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-3">
                      Free Shipping Threshold (₹)
                    </label>
                    <input
                      type="number"
                      value={shippingConfig.freeShippingThreshold}
                      onChange={(e) =>
                        handleInputChange(
                          "freeShippingThreshold",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="999"
                      min="0"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Free delivery for orders above this amount
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Preview - How customers will see your shipping:
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
                    <span className="text-gray-700">
                      Order amount: ₹
                      {Math.floor(shippingConfig.freeShippingThreshold * 0.8)}
                    </span>
                    <span className="font-semibold text-red-600">
                      + ₹{shippingConfig.baseShippingRate} shipping
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
                    <span className="text-gray-700">
                      Order amount: ₹
                      {shippingConfig.freeShippingThreshold + 100}
                    </span>
                    <span className="font-semibold text-green-600">
                      🚚 FREE Shipping
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={saveShippingConfig}
              disabled={saveLoading}
              className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {saveLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  <span>Save Shipping Configuration</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingManagement;
