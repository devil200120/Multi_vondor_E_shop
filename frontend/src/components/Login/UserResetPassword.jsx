import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineArrowLeft,
} from "react-icons/ai";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import BrandingLogo from "../../WANTTA (2).png";

const UserResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password should be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(
        `${server}/user/reset-password/${token}`,
        {
          password,
          confirmPassword,
        }
      );

      if (response.data.success) {
        toast.success("Password reset successfully! You are now logged in.");
        navigate("/");
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
          <div className="w-24 h-24 bg-gradient-to-br from-white to-gray-50 rounded-3xl flex items-center justify-center shadow-2xl border border-gray-100 p-1 hover:scale-105 transition-all duration-300">
            <img
              src={BrandingLogo}
              alt="Brand Logo"
              className="h-full w-full object-contain"
              style={{
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
              }}
            />
          </div>
        </div>
        <h2 className="text-center text-3xl font-bold text-text-primary mb-2">
          Reset Password
        </h2>
        <p className="text-center text-text-secondary">
          Enter your new password
        </p>
      </div>

      {/* Reset Password Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-unacademy-lg rounded-2xl border border-secondary-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* New Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-text-primary mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={visible ? "text" : "password"}
                  name="password"
                  id="password"
                  autoComplete="new-password"
                  required
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-secondary-400 transition-all duration-300 ease-in-out placeholder-text-muted bg-white text-text-primary shadow-sm focus:shadow-md outline-none"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors duration-200"
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? (
                    <AiOutlineEye size={20} />
                  ) : (
                    <AiOutlineEyeInvisible size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-text-primary mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={confirmVisible ? "text" : "password"}
                  name="confirmPassword"
                  id="confirmPassword"
                  autoComplete="new-password"
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-secondary-400 transition-all duration-300 ease-in-out placeholder-text-muted bg-white text-text-primary shadow-sm focus:shadow-md outline-none"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors duration-200"
                  onClick={() => setConfirmVisible(!confirmVisible)}
                >
                  {confirmVisible ? (
                    <AiOutlineEye size={20} />
                  ) : (
                    <AiOutlineEyeInvisible size={20} />
                  )}
                </button>
              </div>
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
                  Resetting password...
                </>
              ) : (
                "Reset Password"
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

export default UserResetPassword;
