import React, { useState } from "react";
import {
  AiFillFacebook,
  AiFillInstagram,
  AiFillYoutube,
  AiOutlineTwitter,
  AiOutlineMail,
} from "react-icons/ai";
import { HiOutlineLocationMarker, HiOutlinePhone } from "react-icons/hi";
import { Link } from "react-router-dom";
import BrandingLogo from "../../Branding_logo.jpg";
import {
  footercompanyLinks,
  footerProductLinks,
  footerSupportLinks,
} from "../../static/data";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle subscription logic here
    console.log("Subscribed:", email);
    setEmail("");
  };

  return (
    <footer className="bg-dark-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-2/3 mb-6 md:mb-0">
              <h2 className="text-3xl font-bold text-white mb-2">
                Stay Updated
              </h2>
              <p className="text-primary-100 text-lg">
                Subscribe to our newsletter for exclusive deals, new arrivals,
                and special offers.
              </p>
            </div>

            <div className="md:w-1/3">
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="flex-1">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-500"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center">
              <Link
                to="/"
                className="group hover:scale-105 transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={BrandingLogo}
                    alt="Brand Logo"
                    className="h-14 w-auto object-contain brand-logo logo-shadow transition-all duration-300"
                    style={{
                      borderRadius: "8px",
                    }}
                  />
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#27b3e2] to-[#38cb89] opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300 blur-sm"></div>
                </div>
              </Link>
            </div>

            <p className="text-secondary-400 leading-relaxed">
              Your one-stop destination for quality products from trusted
              sellers. Discover amazing deals and exceptional service.
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <HiOutlineLocationMarker className="w-5 h-5 text-primary-500" />
                <span className="text-secondary-400">
                  123 Business Street, City, State 12345
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <HiOutlinePhone className="w-5 h-5 text-primary-500" />
                <span className="text-secondary-400">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <AiOutlineMail className="w-5 h-5 text-primary-500" />
                <span className="text-secondary-400">
                  support@multivendor.com
                </span>
              </div>
            </div>

            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-secondary-800 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors duration-200"
              >
                <AiFillFacebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-secondary-800 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors duration-200"
              >
                <AiOutlineTwitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-secondary-800 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors duration-200"
              >
                <AiFillInstagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-secondary-800 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors duration-200"
              >
                <AiFillYoutube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white">Company</h3>
            <ul className="space-y-3">
              {footercompanyLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.link}
                    className="text-secondary-400 hover:text-primary-400 transition-colors duration-200 flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white">Shop</h3>
            <ul className="space-y-3">
              {footerProductLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.link}
                    className="text-secondary-400 hover:text-primary-400 transition-colors duration-200 flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white">Support</h3>
            <ul className="space-y-3">
              {footerSupportLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.link}
                    className="text-secondary-400 hover:text-primary-400 transition-colors duration-200 flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Trust Badges */}
            <div className="mt-8">
              <h4 className="text-sm font-semibold mb-3 text-white">
                Secure Payments
              </h4>
              <div className="flex flex-wrap gap-2">
                <div className="bg-secondary-800 px-3 py-2 rounded-lg text-xs font-medium">
                  SSL Secured
                </div>
                <div className="bg-secondary-800 px-3 py-2 rounded-lg text-xs font-medium">
                  24/7 Support
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-2 md:space-y-0">
              <p className="text-secondary-400 text-sm">
                © 2024 Multi Vendor E-Shop. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <Link
                  to="/terms"
                  className="text-secondary-400 hover:text-primary-400 text-sm transition-colors duration-200"
                >
                  Terms of Service
                </Link>
                <Link
                  to="/privacy"
                  className="text-secondary-400 hover:text-primary-400 text-sm transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/cookies"
                  className="text-secondary-400 hover:text-primary-400 text-sm transition-colors duration-200"
                >
                  Cookie Policy
                </Link>
              </div>
            </div>

            <div className="mt-4 md:mt-0">
              <img
                src="https://hamart-shop.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffooter-payment.a37c49ac.png&w=640&q=75"
                alt="Payment Methods"
                className="h-8 opacity-80"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
