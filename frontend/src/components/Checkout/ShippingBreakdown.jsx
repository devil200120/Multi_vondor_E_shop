import React from "react";
import {
  FiTruck,
  FiClock,
  FiMapPin,
  FiInfo,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";

const ShippingBreakdown = ({ shippingCalculation, calculatingShipping }) => {
  if (calculatingShipping) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-blue-800 font-medium">
            Calculating shipping costs...
          </span>
        </div>
      </div>
    );
  }

  if (!shippingCalculation || !shippingCalculation.success) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-3">
          <FiAlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">
              Shipping Information
            </h4>
            <p className="text-yellow-700 text-sm mt-1">
              Please enter your complete delivery address to calculate accurate
              shipping costs.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { shopShipping, totalShipping, hasErrors } = shippingCalculation;

  return (
    <div className="space-y-4">
      {/* Total Shipping Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiTruck className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-800">
              Total Shipping Cost
            </h3>
          </div>
          <span className="text-lg font-bold text-green-800">
            {totalShipping === 0 ? "FREE" : `₹${totalShipping.toFixed(2)}`}
          </span>
        </div>
        {totalShipping === 0 && (
          <p className="text-green-700 text-sm mt-2 flex items-center space-x-1">
            <FiCheck className="w-4 h-4" />
            <span>Congratulations! You qualify for free shipping.</span>
          </p>
        )}
      </div>

      {/* Shipping Details by Supplier */}
      {shopShipping && shopShipping.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center space-x-2">
            <FiInfo className="w-4 h-4" />
            <span>Shipping Breakdown by Supplier</span>
          </h4>

          {shopShipping.map((shop, index) => (
            <div
              key={shop.shopId}
              className="border border-gray-200 rounded-lg p-4"
            >
              {shop.success ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-gray-900">
                        Supplier {index + 1}
                      </h5>
                      <p className="text-sm text-gray-600">
                        Order Value: ₹{shop.orderValue?.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {shop.data.shippingCost === 0
                        ? "FREE"
                        : `₹${shop.data.shippingCost?.toFixed(2)}`}
                    </span>
                  </div>

                  {/* Delivery Information */}
                  {shop.data.estimatedDeliveryTime && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <FiClock className="w-4 h-4" />
                        <span>
                          Delivery: {shop.data.estimatedDeliveryTime.text}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiMapPin className="w-4 h-4" />
                        <span>Distance: {shop.data.distance?.text}</span>
                      </div>
                    </div>
                  )}

                  {/* Shipping Breakdown */}
                  {shop.data.breakdown && (
                    <div className="bg-gray-50 rounded p-3 text-xs space-y-1">
                      <div className="grid grid-cols-2 gap-2">
                        <span>Base Rate:</span>
                        <span>₹{shop.data.breakdown.baseRate?.toFixed(2)}</span>
                        <span>Distance Charge:</span>
                        <span>
                          ₹{shop.data.breakdown.distanceRate?.toFixed(2)}
                        </span>
                        {shop.data.breakdown.peakHourSurcharge !== "None" && (
                          <>
                            <span>Peak Hour Surcharge:</span>
                            <span>{shop.data.breakdown.peakHourSurcharge}</span>
                          </>
                        )}
                        {shop.data.breakdown.expressSurcharge !== "None" && (
                          <>
                            <span>Express Surcharge:</span>
                            <span>{shop.data.breakdown.expressSurcharge}</span>
                          </>
                        )}
                      </div>
                      {shop.data.breakdown.reason && (
                        <p className="text-green-600 font-medium mt-2">
                          {shop.data.breakdown.reason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-red-600">
                  <div className="flex items-center space-x-2 mb-2">
                    <FiAlertCircle className="w-4 h-4" />
                    <span className="font-medium">Shipping Not Available</span>
                  </div>
                  <p className="text-sm">{shop.error}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Warning for Errors */}
      {hasErrors && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FiAlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-800">
                Partial Shipping Calculation
              </h4>
              <p className="text-orange-700 text-sm mt-1">
                Some suppliers don't deliver to your area. Only items from
                available suppliers are included in shipping cost.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingBreakdown;
