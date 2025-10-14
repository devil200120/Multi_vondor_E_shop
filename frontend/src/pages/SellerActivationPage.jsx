import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { server } from "../server";
import axios from "axios";

const SellerActivationPage = () => {
  const { activation_token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (activation_token) {
      const activationEmail = async () => {
        try {
          setLoading(true);

          // Animate progress bar
          const progressInterval = setInterval(() => {
            setProgress((prev) => {
              if (prev >= 90) {
                clearInterval(progressInterval);
                return 90;
              }
              return prev + Math.random() * 10;
            });
          }, 100);

          await axios.post(`${server}/shop/activation`, {
            activation_token,
          });

          clearInterval(progressInterval);
          setProgress(100);

          setTimeout(() => {
            setSuccess(true);
            setError(false);
            setLoading(false);
          }, 500);

          // Redirect to login page after 4 seconds
          setTimeout(() => {
            navigate("/shop-login");
          }, 4000);
        } catch (err) {
          console.log(err.response?.data?.message);
          setError(true);
          setSuccess(false);
          setLoading(false);
          setErrorMessage(
            err.response?.data?.message ||
              "Activation failed. Please try again."
          );
        }
      };
      activationEmail();
    } else {
      setError(true);
      setLoading(false);
      setErrorMessage("No activation token provided.");
    }
  }, [activation_token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Circles */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-purple-500 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-blue-400 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-indigo-400 rounded-full opacity-25 animate-bounce"></div>
        <div className="absolute bottom-32 right-32 w-12 h-12 bg-pink-400 rounded-full opacity-40 animate-pulse"></div>

        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-ping"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-xl opacity-20 animate-ping"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 max-w-lg w-full transform transition-all duration-500 hover:scale-105">
          {loading && (
            
            <div className="text-center">
              {/* Loading Animation */}
              <div className="mb-8">
                <div className="relative mx-auto w-32 h-32">
                  {/* Rotating Ring */}
                  <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>

                  {/* Inner Pulsing Circle */}
                  <div className="absolute inset-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"></div>

                  {/* Center Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-3xl animate-bounce">🏪</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-blue-400 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-white/80 text-sm mt-2">
                  {Math.round(progress)}% Complete
                </p>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">
                Activating Your Account
              </h2>
              <p className="text-white/70 text-lg">
                Please wait while we set up your seller dashboard...
              </p>

              {/* Floating Dots */}
              <div className="flex justify-center space-x-2 mt-6">
                <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce delay-100"></div>
                <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center">
              {/* Error Animation */}
              <div className="mb-6">
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
                  <div className="relative bg-red-500 rounded-full w-full h-full flex items-center justify-center">
                    <span className="text-white text-4xl animate-bounce">
                      ❌
                    </span>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-red-400 mb-4">
                Activation Failed
              </h2>
              <p className="text-white/80 mb-6 leading-relaxed">
                {errorMessage}
              </p>

              <button
                onClick={() => navigate("/shop-create")}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-semibold transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <span className="mr-2">🔄</span>
                Try Again
              </button>
            </div>
          )}

          {success && (
            <div className="text-center">
              {/* Success Animation */}
              <div className="mb-6">
                <div className="relative mx-auto w-24 h-24">
                  {/* Success Ring Animation */}
                  <div className="absolute inset-0 border-4 border-green-400/30 rounded-full animate-ping"></div>
                  <div className="relative bg-gradient-to-r from-green-400 to-emerald-400 rounded-full w-full h-full flex items-center justify-center animate-bounce">
                    <span className="text-white text-4xl">✅</span>
                  </div>

                  {/* Confetti Effect */}
                  <div className="absolute -top-4 -left-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                  <div className="absolute -top-2 -right-4 w-1 h-1 bg-pink-400 rounded-full animate-ping"></div>
                  <div className="absolute -bottom-2 -left-2 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
                  <div className="absolute -bottom-4 -right-2 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-green-400 mb-4">
                🎉 Account Activated!
              </h2>
              <p className="text-white/90 mb-6 text-lg leading-relaxed">
                Welcome to our seller community! Your shop is now ready to start
                selling.
              </p>

              {/* Countdown Timer */}
              <div className="bg-white/10 rounded-xl p-4 mb-6">
                <p className="text-white/80 text-sm mb-2">
                  Redirecting to login in:
                </p>
                <div className="text-2xl font-bold text-white animate-pulse">
                  4 seconds
                </div>
              </div>

              <button
                onClick={() => navigate("/shop-login")}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold transform transition-all duration-300 hover:scale-105 hover:shadow-xl group"
              >
                <span className="mr-2 group-hover:animate-bounce">🚀</span>
                Start Selling Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerActivationPage;
