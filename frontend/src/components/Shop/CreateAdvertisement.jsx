import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { AiOutlineClose } from "react-icons/ai";
import { BsInfoCircle } from "react-icons/bs";

const CreateAdvertisement = () => {
  const { seller } = useSelector((state) => state.seller);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedType = searchParams.get('type');

  const [adType, setAdType] = useState(preselectedType || "leaderboard");
  const [slotNumber, setSlotNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(1);
  const [autoRenew, setAutoRenew] = useState(true);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Ad type information
  const adTypes = {
    leaderboard: { name: "Leaderboard", size: "728×120", price: 600, hasSlots: true },
    top_sidebar: { name: "Top Sidebar", size: "200×120", price: 200, hasSlots: true },
    right_sidebar_top: { name: "Right Sidebar Top", size: "300×200", price: 300, hasSlots: true },
    right_sidebar_middle: { name: "Right Sidebar Middle", size: "300×200", price: 250, hasSlots: true },
    right_sidebar_bottom: { name: "Right Sidebar Bottom", size: "300×200", price: 200, hasSlots: true },
    featured_store: { name: "Featured Store", size: "N/A", price: 100, hasSlots: false },
    featured_product: { name: "Featured Product", size: "N/A", price: 50, hasSlots: false },
    newsletter_inclusion: { name: "Newsletter Inclusion", size: "N/A", price: 100, hasSlots: false },
    editorial_writeup: { name: "Editorial Write-up", size: "N/A", price: 300, hasSlots: false },
  };

  // Set ad type from URL parameter on mount
  useEffect(() => {
    if (preselectedType && adTypes[preselectedType]) {
      setAdType(preselectedType);
    }
  }, [preselectedType]);

  // Calculate pricing when ad type or duration changes
  useEffect(() => {
    calculatePrice();
    if (adTypes[adType]?.hasSlots) {
      fetchAvailableSlots();
    }
  }, [adType, duration]);

  const calculatePrice = async () => {
    try {
      const { data } = await axios.post(`${server}/advertisement/calculate-price`, {
        adType,
        duration: parseInt(duration),
      });

      if (data.success) {
        setPricing(data.pricing);
      }
    } catch (error) {
      console.error("Error calculating price:", error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const { data } = await axios.get(`${server}/advertisement/available-slots/${adType}`);
      
      if (data.success && data.availableSlots) {
        setAvailableSlots(data.availableSlots);
        if (data.availableSlots.length > 0) {
          setSlotNumber(data.availableSlots[0].toString());
        }
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (adTypes[adType].hasSlots && !slotNumber) {
      toast.error("Please select a slot number");
      return;
    }

    if (!image) {
      toast.error("Please upload an ad image");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("adType", adType);
      if (adTypes[adType].hasSlots) {
        formData.append("slotNumber", slotNumber);
      }
      formData.append("title", title);
      formData.append("description", description);
      formData.append("duration", duration);
      formData.append("autoRenew", autoRenew);
      formData.append("image", image);

      const { data } = await axios.post(
        `${server}/advertisement/create`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (data.success) {
        toast.success("Advertisement created! Redirecting to payment...");
        
        // Redirect to payment page with advertisement ID
        setTimeout(() => {
          navigate(`/dashboard-advertisement-payment/${data.advertisement._id}`);
        }, 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create advertisement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-8 pt-1 mt-10 bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-800">Create New Advertisement</h2>
        <p className="text-sm text-gray-500 mt-1">
          Promote your store to thousands of customers
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Ad Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Advertisement Type *
              </label>
              <select
                value={adType}
                onChange={(e) => setAdType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {Object.entries(adTypes).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.name} - {info.size} - ${info.price}/month
                  </option>
                ))}
              </select>
            </div>

            {/* Slot Number (for banner types) */}
            {adTypes[adType].hasSlots && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slot Number * {loadingSlots && <span className="text-xs text-gray-500">(Loading...)</span>}
                </label>
                {availableSlots.length > 0 ? (
                  <select
                    value={slotNumber}
                    onChange={(e) => setSlotNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        Slot {slot}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    ⚠️ No slots available for this ad type. Please try another type.
                  </div>
                )}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ad Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="Enter catchy ad title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <div className="text-xs text-gray-500 mt-1">{title.length}/100 characters</div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Describe your advertisement"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="text-xs text-gray-500 mt-1">{description.length}/500 characters</div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration *
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={1}>1 Month (0% discount)</option>
                <option value={3}>3 Months (10% discount)</option>
                <option value={6}>6 Months (15% discount)</option>
                <option value={12}>12 Months (20% discount)</option>
              </select>
            </div>

            {/* Auto-Renew */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="autoRenew"
                checked={autoRenew}
                onChange={(e) => setAutoRenew(e.target.checked)}
                className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="autoRenew" className="ml-3">
                <span className="block text-sm font-semibold text-gray-700">Enable Auto-Renewal</span>
                <span className="block text-xs text-gray-500">
                  Automatically renew this ad when it expires (recommended)
                </span>
              </label>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ad Image * ({adTypes[adType].size})
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-auto rounded mx-auto"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <AiOutlineClose />
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      id="adImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="adImage"
                      className="cursor-pointer inline-flex flex-col items-center"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                        Click to upload image
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 500KB
                      </span>
                    </label>
                  </div>
                )}
              </div>
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start">
                  <BsInfoCircle className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <strong>Image Requirements:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Exact dimensions: {adTypes[adType].size} pixels</li>
                      <li>Formats: JPG or PNG</li>
                      <li>Max file size: 500KB</li>
                      <li>High quality, clear images work best</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Summary */}
            {pricing && (
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-300 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Pricing Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Price (per month):</span>
                    <span className="font-semibold">${pricing.basePrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">{pricing.duration} month(s)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">${pricing.totalMonthlyPrice}</span>
                  </div>
                  {pricing.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({pricing.discount}%):</span>
                      <span className="font-semibold">-${pricing.discountAmount}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-primary-300 pt-2 mt-2">
                    <div className="flex justify-between text-lg">
                      <span className="font-bold text-gray-800">Total:</span>
                      <span className="font-bold text-primary-600">${pricing.totalPrice}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-600 bg-white/50 rounded p-2">
                  💡 Save more with longer durations! 12 months gets you 20% off.
                </div>
              </div>
            )}

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-bold text-yellow-800 mb-2">📋 Important Notes</h4>
              <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                <li>All ads require admin approval before going live</li>
                <li>Ads link directly to your store only</li>
                <li>Banner ads rotate every 10 seconds</li>
                <li>Expiry warning sent 7 days before end date</li>
                <li>Payment is processed before approval</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/shop-dashboard?tab=advertisements")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (adTypes[adType].hasSlots && availableSlots.length === 0)}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating..." : "Create & Proceed to Payment"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateAdvertisement;
