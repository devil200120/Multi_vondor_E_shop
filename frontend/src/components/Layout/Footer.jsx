import React, { useState } from "react";
import {
  AiFillFacebook,
  AiFillInstagram,
  AiFillYoutube,
  AiOutlineTwitter,
  AiOutlineMail,
  AiOutlineCheck,
  AiFillLinkedin,
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
import { footerProductLinks, footerSupportLinks } from "../../static/data";
import { useSiteSettings } from "../../hooks/useSiteSettings";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { settings: siteSettings } = useSiteSettings();

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

  // Scroll to top when navigating to new pages
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent"></div>
      </div>

      {/* Newsletter Section - Compact */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 py-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Stay Connected
              </h2>
              <p className="text-blue-100 text-sm md:text-base max-w-xl">
                Get exclusive deals and updates delivered to your inbox
              </p>
            </div>

            <div className="w-full lg:w-auto lg:min-w-[400px]">
              <form onSubmit={handleSubscribe} className="flex">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-l-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="px-6 py-3 bg-white text-purple-600 font-bold rounded-r-lg hover:bg-purple-50 transition-all duration-300 disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : isSubscribed ? (
                    <AiOutlineCheck className="w-5 h-5 text-green-600" />
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content - Compact Grid */}
      <div className="relative bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Company Info - 2 columns */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-4">
                <Link to="/" className="group">
                  <img
                    src={BrandingLogo}
                    alt="Brand Logo"
                    className="h-20 w-auto object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-lg"
                    style={{ borderRadius: "12px" }}
                  />
                </Link>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {siteSettings?.companyInfo?.description ||
                  "Your trusted online marketplace for quality products worldwide."}
              </p>

              {/* Contact Info - Compact */}
              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <HiOutlineLocationMarker className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-xs leading-tight">
                    {(siteSettings?.footerAddress?.streetAddress && (
                      <>
                        {siteSettings.footerAddress.streetAddress}
                        {siteSettings.footerAddress.landmark &&
                          `, ${siteSettings.footerAddress.landmark}`}
                        <br />
                        {siteSettings.footerAddress.city &&
                          `${siteSettings.footerAddress.city}`}
                        {siteSettings.footerAddress.postalCode &&
                          ` ${siteSettings.footerAddress.postalCode}`}
                      </>
                    )) ||
                      "5-25, 15th main road, 3rd stage, 4th block, Basaveswaranagar, near Guru sagar hotel, Bangalore 560079"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <HiOutlinePhone className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300 text-xs">
                    {siteSettings?.footerAddress?.phone || "+91 7349727270"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <AiOutlineMail className="w-4 h-4 text-teal-400" />
                  <span className="text-gray-300 text-xs">
                    {siteSettings?.footerAddress?.email || "support@wanttar.in"}
                  </span>
                </div>
              </div>
            </div>

            {/* Shop Links */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Shop</h3>
              <ul className="space-y-2">
                {footerProductLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.link}
                      onClick={scrollToTop}
                      className="text-gray-300 hover:text-purple-400 transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/products"
                    onClick={scrollToTop}
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-300 text-sm"
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    to="/events"
                    onClick={scrollToTop}
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-300 text-sm"
                  >
                    Events
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    onClick={scrollToTop}
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-300 text-sm"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    onClick={scrollToTop}
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-300 text-sm"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Support</h3>
              <ul className="space-y-2">
                {footerSupportLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.link}
                      onClick={scrollToTop}
                      className="text-gray-300 hover:text-teal-400 transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Media & Trust Badges */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">
                Connect & Trust
              </h3>

              {/* Social Media */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      icon: AiFillFacebook,
                      color: "bg-blue-600 hover:bg-blue-700",
                      link:
                        siteSettings?.socialMedia?.facebook ||
                        "https://facebook.com",
                      show: siteSettings?.socialMedia?.facebook || true,
                    },
                    {
                      icon: AiOutlineTwitter,
                      color: "bg-blue-400 hover:bg-blue-500",
                      link:
                        siteSettings?.socialMedia?.twitter ||
                        "https://twitter.com",
                      show: siteSettings?.socialMedia?.twitter || true,
                    },
                    {
                      icon: AiFillInstagram,
                      color: "bg-pink-500 hover:bg-pink-600",
                      link:
                        siteSettings?.socialMedia?.instagram ||
                        "https://instagram.com",
                      show: siteSettings?.socialMedia?.instagram || true,
                    },
                    {
                      icon: AiFillLinkedin,
                      color: "bg-blue-700 hover:bg-blue-800",
                      link: siteSettings?.socialMedia?.linkedin || "",
                      show: !!siteSettings?.socialMedia?.linkedin,
                    },
                    {
                      icon: AiFillYoutube,
                      color: "bg-red-500 hover:bg-red-600",
                      link:
                        siteSettings?.socialMedia?.youtube ||
                        "https://youtube.com",
                      show: siteSettings?.socialMedia?.youtube || true,
                    },
                  ]
                    .filter((social) => social.show && social.link)
                    .map((social, index) => (
                      <a
                        key={index}
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-8 h-8 ${social.color} rounded-lg flex items-center justify-center transition-all duration-300`}
                      >
                        <social.icon className="w-4 h-4 text-white" />
                      </a>
                    ))}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <HiOutlineShieldCheck className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-xs">SSL Secured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <HiOutlineTruck className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300 text-xs">Fast Delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <HiOutlineSupport className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300 text-xs">24/7 Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <HiOutlineStar className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300 text-xs">Top Rated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer - Compact */}
      <div className="relative bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <p className="text-gray-400 text-xs">
                © {siteSettings?.companyInfo?.name || "Wanttar"} All rights
                reserved.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/buyer-terms"
                  onClick={scrollToTop}
                  className="text-gray-400 hover:text-blue-400 text-xs transition-colors"
                >
                  Buyer Terms & Conditions
                </Link>
                <Link
                  to="/seller-terms"
                  onClick={scrollToTop}
                  className="text-gray-400 hover:text-green-400 text-xs transition-colors"
                >
                  Seller Terms & Conditions
                </Link>
                <Link
                  to="/privacy"
                  onClick={scrollToTop}
                  className="text-gray-400 hover:text-purple-400 text-xs transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/refund"
                  onClick={scrollToTop}
                  className="text-gray-400 hover:text-green-400 text-xs transition-colors"
                >
                  Return & Refund
                </Link>
                <Link
                  to="/shipping"
                  onClick={scrollToTop}
                  className="text-gray-400 hover:text-orange-400 text-xs transition-colors"
                >
                  Shipping Info
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <img
                src="https://hamart-shop.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffooter-payment.a37c49ac.png&w=640&q=75"
                alt="Payment Methods"
                className="h-6 opacity-80 hover:opacity-100 transition-opacity duration-300"
              />
              <div className="text-gray-400 text-xs">Secure payments</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
