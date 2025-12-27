import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { server } from "../server";
import { toast } from "react-toastify";
import { HiCheckCircle } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const SubscriptionSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activating, setActivating] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const activateSubscription = async () => {
      const token = searchParams.get("token");
      const subscriptionId = localStorage.getItem("pendingSubscriptionId");

      if (!token || !subscriptionId) {
        toast.error("Invalid payment session");
        navigate("/dashboard");
        return;
      }

      try {
        const { data } = await axios.post(
          `${server}/subscription/activate-subscription`,
          { orderId: token, subscriptionId },
          { withCredentials: true }
        );

        if (data.success) {
          setSuccess(true);
          localStorage.removeItem("pendingSubscriptionId");
          toast.success("Subscription activated successfully!");

          setTimeout(() => {
            navigate("/dashboard-subscription");
          }, 3000);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to activate subscription"
        );
        navigate("/dashboard-subscription");
      } finally {
        setActivating(false);
      }
    };

    activateSubscription();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
        {activating ? (
          <>
            <AiOutlineLoading3Quarters className="animate-spin text-6xl text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Activating Your Subscription
            </h2>
            <p className="text-gray-600">
              Please wait while we process your payment...
            </p>
          </>
        ) : success ? (
          <>
            <HiCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Subscription Activated!
            </h2>
            <p className="text-gray-600 mb-4">
              Your subscription has been successfully activated.
            </p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </>
        ) : (
          <>
            <div className="text-6xl text-red-500 mx-auto mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Activation Failed
            </h2>
            <p className="text-gray-600">
              We couldn't activate your subscription. Please try again.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;
