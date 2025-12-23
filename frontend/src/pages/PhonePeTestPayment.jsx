import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const PhonePeTestPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const transactionId = searchParams.get("transactionId");
  const amount = searchParams.get("amount");

  const handleTestPaymentSuccess = () => {
    setLoading(true);

    // Simulate PhonePe payment processing
    setTimeout(() => {
      // Redirect to success page with transaction details
      navigate(
        `/phonepe/success?transactionId=${transactionId}&amount=${amount}&status=success`
      );
      toast.success("Test payment completed successfully!");
    }, 2000);
  };

  const handleTestPaymentFailure = () => {
    // Redirect to failure page
    navigate(`/phonepe/failed?transactionId=${transactionId}&status=failed`);
    toast.error("Test payment cancelled");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              PhonePe Test Payment
            </h1>
            <p className="text-gray-600">
              This is a simulated PhonePe payment for testing purposes
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-xs">{transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">
                  ₹{(amount / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mode:</span>
                <span className="text-orange-600 font-medium">TEST MODE</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleTestPaymentSuccess}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                "✅ Simulate Successful Payment"
              )}
            </button>

            <button
              onClick={handleTestPaymentFailure}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              ❌ Simulate Payment Failure
            </button>
          </div>

          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> This is a test environment. No real money
              will be charged. Use this to test your payment flow before going
              live with actual PhonePe credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhonePeTestPayment;
