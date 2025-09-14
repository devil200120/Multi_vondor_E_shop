import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import BrandingLogo from "../../Branding_logo.jpg";

const UserForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${server}/user/forgot-password`, {
        email,
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setEmail("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-unacademy-md hover:shadow-unacademy-lg transition-all duration-200 hover:scale-105"
        >
          <AiOutlineArrowLeft size={20} className="text-text-primary" />
        </button>
      </div>

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-white to-gray-50 rounded-3xl flex items-center justify-center shadow-2xl border border-gray-100 p-3 hover:scale-105 transition-all duration-300">
            <img
              src={BrandingLogo}
              alt="Brand Logo"
              className="h-full w-full object-contain filter drop-shadow-lg"
              style={{
                filter:
                  "drop-shadow(0 4px 8px rgba(0,0,0,0.1)) brightness(1.1) contrast(1.1)",
              }}
            />
          </div>
        </div>
        <h2 className="text-center text-3xl font-bold text-text-primary mb-2">
          Forgot Password
        </h2>
        <p className="text-center text-text-secondary">
          Enter your email address and we'll send you a link to reset your
          password
        </p>
      </div>

      {/* Forgot Password Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-unacademy-lg rounded-2xl border border-secondary-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-text-primary mb-2"
              >
                Email address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 placeholder-text-muted bg-white text-text-primary"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white transition-all duration-200 ${
                loading
                  ? "bg-primary-400 cursor-not-allowed"
                  : "bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:shadow-unacademy-md hover:transform hover:scale-105"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending email...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            {/* Back to login link */}
            <div className="text-center pt-4 border-t border-secondary-200">
              <span className="text-text-secondary">
                Remember your password?{" "}
              </span>
              <Link
                to="/login"
                className="font-semibold text-primary-500 hover:text-primary-600 transition-colors duration-200"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserForgotPassword;
