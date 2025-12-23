import React, { useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";

const PhonePeFailedPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const transactionId = searchParams.get("transactionId");
  const reason = searchParams.get("reason");
  const error = searchParams.get("error");

  useEffect(() => {
    // Clean up temporary data
    localStorage.removeItem("tempOrderData");
    localStorage.removeItem("tempPhonePeTransaction");

    // Show error message
    if (reason) {
      toast.error(`Payment failed: ${decodeURIComponent(reason)}`);
    } else if (error) {
      toast.error(`Payment error: ${decodeURIComponent(error)}`);
    } else {
      toast.error("Payment was cancelled or failed");
    }
  }, [reason, error]);

  const handleRetryPayment = () => {
    // Redirect back to checkout page
    navigate("/checkout");
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 rounded-full p-3">
                <svg
                  className="w-12 h-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h2>

            <p className="text-gray-600 mb-6">
              Your PhonePe payment could not be processed successfully.
            </p>

            {transactionId && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">
                  <strong>Transaction ID:</strong> {transactionId}
                </p>
                {reason && (
                  <p className="text-sm text-red-800 mt-1">
                    <strong>Reason:</strong> {decodeURIComponent(reason)}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleRetryPayment}
                className="w-full bg-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                Try Again
              </button>

              <button
                onClick={handleContinueShopping}
                className="w-full bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Continue Shopping
              </button>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Need Help?
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Check your internet connection</p>
                <p>• Ensure sufficient balance in your account</p>
                <p>• Try using a different payment method</p>
                <p>• Contact our support team if the issue persists</p>
              </div>

              <Link
                to="/contact"
                className="inline-block mt-4 text-purple-600 hover:text-purple-800 font-medium"
              >
                Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PhonePeFailedPage;
