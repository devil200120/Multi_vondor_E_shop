import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { server } from "../server";
import axios from "axios";

const ActivationPage = () => {
  const { activation_token } = useParams();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (activation_token) {
      const activationEmail = async () => {
        try {
          setLoading(true);
          // Add delay for animation effect
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const res = await axios.post(`${server}/user/activation`, {
            activation_token,
          });

          console.log(res.data.message);
          setSuccess(true);
          setLoading(false);

          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } catch (err) {
          console.log(err.response?.data?.message);
          setError(true);
          setLoading(false);
          setErrorMessage(err.response?.data?.message || "Activation failed");
        }
      };
      activationEmail();
    }
  }, [activation_token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-md w-full">
        {loading && (
          <div className="text-center">
            {/* Loading Animation */}
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto relative">
                {/* Outer spinning ring */}
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin-slow"></div>

                {/* Inner pulsing circle */}
                <div className="absolute inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center animate-bounce">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading Text */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-800 animate-fadeInUp">
                Activating Your Account
              </h1>
              <div className="flex items-center justify-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
              <p className="text-gray-600 animate-fadeInUp animation-delay-500">
                Please wait while we verify your email and set up your account
              </p>
            </div>
          </div>
        )}

        {success && (
          <div className="text-center animate-fadeInScale">
            {/* Success Animation */}
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto relative">
                {/* Success Circle with Checkmark */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-scaleIn flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-white animate-checkmark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                {/* Celebration particles */}
                <div className="absolute -inset-4">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-3 h-3 bg-yellow-400 rounded-full animate-celebration"
                      style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${20 + Math.random() * 60}%`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Success Content */}
            <div className="space-y-6">
              <div className="animate-fadeInUp">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  Welcome Aboard! 🎉
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-500 mx-auto rounded-full animate-expandWidth"></div>
              </div>

              <div className="animate-fadeInUp animation-delay-300">
                <p className="text-xl text-gray-700 font-medium mb-2">
                  Your account has been successfully activated!
                </p>
                <p className="text-gray-600">
                  You're all set to explore our amazing platform
                </p>
              </div>

              {/* Feature highlights */}
              <div className="grid grid-cols-3 gap-4 mt-8 animate-fadeInUp animation-delay-500">
                <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    Secure Shopping
                  </p>
                </div>

                <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    Fast Delivery
                  </p>
                </div>

                <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    Best Deals
                  </p>
                </div>
              </div>

              {/* Redirect message */}
              <div className="animate-fadeInUp animation-delay-700 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                <p className="text-gray-600 text-sm">
                  Redirecting you to login page in 3 seconds...
                </p>
                <div className="mt-2 bg-gray-200 rounded-full h-1 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-full animate-loadingBar"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center animate-shake">
            {/* Error Animation */}
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-full animate-scaleIn flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-white animate-pulse"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Error Content */}
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-red-600 animate-fadeInUp">
                Activation Failed
              </h1>
              <div className="animate-fadeInUp animation-delay-300">
                <p className="text-gray-600 mb-4">
                  {errorMessage ||
                    "Your activation token has expired or is invalid"}
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">
                    Please request a new activation link or contact support
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/signup")}
                className="animate-fadeInUp animation-delay-500 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        @keyframes checkmark {
          0% {
            stroke-dasharray: 0 50;
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dasharray: 50 50;
            stroke-dashoffset: -50;
          }
        }

        @keyframes celebration {
          0% {
            transform: translateY(0) scale(0);
            opacity: 1;
          }
          50% {
            transform: translateY(-20px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-40px) scale(0);
            opacity: 0;
          }
        }

        @keyframes expandWidth {
          from {
            width: 0;
          }
          to {
            width: 6rem;
          }
        }

        @keyframes loadingBar {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }

        .animation-delay-700 {
          animation-delay: 0.7s;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-fadeInScale {
          animation: fadeInScale 0.6s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)
            forwards;
        }

        .animate-checkmark {
          animation: checkmark 0.6s ease-in-out 0.3s forwards;
          stroke-dasharray: 0 50;
        }

        .animate-celebration {
          animation: celebration 1s ease-out forwards;
        }

        .animate-expandWidth {
          animation: expandWidth 0.6s ease-out 0.3s forwards;
          width: 0;
        }

        .animate-loadingBar {
          animation: loadingBar 3s linear forwards;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ActivationPage;
