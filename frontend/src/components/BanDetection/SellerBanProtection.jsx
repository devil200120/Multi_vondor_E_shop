import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { logoutSeller } from "../../redux/actions/user";

const SellerBanProtection = ({ children }) => {
  const { seller, isSeller, isLoading } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const [isBanned, setIsBanned] = useState(false);
  const [banDetails, setBanDetails] = useState(null);
  const [checking, setChecking] = useState(true);

  const handleLogout = useCallback(async () => {
    try {
      // Dispatch the proper logout action
      await dispatch(logoutSeller());

      // Clear local storage and cookies as backup
      localStorage.removeItem("seller_token");
      localStorage.removeItem("seller");

      // Clear all cookies related to seller
      document.cookie =
        "seller_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "seller_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" +
        window.location.hostname +
        ";";

      // Force redirect to home and reload the page
      window.location.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: Force redirect even if logout fails
      localStorage.removeItem("seller_token");
      localStorage.removeItem("seller");
      document.cookie =
        "seller_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "seller_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" +
        window.location.hostname +
        ";";
      window.location.replace("/");
    }
  }, [dispatch]);

  useEffect(() => {
    // Wait for seller data to be loaded, then check if authenticated and check ban status
    if (!isLoading) {
      if (isSeller && seller?._id) {
        checkBanStatus();
      } else {
        setChecking(false);
      }
    }
  }, [isSeller, seller, isLoading]);

  // Add keyboard escape functionality
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isBanned) {
        handleLogout();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isBanned, handleLogout]);

  const checkBanStatus = async () => {
    try {
      const { data } = await axios.get(`${server}/shop/ban-status`, {
        withCredentials: true,
      });

      if (data.success && data.isBanned) {
        setIsBanned(true);
        setBanDetails(data);
      }
    } catch (error) {
      console.error("Error checking ban status:", error);
      // If the request fails due to authentication error (shop is banned),
      // we still want to block access
      if (
        error.response?.status === 403 &&
        error.response?.data?.message?.includes("banned")
      ) {
        setIsBanned(true);
        setBanDetails({
          isBanned: true,
          banReason:
            error.response.data.banReason || "Your shop has been banned",
          bannedAt: error.response.data.bannedAt || new Date().toISOString(),
        });
      }
    } finally {
      setChecking(false);
    }
  };

  // Show loading while checking
  if (checking) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            Checking shop status...
          </h2>
        </div>
      </div>
    );
  }

  // If shop is banned, show ban message as overlay on top of dashboard content
  if (isBanned && banDetails) {
    return (
      <div className="relative">
        {/* Render the dashboard content in background with overlay */}
        <div className="opacity-10 pointer-events-none blur-sm">{children}</div>

        {/* Ban notification overlay - Unacademy style */}
        <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto transform animate-in slide-in-from-bottom-4 duration-300 max-h-[95vh] overflow-y-auto">
            {/* Header with gradient - Smaller */}
            <div className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 px-5 py-3 rounded-t-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white tracking-tight">
                      Account Suspended
                    </h1>
                    <p className="text-red-100 text-xs font-medium">
                      Access Restricted
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-1.5 transition-all duration-200 group"
                  title="Close and Logout"
                >
                  <svg
                    className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Main content - Compact */}
            <div className="px-5 py-4">
              {/* Status message - Smaller */}
              <div className="text-center mb-4">
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 mb-4">
                  <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <svg
                      className="w-6 h-6 text-white"
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
                  <h2 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                    Your Shop Has Been Suspended
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Your shop access has been temporarily restricted by our
                    administration team. All seller features are currently
                    unavailable.
                  </p>
                </div>
              </div>

              {/* Suspension details card - Compact */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="bg-orange-500 rounded-lg p-1.5">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    Suspension Details
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex items-start space-x-2">
                      <div className="bg-red-100 rounded-lg p-1.5 mt-0.5">
                        <svg
                          className="w-3 h-3 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-xs mb-1">
                          Reason for Suspension
                        </h4>
                        <p className="text-gray-700 text-xs leading-relaxed bg-gray-50 rounded-lg px-2 py-1.5 border">
                          {banDetails.banReason ||
                            "No specific reason provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {banDetails.bannedAt && (
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <div className="flex items-start space-x-2">
                        <div className="bg-blue-100 rounded-lg p-1.5 mt-0.5">
                          <svg
                            className="w-3 h-3 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-xs mb-1">
                            Suspension Date
                          </h4>
                          <p className="text-gray-700 text-xs bg-gray-50 rounded-lg px-2 py-1.5 border font-mono">
                            {new Date(banDetails.bannedAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Help section - Compact */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="bg-blue-500 rounded-lg p-1.5">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-blue-900">
                    Need Assistance?
                  </h3>
                </div>
                <p className="text-blue-800 text-xs leading-relaxed mb-2">
                  If you believe this suspension was issued incorrectly or have
                  questions about the decision, please reach out to our support
                  team.
                </p>
                <a
                  href="mailto:support@example.com"
                  className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-xs transition-colors duration-200"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Contact Support</span>
                </a>
              </div>
            </div>

            {/* Footer with logout button - Compact */}
            <div className="bg-gray-50 px-5 py-3 rounded-b-xl border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 group"
              >
                <svg
                  className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="text-sm">Logout and Return to Homepage</span>
              </button>
              <p className="text-center text-xs text-gray-500 mt-2 leading-relaxed">
                Press{" "}
                <kbd className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-700 font-mono text-xs">
                  ESC
                </kbd>{" "}
                or click × to logout
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If not banned, render the protected content
  return children;
};

export default SellerBanProtection;
