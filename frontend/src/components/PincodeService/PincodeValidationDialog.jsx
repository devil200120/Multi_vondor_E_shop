import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  FiMapPin,
  FiCheck,
  FiX,
  FiLoader,
  FiTruck,
  FiAlertCircle,
  FiPackage,
  FiClock,
} from "react-icons/fi";

const PincodeValidationDialog = ({
  show,
  onClose,
  onValidationResult,
  userAddresses = [],
  productName = "this product",
  productId = null,
}) => {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false); // eslint-disable-line
  const [validationResult, setValidationResult] = useState(null);
  const [isValid, setIsValid] = useState(null);
  const [step, setStep] = useState("initial"); // 'initial', 'checking', 'result'
  const [closingAnimation, setClosingAnimation] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);

  const checkPincodeDelivery = useCallback(
    async (pincodeValue, isAutoCheck = false) => {
      if (!pincodeValue || pincodeValue.length !== 6) {
        setIsValid(false);
        setValidationResult(null);
        setStep("initial");
        return;
      }

      setLoading(true);
      setStep("checking");

      try {
        // Use product-specific validation if productId is provided
        const endpoint = productId
          ? `${server}/pincode/check-product/${pincodeValue}/${productId}`
          : `${server}/pincode/check/${pincodeValue}`;

        const response = await axios.get(endpoint);

        if (response.data.success && response.data.deliveryAvailable) {
          setIsValid(true);
          setValidationResult(response.data.data);
          setStep("result");

          if (onValidationResult) {
            onValidationResult({
              isValid: true,
              data: response.data.data,
              pincode: pincodeValue,
            });
          }

          if (!isAutoCheck) {
            toast.success("Great! We deliver to your area 🎉");
          }
        } else {
          setIsValid(false);
          setValidationResult({
            message:
              response.data.message || "Delivery not available to this area",
            pincode: pincodeValue,
          });
          setStep("result");

          if (onValidationResult) {
            onValidationResult({
              isValid: false,
              data: response.data.data,
              pincode: pincodeValue,
              message: response.data.message,
            });
          }

          if (!isAutoCheck) {
            toast.error(
              response.data.message || "Sorry, we don't deliver to this area"
            );
          }
        }
      } catch (error) {
        console.error("Pincode validation error:", error);
        setIsValid(false);
        setValidationResult({
          message: "Unable to check delivery. Please try again.",
          pincode: pincodeValue,
        });
        setStep("result");

        if (!isAutoCheck) {
          toast.error("Error checking pincode. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [onValidationResult, productId]
  );

  // Handle entrance animation
  useEffect(() => {
    if (show) {
      setIsAnimatingIn(true);
      // Use requestAnimationFrame for smoother timing
      const timer = requestAnimationFrame(() => {
        setTimeout(() => {
          setIsAnimatingIn(false);
        }, 50); // Reduced delay for faster transition
      });
      return () => cancelAnimationFrame(timer);
    }
  }, [show]);

  // Check if user has a valid Karnataka address
  useEffect(() => {
    if (show && userAddresses && userAddresses.length > 0) {
      // Find default address or first address
      const primaryAddress =
        userAddresses.find((addr) => addr.addressType === "default") ||
        userAddresses[0];

      if (primaryAddress?.zipCode) {
        const userPincode = primaryAddress.zipCode.toString();
        setPincode(userPincode);
        setStep("checking");
        checkPincodeDelivery(userPincode, true); // Auto-check
      }
    }
  }, [show, userAddresses, checkPincodeDelivery]);

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      setPincode(value);
      if (isValid !== null) {
        setIsValid(null);
        setValidationResult(null);
        setStep("initial");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pincode.length === 6) {
      checkPincodeDelivery(pincode);
    } else {
      toast.error("Please enter a valid 6-digit pincode");
    }
  };

  const handleClose = () => {
    setClosingAnimation(true);
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
      // Reset state
      setPincode("");
      setValidationResult(null);
      setIsValid(null);
      setStep("initial");
      setClosingAnimation(false);
      setIsAnimatingIn(false);
    }, 300); // Increased from 200ms to 300ms
  };

  const handleContinueShopping = () => {
    handleClose();
  };

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 bg-black flex items-center justify-center z-50 p-3 sm:p-4 transition-all duration-300 ${
        closingAnimation ? "bg-opacity-0" : "bg-opacity-60"
      }`}
      style={{
        backdropFilter: closingAnimation ? "blur(0px)" : "blur(4px)",
        transition:
          "backdrop-filter 300ms cubic-bezier(0.4, 0, 0.2, 1), background-color 300ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-3 transform transition-all duration-300 ${
          closingAnimation
            ? "scale-90 opacity-0 translate-y-4"
            : isAnimatingIn
            ? "scale-95 translate-y-2"
            : "scale-100 translate-y-0"
        }`}
        style={{
          transformOrigin: "center center",
          willChange: "transform, opacity",
          transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)", // Spring-like bounce effect
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-5 py-4 rounded-t-2xl">
          <div className="text-center">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mx-auto mb-2">
              <FiMapPin className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">
              Check Delivery
            </h2>
            <p className="text-blue-100 text-sm leading-tight">
              Enter your pincode to check if we deliver to your area
            </p>
          </div>

          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-7 h-7 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <FiX className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {step === "initial" && (
            <div className="space-y-4">
              {/* Product Info */}
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FiPackage className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-gray-600 text-sm leading-relaxed px-2">
                  Check if{" "}
                  <span className="font-semibold text-gray-800">
                    {productName}
                  </span>{" "}
                  is available for delivery in your area
                </p>
              </div>

              {/* Pincode Input Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={pincode}
                    onChange={handlePincodeChange}
                    placeholder="Enter 6-digit pincode"
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base font-mono text-center"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={pincode.length !== 6}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm"
                >
                  Check Delivery
                </button>
              </form>

              {/* Info */}
            </div>
          )}

          {step === "checking" && (
            <div className="space-y-3 text-center py-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto">
                <FiLoader className="w-5 h-5 text-blue-600 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">
                  Checking Delivery...
                </h3>
                <p className="text-gray-600 text-sm">
                  Validating pincode {pincode}
                </p>
              </div>
            </div>
          )}

          {step === "result" && (
            <div className="space-y-6">
              {isValid ? (
                // Success State
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FiCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    🎉 Great News!
                  </h3>
                  <p className="text-gray-600 mb-4">We deliver to your area</p>

                  {/* Delivery Details */}
                  {validationResult && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-700 font-medium">
                            Location:
                          </span>
                          <span className="text-green-800 text-right text-sm">
                            {validationResult.area}, {validationResult.district}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-700 font-medium flex items-center">
                            <FiClock className="w-3 h-3 mr-1" />
                            Delivery:
                          </span>
                          <span className="text-green-800">
                            {validationResult.estimatedDeliveryDays || "3-5"}{" "}
                            days
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-700 font-medium flex items-center">
                            <FiTruck className="w-3 h-3 mr-1" />
                            Shipping:
                          </span>
                          <span className="text-green-800">
                            ₹{validationResult.shippingCharge || "FREE"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleContinueShopping}
                    className="w-full py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                // Error State
                <div className="text-center">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <FiX className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800 mb-1">
                    Sorry!
                  </h3>
                  <p className="text-gray-600 mb-3 text-sm">
                    We don't deliver to this area yet
                  </p>

                  {/* Error Details */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                    <div className="flex items-start space-x-2">
                      <FiAlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-left">
                        <h4 className="font-medium text-red-800 text-sm">
                          Delivery Not Available
                        </h4>
                        <p className="text-red-700 text-sm mt-1 leading-relaxed">
                          {validationResult?.message ||
                            "We currently deliver only within Karnataka state. We're working to expand to more areas soon"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setPincode("");
                        setStep("initial");
                        setIsValid(null);
                        setValidationResult(null);
                      }}
                      className="w-full py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm"
                    >
                      Try Another Pincode
                    </button>
                    <button
                      onClick={handleClose}
                      className="w-full py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 text-sm"
                    >
                      Continue Browsing
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PincodeValidationDialog;
