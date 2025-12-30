import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { HiCheck, HiX, HiSparkles } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useCurrency } from "../../context/CurrencyContext";

const SubscriptionPlans = ({ isPublic = false }) => {
  const navigate = useNavigate();
  const { isSeller } = useSelector((state) => state.seller);
  const { formatPrice } = useCurrency();
  const [plans, setPlans] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchPlans();
    if (isSeller) {
      fetchCurrentSubscription();
    } else {
      setLoading(false);
    }
  }, [isSeller]);

  const fetchPlans = async () => {
    try {
      const { data } = await axios.get(`${server}/subscription/get-plans`);
      setPlans(data.plans);
    } catch (error) {
      toast.error("Failed to load subscription plans");
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const { data } = await axios.get(
        `${server}/subscription/my-subscription`,
        {
          withCredentials: true,
        }
      );
      setCurrentSubscription(data.subscription);
    } catch (error) {
      console.log("No active subscription");
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = (plan) => {
    if (!plans || !plans[plan]) return { totalBeforeDiscount: 0, discountAmount: 0, finalPrice: 0, discount: 0 };
    const planData = plans[plan];
    const monthlyPrice = planData.monthlyPrice;

    const months =
      billingCycle === "3-months"
        ? 3
        : billingCycle === "6-months"
        ? 6
        : billingCycle === "12-months"
        ? 12
        : 1;
    const discount =
      billingCycle === "3-months"
        ? 10
        : billingCycle === "6-months"
        ? 15
        : billingCycle === "12-months"
        ? 20
        : 0;

    const totalBeforeDiscount = monthlyPrice * months;
    const discountAmount = (totalBeforeDiscount * discount) / 100;
    const finalPrice = totalBeforeDiscount - discountAmount;

    return { totalBeforeDiscount, discountAmount, finalPrice, discount };
  };

  const handleSubscribe = async (plan) => {
    // If not a seller, redirect to login
    if (!isSeller) {
      toast.info("Please login as a seller to subscribe");
      navigate("/shop-login", { state: { redirectTo: "/shop/subscriptions" } });
      return;
    }

    setSelectedPlan(plan);
    setProcessingPayment(true);

    try {
      const { data } = await axios.post(
        `${server}/subscription/create-paypal-subscription`,
        { plan, billingCycle },
        { withCredentials: true }
      );

      if (data.success && data.approvalUrl) {
        // Store subscription ID for later activation
        localStorage.setItem("pendingSubscriptionId", data.subscription);
        // Redirect to PayPal
        window.location.href = data.approvalUrl;
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create subscription"
      );
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <AiOutlineLoading3Quarters className="animate-spin text-4xl text-primary-600" />
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Subscription Plan
          </h1>
          <p className="text-gray-600">
            Select the perfect plan for your business needs
          </p>
        </div>

        {/* Current Subscription */}
        {currentSubscription && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-800">
                  Active Subscription
                </h3>
                <p className="text-sm text-green-600">
                  {plans[currentSubscription.plan]?.name} Plan - Expires on{" "}
                  {new Date(currentSubscription.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  {formatPrice(currentSubscription.finalPrice)}
                </p>
                <p className="text-xs text-green-500">
                  {currentSubscription.billingCycle}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Billing Cycle Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-primary-200 bg-white p-1">
            {[
              { value: "monthly", label: "Monthly", discount: "0%" },
              { value: "3-months", label: "3 Months", discount: "10%" },
              { value: "6-months", label: "6 Months", discount: "15%" },
              { value: "12-months", label: "12 Months", discount: "20%" },
            ].map((cycle) => (
              <button
                key={cycle.value}
                onClick={() => setBillingCycle(cycle.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === cycle.value
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div>{cycle.label}</div>
                {cycle.discount !== "0%" && (
                  <div className="text-xs">{cycle.discount} off</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plans Grid */}
        {plans && Object.keys(plans).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(plans).map(([planKey, planData]) => (
              <PlanCard
                key={planKey}
                plan={planKey}
                planData={planData}
                pricing={calculatePrice(planKey)}
                billingCycle={billingCycle}
                onSubscribe={handleSubscribe}
                isProcessing={processingPayment && selectedPlan === planKey}
                isCurrent={currentSubscription?.plan === planKey}
                recommended={planKey === "silver"}
                isRevenueShare={planKey === "revenue-share"}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No subscription plans available at the moment.</p>
            <p className="text-gray-400 text-sm mt-2">Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const PlanCard = ({
  plan,
  planData,
  pricing,
  billingCycle,
  onSubscribe,
  isProcessing,
  isCurrent,
  recommended = false,
  isRevenueShare = false,
  formatPrice,
}) => {
  return (
    <div
      className={`relative bg-white rounded-xl shadow-lg p-6 border-2 ${
        recommended
          ? "border-primary-500"
          : isCurrent
          ? "border-green-500"
          : "border-gray-200"
      } hover:shadow-xl transition-shadow`}
    >
      {/* Recommended Badge */}
      {recommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <HiSparkles className="w-3 h-3" />
            Recommended
          </span>
        </div>
      )}

      {/* Current Badge */}
      {isCurrent && (
        <div className="absolute top-4 right-4">
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
            Current
          </span>
        </div>
      )}

      {/* Plan Name */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{planData.name}</h3>

      {/* Price */}
      <div className="mb-4">
        {isRevenueShare ? (
          <>
            <div className="text-3xl font-bold text-gray-900">
              10% Commission
            </div>
            <p className="text-sm text-gray-500">
              {formatPrice(25)} minimum/month
            </p>
          </>
        ) : (
          <>
            {pricing.discount > 0 && (
              <div className="text-lg text-gray-400 line-through">
                {formatPrice(pricing.totalBeforeDiscount)}
              </div>
            )}
            <div className="text-3xl font-bold text-gray-900">
              {formatPrice(pricing.finalPrice)}
            </div>
            <p className="text-sm text-gray-500">
              {billingCycle === "monthly" ? "per month" : `for ${billingCycle}`}
            </p>
            {pricing.discount > 0 && (
              <p className="text-sm text-green-600 font-medium">
                Save {formatPrice(pricing.discountAmount)} ({pricing.discount}%
                off)
              </p>
            )}
          </>
        )}
      </div>

      {/* Max Products */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <p className="text-gray-700 font-semibold">
          {planData.maxProducts === 999 ? "Unlimited" : planData.maxProducts}{" "}
          Products
        </p>
      </div>

      {/* Features */}
      <ul className="space-y-2 mb-6">
        {planData.features.businessProfile && (
          <FeatureItem text="Business Profile" />
        )}
        {planData.features.logo && <FeatureItem text="Logo Upload" />}
        {planData.features.pdfUpload && <FeatureItem text="PDF Upload" />}
        <FeatureItem
          text={`${planData.features.imagesPerProduct} Images/Product`}
        />
        {planData.features.videoOption ? (
          <FeatureItem text="Video Upload" />
        ) : (
          <FeatureItem text="Video Upload" disabled />
        )}
        {planData.features.contactSeller ? (
          <FeatureItem text="Contact Seller Button" />
        ) : (
          <FeatureItem text="Contact Seller Button" disabled />
        )}
        {planData.features.htmlCssEditor ? (
          <FeatureItem text="HTML/CSS Editor" />
        ) : (
          <FeatureItem text="HTML/CSS Editor" disabled />
        )}
        {planData.features.adPreApproval ? (
          <FeatureItem text="Ad Pre-Approval" />
        ) : (
          <FeatureItem text="Ad Pre-Approval" disabled />
        )}
      </ul>

      {/* Subscribe Button */}
      <button
        onClick={() => onSubscribe(plan)}
        disabled={isProcessing || isCurrent}
        className={`w-full py-3 rounded-lg font-semibold transition-colors ${
          isCurrent
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : recommended
            ? "bg-primary-600 text-white hover:bg-primary-700"
            : "bg-red-500 text-white hover:bg-red-600"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <AiOutlineLoading3Quarters className="animate-spin" />
            Processing...
          </span>
        ) : isCurrent ? (
          "Current Plan"
        ) : (
          "Subscribe Now"
        )}
      </button>
    </div>
  );
};

const FeatureItem = ({ text, disabled = false }) => {
  return (
    <li className="flex items-center gap-2">
      {disabled ? (
        <HiX className="w-4 h-4 text-gray-400" />
      ) : (
        <HiCheck className="w-4 h-4 text-green-500" />
      )}
      <span className={disabled ? "text-gray-400" : "text-gray-700"}>
        {text}
      </span>
    </li>
  );
};

export default SubscriptionPlans;
