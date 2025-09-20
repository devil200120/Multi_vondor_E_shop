import React, { useState, useEffect } from "react";
import {
  AiFillFacebook,
  AiFillInstagram,
  AiFillYoutube,
  AiOutlineTwitter,
  AiOutlineMail,
  AiOutlineArrowRight,
  AiOutlineCheck,
} from "react-icons/ai";
import {
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiOutlineSupport,
  HiOutlineStar,
} from "react-icons/hi";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../server";
import BrandingLogo from "../../Branding_logo.jpg";
import {
  footercompanyLinks,
  footerProductLinks,
  footerSupportLinks,
} from "../../static/data";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const footerElement = document.getElementById("footer");
    if (footerElement) {
      observer.observe(footerElement);
    }

    return () => {
      if (footerElement) {
        observer.unobserve(footerElement);
      }
    };
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${server}/newsletter/subscribe`, {
        email: email,
      });

      if (response.data.success) {
        setIsSubscribed(true);
        setEmail("");
        toast.success(
          response.data.message ||
            "Successfully subscribed to our newsletter! 🎉"
        );

        // Reset success state after 3 seconds
        setTimeout(() => setIsSubscribed(false), 3000);
      }
    } catch (error) {
      console.error("Subscription error:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to subscribe. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer id="footer" className="relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent"></div>
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Floating particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"></div>
          <div
            className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400/40 rounded-full animate-bounce"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-teal-400/30 rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 py-4 sm:py-6">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="text-center mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Stay Connected
              </h2>
              <p className="text-blue-100 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                Join thousands of happy customers and get exclusive deals, early
                access to sales, and exciting updates delivered straight to your
                inbox.
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <form onSubmit={handleSubscribe} className="relative">
                <div className="relative flex">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-l-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-purple-600 font-bold rounded-r-xl hover:bg-purple-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/30 group disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : isSubscribed ? (
                      <AiOutlineCheck className="w-5 h-5 text-green-600" />
                    ) : (
                      <AiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    )}
                  </button>
                </div>
                {isSubscribed && (
                  <div className="absolute -bottom-6 left-0 right-0 text-center">
                    <span className="text-green-300 text-sm font-medium">
                      ✨ Successfully subscribed!
                    </span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div
            className={`transition-all duration-1000 delay-500 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Company Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center">
                  <Link to="/" className="group">
                    <div className="relative">
                      <img
                        src={BrandingLogo}
                        alt="Brand Logo"
                        className="h-16 w-auto object-contain transition-all duration-300 group-hover:scale-110"
                        style={{ borderRadius: "12px" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300 blur-md"></div>
                    </div>
                  </Link>
                </div>

                <p className="text-gray-300 leading-relaxed text-lg">
                  Your premium destination for quality products from trusted
                  sellers worldwide. Experience shopping like never before with
                  unmatched service and exclusive deals.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 group hover:translate-x-2 transition-transform duration-300">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <HiOutlineLocationMarker className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-300">
                      5-25 , 15th main road,3rd stage,4th block, Basaveswaranagar,near Guru sagar hotel, Bangalore 560079
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 group hover:translate-x-2 transition-transform duration-300">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <HiOutlinePhone className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-300">+91 7349727270</span>
                  </div>
                  <div className="flex items-center space-x-3 group hover:translate-x-2 transition-transform duration-300">
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <AiOutlineMail className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-300">
                      support@wanttar.com
                    </span>
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <h4 className="text-white font-semibold mb-4 text-lg">
                    Follow Us
                  </h4>
                  <div className="flex space-x-3">
                    {[
                      {
                        icon: AiFillFacebook,
                        color: "from-blue-600 to-blue-500",
                        link: "https://facebook.com",
                      },
                      {
                        icon: AiOutlineTwitter,
                        color: "from-blue-400 to-cyan-400",
                        link: "https://twitter.com",
                      },
                      {
                        icon: AiFillInstagram,
                        color: "from-pink-500 to-purple-500",
                        link: "https://instagram.com",
                      },
                      {
                        icon: AiFillYoutube,
                        color: "from-red-500 to-red-600",
                        link: "https://youtube.com",
                      },
                    ].map((social, index) => (
                      <a
                        key={index}
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-12 h-12 bg-gradient-to-r ${social.color} rounded-xl flex items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl`}
                      >
                        <social.icon className="w-6 h-6 text-white" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Company Links */}
              <div>
                <h3 className="text-xl font-bold mb-6 text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Company
                </h3>
                <ul className="space-y-3">
                  {footercompanyLinks.map((link, index) => (
                    <li key={index}>
                      <Link
                        to={link.link}
                        className="text-gray-300 hover:text-blue-400 transition-all duration-300 flex items-center group text-base"
                      >
                        <span className="group-hover:translate-x-2 transition-transform duration-300">
                          {link.name}
                        </span>
                        <AiOutlineArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Shop Links */}
              <div>
                <h3 className="text-xl font-bold mb-6 text-white bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
                  Shop
                </h3>
                <ul className="space-y-3">
                  {footerProductLinks.map((link, index) => (
                    <li key={index}>
                      <Link
                        to={link.link}
                        className="text-gray-300 hover:text-purple-400 transition-all duration-300 flex items-center group text-base"
                      >
                        <span className="group-hover:translate-x-2 transition-transform duration-300">
                          {link.name}
                        </span>
                        <AiOutlineArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support Links & Trust Badges */}
              <div>
                <h3 className="text-xl font-bold mb-6 text-white bg-gradient-to-r from-teal-400 to-green-400 bg-clip-text text-transparent">
                  Support
                </h3>
                <ul className="space-y-3 mb-8">
                  {footerSupportLinks.map((link, index) => (
                    <li key={index}>
                      <Link
                        to={link.link}
                        className="text-gray-300 hover:text-teal-400 transition-all duration-300 flex items-center group text-base"
                      >
                        <span className="group-hover:translate-x-2 transition-transform duration-300">
                          {link.name}
                        </span>
                        <AiOutlineArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Trust Badges */}
                <div>
                  <h4 className="text-white font-semibold mb-4 text-lg">
                    Why Choose Us
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 group">
                      <HiOutlineShieldCheck className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-gray-300 text-sm group-hover:text-white transition-colors duration-300">
                        SSL Secured
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 group">
                      <HiOutlineTruck className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-gray-300 text-sm group-hover:text-white transition-colors duration-300">
                        Fast Delivery
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 group">
                      <HiOutlineSupport className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-gray-300 text-sm group-hover:text-white transition-colors duration-300">
                        24/7 Support
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 group">
                      <HiOutlineStar className="w-6 h-6 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-gray-300 text-sm group-hover:text-white transition-colors duration-300">
                        Top Rated
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="relative bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div
            className={`transition-all duration-1000 delay-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-8">
                <p className="text-gray-400 text-sm">
                  Manohar Enterprises All rights reserved. Made with ❤️
                  for amazing shopping experiences.
                </p>
                <div className="flex flex-wrap gap-6">
                  <Link
                    to="/terms"
                    className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-300 hover:underline"
                  >
                    Terms of Service
                  </Link>
                  <Link
                    to="/privacy"
                    className="text-gray-400 hover:text-purple-400 text-sm transition-colors duration-300 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    to="/cookies"
                    className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-300 hover:underline"
                  >
                    Cookie Policy
                  </Link>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <img
                  src="https://hamart-shop.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffooter-payment.a37c49ac.png&w=640&q=75"
                  alt="Payment Methods"
                  className="h-8 opacity-80 hover:opacity-100 transition-opacity duration-300"
                />
                <div className="text-gray-400 text-xs">Secure payments</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
