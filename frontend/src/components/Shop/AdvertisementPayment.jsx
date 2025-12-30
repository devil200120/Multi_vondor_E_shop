import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";

// PayPal Button wrapper with loading state
const PayPalButtonWrapper = ({
  advertisement,
  onPaymentSuccess,
  hasAdPreApproval,
}) => {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  const [processing, setProcessing] = useState(false);

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          description: `Advertisement: ${advertisement.title} - ${advertisement.adType}`,
          amount: {
            currency_code: "USD",
            value: advertisement.totalPrice.toFixed(2),
          },
        },
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING",
      },
    });
  };

  const onApprove = async (data, actions) => {
    try {
      setProcessing(true);
      const order = await actions.order.capture();

      // Process payment on backend
      const response = await axios.post(
        `${server}/advertisement/process-payment`,
        {
          advertisementId: advertisement._id,
          paymentId: order.id,
          paymentMethod: "paypal",
          paymentDetails: order,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Check if ad was auto-approved (Gold plan)
        if (response.data.autoApproved) {
          toast.success(
            "Payment successful! Your ad is now ACTIVE (Auto-Approved via Gold Plan)!"
          );
        } else {
          toast.success(
            "Payment successful! Your ad is pending admin approval."
          );
        }
        onPaymentSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  const onError = (err) => {
    console.error("PayPal Error:", err);
    toast.error("Payment failed. Please try again.");
  };

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
        <span className="text-gray-600">Loading PayPal...</span>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">
          Failed to load PayPal. Please refresh the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mb-3"></div>
        <span className="text-gray-600">Processing payment...</span>
      </div>
    );
  }

  return (
    <PayPalButtons
      style={{
        layout: "vertical",
        color: "blue",
        shape: "rect",
        label: "pay",
        height: 50,
      }}
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onError}
      forceReRender={[advertisement.totalPrice]}
    />
  );
};

const AdvertisementPayment = () => {
  const { advertisementId } = useParams();
  const { seller } = useSelector((state) => state.seller);
  const navigate = useNavigate();

  const [advertisement, setAdvertisement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAdPreApproval, setHasAdPreApproval] = useState(false);

  useEffect(() => {
    fetchAdvertisement();
  }, [advertisementId]);

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

  const fetchAdvertisement = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${server}/advertisement/vendor/my-ads`,
        { withCredentials: true }
      );

      const ad = data.advertisements?.find((a) => a._id === advertisementId);
      if (ad) {
        setAdvertisement(ad);
      } else {
        toast.error("Advertisement not found");
        navigate("/dashboard-advertisements");
      }
    } catch (error) {
      toast.error("Failed to load advertisement");
      navigate("/dashboard-advertisements");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setTimeout(() => {
      navigate("/dashboard-advertisements");
    }, 2000);
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!advertisement) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <p className="text-gray-600">Advertisement not found</p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture",
      }}
    >
      <div className="w-full mx-auto max-w-6xl px-4 pt-6 mt-10">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600">
            <h2 className="text-2xl font-bold text-white">Complete Payment</h2>
            <p className="text-blue-100 mt-1">
              Pay for your advertisement to submit for approval
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left - Advertisement Details */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Advertisement Details
                  </h3>

                  {advertisement.image?.url && (
                    <div className="mb-4">
                      <img
                        src={advertisement.image.url}
                        alt={advertisement.title}
                        className="w-full h-auto rounded-lg border-2 border-gray-200 shadow-sm"
                      />
                    </div>
                  )}

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-blue-100">
                      <span className="text-gray-600">Title:</span>
                      <span className="font-semibold text-gray-800">
                        {advertisement.title}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-blue-100">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-semibold text-gray-800">
                        {advertisement.adType
                          ?.split("_")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-blue-100">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold text-gray-800">
                        {advertisement.duration} month(s)
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-blue-100">
                      <span className="text-gray-600">Base Price:</span>
                      <span className="font-semibold text-gray-800">
                        ${advertisement.basePrice}/month
                      </span>
                    </div>
                    {advertisement.discount > 0 && (
                      <div className="flex justify-between py-2 border-b border-blue-100 text-green-600">
                        <span>Discount:</span>
                        <span className="font-semibold">
                          {advertisement.discount}%
                        </span>
                      </div>
                    )}
                    <div className="pt-3 mt-2">
                      <div className="flex justify-between text-xl">
                        <span className="font-bold text-gray-800">Total:</span>
                        <span className="font-bold text-blue-600">
                          ${advertisement.totalPrice?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-yellow-800 mb-2 flex items-center">
                    <span className="mr-2">⚠️</span> Payment Notice
                  </h4>
                  <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                    <li>Payment is non-refundable once approved</li>
                    {hasAdPreApproval ? (
                      <li className="text-green-700 font-medium">
                        ⚡ Your ad will be auto-approved (Gold Plan)
                      </li>
                    ) : (
                      <li>Ads require admin approval (1-2 business days)</li>
                    )}
                    <li>Refund issued if admin rejects your ad</li>
                    <li>
                      Auto-renewal{" "}
                      {advertisement.autoRenew ? "ENABLED" : "DISABLED"}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right - Payment Form */}
              <div className="space-y-4">
                {hasAdPreApproval && (
                  <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl p-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">⚡</span>
                      <div>
                        <h4 className="font-bold">Gold Plan Auto-Approval</h4>
                        <p className="text-sm opacity-90">
                          Your ad will be automatically approved after payment!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">💳</span> Pay with PayPal
                  </h3>

                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Click the PayPal button below to securely pay{" "}
                      <strong>${advertisement.totalPrice?.toFixed(2)}</strong>{" "}
                      for your advertisement.
                    </p>
                  </div>

                  <PayPalButtonWrapper
                    advertisement={advertisement}
                    onPaymentSuccess={handlePaymentSuccess}
                    hasAdPreApproval={hasAdPreApproval}
                  />
                </div>

                {/* Security Notice */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="text-xs text-green-800">
                      <strong>Secure Payment</strong>
                      <p className="mt-1">
                        Your payment is processed securely through PayPal. We
                        never store your payment details.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cancel Button */}
                <button
                  onClick={() => navigate("/dashboard-advertisements")}
                  className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel & Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default AdvertisementPayment;
