import React, { useState } from "react";
import { FiTruck, FiPackage, FiClock, FiMapPin } from "react-icons/fi";

// Helper function to safely parse float values without precision issues
const safeParseFloat = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) {
    return fallback;
  }
  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    return fallback;
  }
  // Round to 2 decimal places to avoid precision issues
  return Math.round(parsed * 100) / 100;
};

const ProductShippingConfig = ({ productData, onShippingChange }) => {
  const [shippingConfig, setShippingConfig] = useState({
    baseShippingRate: productData?.shipping?.baseShippingRate || 0,
    freeShippingThreshold: productData?.shipping?.freeShippingThreshold || null,
    weight: productData?.shipping?.weight || 1,
    dimensions: {
      length: productData?.shipping?.dimensions?.length || 10,
      width: productData?.shipping?.dimensions?.width || 10,
      height: productData?.shipping?.dimensions?.height || 5,
    },
    expressDeliveryAvailable:
      productData?.shipping?.expressDeliveryAvailable ?? true,
    estimatedDeliveryDays: {
      min: productData?.shipping?.estimatedDeliveryDays?.min || 2,
      max: productData?.shipping?.estimatedDeliveryDays?.max || 7,
    },
    restrictions: {
      excludePincodes:
        productData?.shipping?.restrictions?.excludePincodes || [],
      requiresSpecialHandling:
        productData?.shipping?.restrictions?.requiresSpecialHandling || false,
      specialHandlingCharge:
        productData?.shipping?.restrictions?.specialHandlingCharge || 0,
    },
  });

  const [newPincode, setNewPincode] = useState("");

  const handleInputChange = (field, value) => {
    let updatedConfig;

    if (field.includes(".")) {
      const keys = field.split(".");
      if (keys.length === 2) {
        updatedConfig = {
          ...shippingConfig,
          [keys[0]]: {
            ...shippingConfig[keys[0]],
            [keys[1]]: value,
          },
        };
      } else if (keys.length === 3) {
        updatedConfig = {
          ...shippingConfig,
          [keys[0]]: {
            ...shippingConfig[keys[0]],
            [keys[1]]: {
              ...shippingConfig[keys[0]][keys[1]],
              [keys[2]]: value,
            },
          },
        };
      }
    } else {
      updatedConfig = {
        ...shippingConfig,
        [field]: value,
      };
    }

    setShippingConfig(updatedConfig);
    onShippingChange(updatedConfig);
  };

  const addExcludePincode = () => {
    if (
      newPincode &&
      !shippingConfig.restrictions.excludePincodes.includes(newPincode)
    ) {
      const updatedConfig = {
        ...shippingConfig,
        restrictions: {
          ...shippingConfig.restrictions,
          excludePincodes: [
            ...shippingConfig.restrictions.excludePincodes,
            newPincode,
          ],
        },
      };
      setShippingConfig(updatedConfig);
      onShippingChange(updatedConfig);
      setNewPincode("");
    }
  };

  const removeExcludePincode = (pincode) => {
    const updatedConfig = {
      ...shippingConfig,
      restrictions: {
        ...shippingConfig.restrictions,
        excludePincodes: shippingConfig.restrictions.excludePincodes.filter(
          (p) => p !== pincode
        ),
      },
    };
    setShippingConfig(updatedConfig);
    onShippingChange(updatedConfig);
  };

  return (
    <div className="bg-white border rounded-lg p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <FiTruck className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          Product Shipping Configuration
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Shipping Settings */}
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-3 flex items-center">
              <FiTruck className="w-4 h-4 mr-2" />
              Shipping Rates
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Shipping Rate (₹)
                </label>
                <input
                  type="number"
                  value={shippingConfig.baseShippingRate}
                  onChange={(e) =>
                    handleInputChange(
                      "baseShippingRate",
                      safeParseFloat(e.target.value, 0)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="0 (uses shop default)"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set 0 to use shop's default shipping rates
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Free Shipping Threshold (₹)
                </label>
                <input
                  type="number"
                  value={shippingConfig.freeShippingThreshold || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "freeShippingThreshold",
                      e.target.value === ""
                        ? null
                        : safeParseFloat(e.target.value, null)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Leave empty for shop default"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Free shipping when product price exceeds this amount
                </p>
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-3 flex items-center">
              <FiPackage className="w-4 h-4 mr-2" />
              Package Details
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={shippingConfig.weight}
                  onChange={(e) =>
                    handleInputChange(
                      "weight",
                      safeParseFloat(e.target.value, 1)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  placeholder="1"
                  min="0.1"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions (cm)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={shippingConfig.dimensions.length}
                    onChange={(e) =>
                      handleInputChange(
                        "dimensions.length",
                        safeParseFloat(e.target.value, 10)
                      )
                    }
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="L"
                    min="1"
                  />
                  <input
                    type="number"
                    value={shippingConfig.dimensions.width}
                    onChange={(e) =>
                      handleInputChange(
                        "dimensions.width",
                        safeParseFloat(e.target.value, 10)
                      )
                    }
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="W"
                    min="1"
                  />
                  <input
                    type="number"
                    value={shippingConfig.dimensions.height}
                    onChange={(e) =>
                      handleInputChange(
                        "dimensions.height",
                        safeParseFloat(e.target.value, 5)
                      )
                    }
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="H"
                    min="1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Length × Width × Height
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery & Restrictions */}
        <div className="space-y-4">
          {/* Delivery Options */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-3 flex items-center">
              <FiClock className="w-4 h-4 mr-2" />
              Delivery Options
            </h4>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={shippingConfig.expressDeliveryAvailable}
                  onChange={(e) =>
                    handleInputChange(
                      "expressDeliveryAvailable",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Express delivery available
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Delivery Days
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number"
                      value={shippingConfig.estimatedDeliveryDays.min}
                      onChange={(e) =>
                        handleInputChange(
                          "estimatedDeliveryDays.min",
                          parseInt(e.target.value) || 2
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                      placeholder="Min"
                      min="1"
                    />
                    <p className="text-xs text-gray-500">Min days</p>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={shippingConfig.estimatedDeliveryDays.max}
                      onChange={(e) =>
                        handleInputChange(
                          "estimatedDeliveryDays.max",
                          parseInt(e.target.value) || 7
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                      placeholder="Max"
                      min="1"
                    />
                    <p className="text-xs text-gray-500">Max days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Restrictions */}
          <div className="bg-red-50 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-3 flex items-center">
              <FiMapPin className="w-4 h-4 mr-2" />
              Shipping Restrictions
            </h4>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={shippingConfig.restrictions.requiresSpecialHandling}
                  onChange={(e) =>
                    handleInputChange(
                      "restrictions.requiresSpecialHandling",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Requires special handling
                </label>
              </div>

              {shippingConfig.restrictions.requiresSpecialHandling && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Handling Charge (₹)
                  </label>
                  <input
                    type="number"
                    value={shippingConfig.restrictions.specialHandlingCharge}
                    onChange={(e) =>
                      handleInputChange(
                        "restrictions.specialHandlingCharge",
                        safeParseFloat(e.target.value, 0)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder="0"
                    min="0"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exclude Pincodes
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder="Enter pincode"
                    maxLength="6"
                  />
                  <button
                    type="button"
                    onClick={addExcludePincode}
                    className="px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                  >
                    Add
                  </button>
                </div>

                {shippingConfig.restrictions.excludePincodes.length > 0 && (
                  <div className="space-y-1">
                    {shippingConfig.restrictions.excludePincodes.map(
                      (pincode, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white px-2 py-1 rounded border"
                        >
                          <span className="text-sm">{pincode}</span>
                          <button
                            type="button"
                            onClick={() => removeExcludePincode(pincode)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Pincodes where this product cannot be shipped
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductShippingConfig;
