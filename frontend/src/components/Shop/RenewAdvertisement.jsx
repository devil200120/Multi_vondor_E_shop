import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { MdOutlineAutorenew } from "react-icons/md";
import { BsInfoCircle } from "react-icons/bs";

const RenewAdvertisement = () => {
  const { seller } = useSelector((state) => state.seller);
  const navigate = useNavigate();
  const { id } = useParams();

  const [originalAd, setOriginalAd] = useState(null);
  const [duration, setDuration] = useState(1);
  const [autoRenew, setAutoRenew] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingAd, setLoadingAd] = useState(true);
  const [pricing, setPricing] = useState(null);
  const [hasAdPreApproval, setHasAdPreApproval] = useState(false);

  // Ad type information
  const adTypes = {
    leaderboard: { name: "Leaderboard", size: "728×120" },
    top_sidebar: { name: "Top Sidebar", size: "200×120" },
    right_sidebar_top: { name: "Right Sidebar Top", size: "300×200" },
    right_sidebar_middle: { name: "Right Sidebar Middle", size: "300×200" },
    right_sidebar_bottom: { name: "Right Sidebar Bottom", size: "300×200" },
    featured_store: { name: "Featured Store", size: "N/A" },
    featured_product: { name: "Featured Product", size: "N/A" },
    newsletter_inclusion: { name: "Newsletter Inclusion", size: "N/A" },
    editorial_writeup: { name: "Editorial Write-up", size: "N/A" },
  };

  // Fetch original advertisement
  useEffect(() => {
    const fetchAd = async () => {
      try {
        setLoadingAd(true);
        const { data } = await axios.get(
          `${server}/advertisement/vendor/ad/${id}`,
          {
            withCredentials: true,
          }
        );

        if (data.success) {
          setOriginalAd(data.advertisement);
          setAutoRenew(data.advertisement.autoRenew);
        } else {
          toast.error("Advertisement not found");
          navigate("/dashboard-advertisements");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load advertisement"
        );
        navigate("/dashboard-advertisements");
      } finally {
        setLoadingAd(false);
      }
    };

    if (id) {
      fetchAd();
    }
  }, [id, navigate]);

  // Check if seller has Ad Pre-Approval feature (Gold plan)
  useEffect(() => {
    const checkAdPreApproval = async () => {
      try {
        const { data } = await axios.get(`${server}/shop/subscription-info`, {
          withCredentials: true,
        });
        if (data.success && data.subscription?.features?.adPreApproval) {
          setHasAdPreApproval(true);
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };
    checkAdPreApproval();
  }, []);

  // Calculate pricing when duration changes
  useEffect(() => {
    if (originalAd) {
      calculatePrice();
    }
  }, [duration, originalAd]);

  const calculatePrice = async () => {
    try {
      const { data } = await axios.post(
        `${server}/advertisement/calculate-price`,
        {
          adType: originalAd.adType,
          duration: parseInt(duration),
        }
      );

      if (data.success) {
        setPricing(data.pricing);
      }
    } catch (error) {
      console.error("Error calculating price:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { data } = await axios.post(
        `${server}/advertisement/vendor/renew/${id}`,
        {
          duration: parseInt(duration),
          autoRenew,
        },
        { withCredentials: true }
      );

      if (data.success) {
        if (pricing?.isFree) {
          // Check if ad was auto-approved (Gold plan + free mode)
          if (data.autoApproved) {
            toast.success(
              "🎉 Advertisement renewed and AUTO-APPROVED (Gold Plan FREE MODE)!"
            );
          } else {
            toast.success(
              "🎉 Advertisement renewed successfully (FREE MODE)! Awaiting admin approval."
            );
          }
          setTimeout(() => {
            navigate(`/dashboard-advertisements`);
          }, 1500);
        } else {
          // Paid ad - inform about auto-approval after payment
          if (hasAdPreApproval) {
            toast.success("Advertisement renewed! Redirecting to payment... (Auto-approval enabled)");
          } else {
            toast.success("Advertisement renewed! Redirecting to payment...");
          }
          setTimeout(() => {
            navigate(
              `/dashboard-advertisement-payment/${data.advertisement._id}`
            );
          }, 1500);
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to renew advertisement"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingAd) {
    return (
      <div className="w-full mx-8 pt-1 mt-10 bg-white rounded-lg shadow-md">
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!originalAd) {
    return (
      <div className="w-full mx-8 pt-1 mt-10 bg-white rounded-lg shadow-md">
        <div className="p-8 text-center">
          <p className="text-gray-600">Advertisement not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-8 pt-1 mt-10 bg-white rounded-lg shadow-md">
      <div className="p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <MdOutlineAutorenew className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Renew Advertisement
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Extend the duration of your existing ad campaign
              </p>
            </div>
          </div>
          {hasAdPreApproval && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-full shadow-lg">
              <span className="text-xl">⚡</span>
              <span className="text-sm font-bold uppercase tracking-wide">Auto-Approval Active</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Original Ad Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Original Advertisement
            </h3>

            {/* Ad Preview */}
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-200 mb-4">
                {originalAd.mediaType === "video" && originalAd.video?.url ? (
                  <video
                    src={originalAd.video.url}
                    className="w-full h-full object-cover"
                    controls
                    muted
                  />
                ) : originalAd.image?.url ? (
                  <img
                    src={originalAd.image.url}
                    alt={originalAd.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Media
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">
                  {originalAd.title}
                </h4>
                {originalAd.description && (
                  <p className="text-sm text-gray-600">
                    {originalAd.description}
                  </p>
                )}
              </div>
            </div>

            {/* Ad Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-600 font-semibold">Ad Type</p>
                <p className="text-sm font-bold text-gray-800">
                  {adTypes[originalAd.adType]?.name || originalAd.adType}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-purple-600 font-semibold">
                  Original Duration
                </p>
                <p className="text-sm font-bold text-gray-800">
                  {originalAd.duration} month(s)
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-xs text-orange-600 font-semibold">Status</p>
                <p className="text-sm font-bold text-gray-800 capitalize">
                  {originalAd.status}
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-xs text-red-600 font-semibold">Expired On</p>
                <p className="text-sm font-bold text-gray-800">
                  {new Date(originalAd.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Performance Summary
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {originalAd.views || 0}
                  </p>
                  <p className="text-xs text-gray-500">Views</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {originalAd.clicks || 0}
                  </p>
                  <p className="text-xs text-gray-500">Clicks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {originalAd.clickThroughRate?.toFixed(2) || 0}%
                  </p>
                  <p className="text-xs text-gray-500">CTR</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Renewal Options */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Renewal Options
            </h3>

            {/* New Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Duration *
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value={1}>1 Month (0% discount)</option>
                <option value={3}>3 Months (10% discount)</option>
                <option value={6}>6 Months (15% discount)</option>
                <option value={12}>12 Months (20% discount)</option>
              </select>
            </div>

            {/* Auto-Renew */}
            <div className="flex items-start p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="autoRenew"
                checked={autoRenew}
                onChange={(e) => setAutoRenew(e.target.checked)}
                className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="autoRenew" className="ml-3">
                <span className="block text-sm font-semibold text-gray-700">
                  Enable Auto-Renewal
                </span>
                <span className="block text-xs text-gray-500">
                  Automatically renew this ad when it expires
                </span>
              </label>
            </div>

            {/* Pricing Summary */}
            {pricing && (
              <div
                className={`border-2 rounded-lg p-6 ${
                  pricing.isFree
                    ? "bg-gradient-to-br from-green-50 to-green-100 border-green-400"
                    : "bg-gradient-to-br from-green-50 to-emerald-100 border-green-300"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    Renewal Cost
                  </h3>
                  {pricing.isFree && (
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                      🎁 FREE MODE
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Base Price (per month):
                    </span>
                    <span
                      className={`font-semibold ${
                        pricing.isFree ? "line-through text-gray-400" : ""
                      }`}
                    >
                      ${pricing.basePrice}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">
                      {pricing.duration} month(s)
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span
                      className={`font-semibold ${
                        pricing.isFree ? "line-through text-gray-400" : ""
                      }`}
                    >
                      ${pricing.totalMonthlyPrice}
                    </span>
                  </div>
                  {pricing.discount > 0 && !pricing.isFree && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({pricing.discount}%):</span>
                      <span className="font-semibold">
                        -${pricing.discountAmount}
                      </span>
                    </div>
                  )}
                  <div className="border-t-2 border-green-300 pt-2 mt-2">
                    <div className="flex justify-between text-lg">
                      <span className="font-bold text-gray-800">Total:</span>
                      {pricing.isFree ? (
                        <span className="font-bold text-green-600 text-xl">
                          FREE!
                        </span>
                      ) : (
                        <span className="font-bold text-green-600">
                          ${pricing.totalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {pricing.isFree ? (
                  <div className="mt-4 text-xs text-green-700 bg-white/70 rounded p-2">
                    🎉 <strong>Testing Mode Active!</strong> No payment
                    required.
                  </div>
                ) : (
                  <div className="mt-4 text-xs text-gray-600 bg-white/50 rounded p-2">
                    💡 Save more with longer durations! 12 months gets you 20%
                    off.
                  </div>
                )}
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <BsInfoCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-blue-800 mb-2">
                    What happens when you renew?
                  </h4>
                  <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                    <li>
                      A new advertisement is created with the same content
                    </li>
                    <li>Your ad type and slot remain the same</li>
                    <li>Performance stats reset for the new period</li>
                    {hasAdPreApproval ? (
                      <li className="text-amber-600 font-semibold">⚡ Your ad will be auto-approved (Gold Plan)</li>
                    ) : (
                      <li>Admin approval may be required</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/dashboard-advertisements")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 text-white rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors ${
                pricing?.isFree
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading
                ? "Processing..."
                : pricing?.isFree
                ? "Renew Ad (Free)"
                : "Renew & Proceed to Payment"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RenewAdvertisement;
