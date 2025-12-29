import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { MdDiscount } from "react-icons/md";
import { BiRupee } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const AdvertisementPricing = () => {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const { data } = await axios.get(`${server}/advertisement/pricing`, {
        withCredentials: true,
      });
      console.log("Pricing data:", data); // Debug log
      setPricing(data.pricing || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pricing:", error);
      setLoading(false);
    }
  };

  const adTypeDetails = {
    leaderboard: {
      description: "Top banner across the page",
      size: "728x120px",
      position: "Top of homepage",
      visibility: "Very High",
    },
    top_sidebar_ad: {
      description: "Sidebar banner at the top",
      size: "200x120px",
      position: "Top sidebar",
      visibility: "High",
    },
    right_sidebar_top: {
      description: "Right sidebar top position",
      size: "300x200px",
      position: "Right sidebar top",
      visibility: "High",
    },
    right_sidebar_middle: {
      description: "Right sidebar middle position",
      size: "300x200px",
      position: "Right sidebar middle",
      visibility: "Medium",
    },
    right_sidebar_bottom: {
      description: "Right sidebar bottom position",
      size: "300x200px",
      position: "Right sidebar bottom",
      visibility: "Medium",
    },
    featured_store: {
      description: "Feature your store prominently",
      size: "Store Card",
      position: "Featured stores section",
      visibility: "Very High",
    },
    featured_product: {
      description: "Feature your product prominently",
      size: "Product Card",
      position: "Featured products section",
      visibility: "Very High",
    },
    newsletter_ad: {
      description: "Advertise in email newsletters",
      size: "Email Banner",
      position: "Newsletter emails",
      visibility: "High",
    },
    editorial_feature: {
      description: "Editorial content featuring your brand",
      size: "Article",
      position: "Blog/Editorial section",
      visibility: "Very High",
    },
  };

  const durationDiscounts = [
    { months: 1, discount: 0, label: "1 Month" },
    { months: 3, discount: 10, label: "3 Months" },
    { months: 6, discount: 15, label: "6 Months" },
    { months: 12, discount: 20, label: "12 Months" },
  ];

  const calculatePrice = (basePrice, months) => {
    const discount =
      durationDiscounts.find((d) => d.months === months)?.discount || 0;
    const discountAmount = (basePrice * discount) / 100;
    const totalPrice = basePrice - discountAmount;
    return {
      basePrice: basePrice * months,
      discount: discountAmount * months,
      totalPrice: totalPrice * months,
    };
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <h1 className="text-4xl font-bold mb-3">
            Advertisement Pricing Plans
          </h1>
          <p className="text-lg text-blue-100 mb-4">
            Boost your visibility with our flexible advertising options
          </p>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <MdDiscount size={20} />
              <span>Save up to 20% on annual plans</span>
            </div>
            <div className="flex items-center space-x-2">
              <AiOutlineInfoCircle size={20} />
              <span>Auto-renewal available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Duration Discount Table */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <MdDiscount className="mr-2 text-green-600" size={28} />
            Duration Discounts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {durationDiscounts.map((duration) => (
              <div
                key={duration.months}
                className={`p-4 rounded-lg border-2 ${
                  duration.discount > 0
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">
                    {duration.label}
                  </div>
                  <div
                    className={`text-3xl font-bold mt-2 ${
                      duration.discount > 0 ? "text-green-600" : "text-gray-600"
                    }`}
                  >
                    {duration.discount}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {duration.discount > 0 ? "Discount" : "No Discount"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Advertisement Types & Pricing
        </h2>
        {pricing.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600">
              No pricing information available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pricing
              .map((item) => {
                if (!item || !item.adType) {
                  console.warn("Invalid pricing item:", item);
                  return null;
                }
                const details = adTypeDetails[item.adType] || {
                  description: "Advertisement placement",
                  size: "Standard",
                  position: "Various positions",
                  visibility: "Medium",
                };
                return (
                  <div
                    key={item.adType}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                      <h3 className="text-2xl font-bold mb-2">
                        {item.adType
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </h3>
                      <p className="text-blue-100 mb-3">
                        {details.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-semibold">Size:</span>{" "}
                          {details.size}
                        </div>
                        <div className="bg-white/20 px-3 py-1 rounded-full">
                          {details.visibility} Visibility
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      {/* Base Price */}
                      <div className="mb-6 pb-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 font-medium">
                            Base Price (per month)
                          </span>
                          <div className="flex items-center text-3xl font-bold text-gray-800">
                            <BiRupee />
                            <span>
                              {item.basePrice?.toLocaleString() || "0"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Duration Pricing Table */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-700 mb-3">
                          Total Cost by Duration:
                        </h4>
                        {durationDiscounts.map((duration) => {
                          const prices = calculatePrice(
                            item.basePrice || 0,
                            duration.months
                          );
                          return (
                            <div
                              key={duration.months}
                              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors"
                            >
                              <div>
                                <div className="font-semibold text-gray-800">
                                  {duration.label}
                                </div>
                                {duration.discount > 0 && (
                                  <div className="text-sm text-green-600 font-medium">
                                    Save {duration.discount}% (₹
                                    {prices.discount.toLocaleString()})
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                {duration.discount > 0 && (
                                  <div className="text-sm text-gray-500 line-through">
                                    ₹{prices.basePrice.toLocaleString()}
                                  </div>
                                )}
                                <div className="text-xl font-bold text-blue-600 flex items-center">
                                  <BiRupee />
                                  <span>
                                    {prices.totalPrice.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Call to Action */}
                      <button
                        onClick={() =>
                          navigate(
                            `/dashboard-create-advertisement?type=${item.adType}`
                          )
                        }
                        className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Create{" "}
                        {item.adType
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}{" "}
                        Ad
                      </button>
                    </div>
                  </div>
                );
              })
              .filter(Boolean)}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AiOutlineInfoCircle
              className="text-blue-600 flex-shrink-0 mt-1"
              size={24}
            />
            <div>
              <h3 className="font-bold text-gray-800 mb-2">
                Important Information
              </h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>
                  • All advertisements require admin approval before going live
                </li>
                <li>• Rotation time for banner ads is 10 seconds</li>
                <li>
                  • Auto-renewal can be enabled to avoid service interruption
                </li>
                <li>• Payment is required upfront before approval</li>
                <li>• Analytics tracking available for all ad types</li>
                <li>
                  • Longer durations offer better savings (up to 20% for annual
                  plans)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertisementPricing;
