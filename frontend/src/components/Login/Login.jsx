import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { loadUser } from "../../redux/actions/user";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${server}/user/login-user`,
        { email, password },
        { withCredentials: true }
      );
      toast.success("Login Successful!");

      // Load user data into Redux store
      dispatch(loadUser());

      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center shadow-unacademy-md">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
        </div>
        <h2 className="text-center text-3xl font-bold text-text-primary mb-2">
          Welcome back
        </h2>
        <p className="text-center text-text-secondary">
          Sign in to your account to continue
        </p>
      </div>

      {/* Login Form */}
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

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-text-primary mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={visible ? "text" : "password"}
                  name="password"
                  id="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 placeholder-text-muted bg-white text-text-primary"
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

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-secondary-300 rounded transition-colors duration-200"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-text-secondary"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary-500 hover:text-primary-600 transition-colors duration-200"
                >
                  Forgot password?
                </Link>
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
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>

            {/* Sign up link */}
            <div className="text-center pt-4 border-t border-secondary-200">
              <span className="text-text-secondary">
                Don't have an account?{" "}
              </span>
              <Link
                to="/sign-up"
                className="font-semibold text-primary-500 hover:text-primary-600 transition-colors duration-200"
              >
                Create account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
