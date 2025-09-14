import React, { useState, useEffect, useCallback } from "react";
import {
  FiTag,
  FiPercent,
  FiDollarSign,
  FiCheck,
  FiX,
  FiGift,
  FiArrowRight,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import axios from "axios";
import { server } from "../../server";

const CouponSuggestions = ({
  cart,
  onApplyCoupon,
  appliedCoupon,
  onRemoveCoupon,
}) => {
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchAvailableCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${server}/coupon/get-available-coupons`,
        {
          cart,
        }
      );

      if (response.data.success) {
        setAvailableCoupons(response.data.availableCoupons);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  }, [cart]);

  useEffect(() => {
    if (cart && cart.length > 0) {
      fetchAvailableCoupons();
    }
  }, [cart, fetchAvailableCoupons]);

  const handleApplyCoupon = (couponCode) => {
    onApplyCoupon(couponCode);
    setShowSuggestions(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const calculateDiscount = (coupon) => {
    const { value, maxAmount, applicableAmount } = coupon;

    // If value is percentage (assuming values > 100 are fixed amounts)
    if (value <= 100) {
      const percentageDiscount = (applicableAmount * value) / 100;
      return Math.min(percentageDiscount, maxAmount || percentageDiscount);
    }

    // If value is fixed amount
    return Math.min(value, applicableAmount);
  };

  const bestCoupon = availableCoupons.length > 0 ? availableCoupons[0] : null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiTag className="text-green-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-800">
            Available Coupons
          </h3>
          {availableCoupons.length > 0 && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {availableCoupons.length} available
            </span>
          )}
        </div>
        {availableCoupons.length > 0 && (
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            {showSuggestions ? "Hide" : "View All"}
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Finding best coupons...</span>
        </div>
      )}

      {/* Applied Coupon */}
      {appliedCoupon && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiCheck className="text-green-600" size={16} />
              <span className="font-medium text-green-800">
                Coupon "{appliedCoupon}" Applied!
              </span>
            </div>
            <button
              onClick={onRemoveCoupon}
              className="text-red-600 hover:text-red-800"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Best Coupon Suggestion */}
      {!appliedCoupon && bestCoupon && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <HiSparkles className="text-yellow-500" size={20} />
                <span className="text-sm font-medium text-blue-800">
                  Best Deal
                </span>
              </div>
              <div className="font-semibold text-gray-800 mb-1">
                {bestCoupon.name}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Save {formatCurrency(calculateDiscount(bestCoupon))} on{" "}
                {bestCoupon.shopName}
              </div>
              <div className="text-xs text-gray-500">
                {bestCoupon.minAmount && (
                  <>Min order: {formatCurrency(bestCoupon.minAmount)} • </>
                )}
                {bestCoupon.value <= 100
                  ? `${bestCoupon.value}% off`
                  : `${formatCurrency(bestCoupon.value)} off`}
              </div>
            </div>
            <button
              onClick={() => handleApplyCoupon(bestCoupon.name)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
            >
              Apply
              <FiArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* All Coupons List */}
      {showSuggestions && availableCoupons.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800 text-sm">
            All Available Coupons
          </h4>
          {availableCoupons.map((coupon, index) => (
            <div
              key={coupon._id}
              className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FiGift className="text-purple-600" size={16} />
                    <span className="font-medium text-gray-800">
                      {coupon.name}
                    </span>
                    {index === 0 && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        Best
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {coupon.shopName}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiPercent size={12} />
                      {coupon.value <= 100
                        ? `${coupon.value}%`
                        : formatCurrency(coupon.value)}
                    </span>
                    {coupon.minAmount && (
                      <span className="flex items-center gap-1">
                        <FiDollarSign size={12} />
                        Min: {formatCurrency(coupon.minAmount)}
                      </span>
                    )}
                    <span className="text-green-600 font-medium">
                      Save {formatCurrency(calculateDiscount(coupon))}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleApplyCoupon(coupon.name)}
                  disabled={appliedCoupon === coupon.name}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    appliedCoupon === coupon.name
                      ? "bg-green-100 text-green-800 cursor-not-allowed"
                      : "bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700"
                  }`}
                >
                  {appliedCoupon === coupon.name ? "Applied" : "Apply"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Coupons Available */}
      {!loading && availableCoupons.length === 0 && (
        <div className="text-center py-6">
          <FiTag className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-gray-500 text-sm">
            No coupons available for your current cart
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Add more items or check for shop-specific coupons
          </p>
        </div>
      )}
    </div>
  );
};

export default CouponSuggestions;
