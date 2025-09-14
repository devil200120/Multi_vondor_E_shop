import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";

const BanProtection = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const [isBanned, setIsBanned] = useState(false);
  const [banDetails, setBanDetails] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      checkBanStatus();
    } else {
      setChecking(false);
    }
  }, [isAuthenticated, user]);

  const checkBanStatus = async () => {
    try {
      const { data } = await axios.get(`${server}/user/ban-status`, {
        withCredentials: true,
      });

      if (data.success && data.isBanned) {
        setIsBanned(true);
        setBanDetails(data);
      }
    } catch (error) {
      console.error("Error checking ban status:", error);
      // If the request fails due to authentication error (user is banned),
      // we still want to block access
      if (
        error.response?.status === 403 &&
        error.response?.data?.message?.includes("banned")
      ) {
        setIsBanned(true);
        setBanDetails({
          isBanned: true,
          banReason:
            error.response.data.banReason || "Your account has been banned",
          bannedAt: error.response.data.bannedAt || new Date().toISOString(),
        });
      }
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = () => {
    // Clear local storage and redirect to home
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  // Show loading while checking
  if (checking) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            Checking account status...
          </h2>
        </div>
      </div>
    );
  }

  // If user is banned, show ban message instead of the protected content
  if (isBanned && banDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
          {/* Header */}
          <div className="bg-red-500 text-white px-6 py-4 rounded-t-lg">
            <div className="flex items-center">
              <svg
                className="w-8 h-8 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <h2 className="text-xl font-bold">Access Denied</h2>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="text-center mb-6">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636"
                  />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your Account Has Been Banned
              </h3>

              <p className="text-gray-600 mb-4">
                Your account has been suspended by the administrator and you
                cannot access this content.
              </p>
            </div>

            {/* Ban Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Ban Details:</h4>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Reason:</span>
                  <p className="text-gray-600 mt-1">
                    {banDetails.banReason || "No specific reason provided"}
                  </p>
                </div>

                {banDetails.bannedAt && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Banned On:
                    </span>
                    <p className="text-gray-600">
                      {new Date(banDetails.bannedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Support Contact */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">Need Help?</h4>
              <p className="text-blue-700 text-sm">
                If you believe this ban was issued in error, please contact our
                support team for assistance.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If not banned, render the protected content
  return children;
};

export default BanProtection;
