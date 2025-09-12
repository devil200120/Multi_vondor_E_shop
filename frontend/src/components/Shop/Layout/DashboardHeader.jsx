import React, { useState } from "react";
import { AiOutlineGift, AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { MdOutlineLocalOffer } from "react-icons/md";
import { FiPackage, FiShoppingBag } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { BiMessageSquareDetail } from "react-icons/bi";
import { backend_url } from "../../../server";

const DashboardHeader = () => {
  const { seller } = useSelector((state) => state.seller);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="w-full h-16 md:h-20 bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 left-0 z-30 flex items-center justify-between px-4 md:px-6 shadow-sm">
        <div className="flex items-center">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 md:space-x-3 group"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-200 shadow-lg">
              <span className="text-white font-bold text-sm md:text-lg">S</span>
            </div>
            <div className="transition-all duration-200">
              <span className="hidden sm:block text-lg md:text-xl font-semibold text-gray-800 group-hover:text-blue-700 transition-colors duration-200">
                Seller Dashboard
              </span>
              <span className="sm:hidden text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors duration-200">
                Dashboard
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Link
              to="/dashboard-coupouns"
              className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 transition-all duration-200 group transform hover:scale-105"
            >
              <AiOutlineGift
                className="text-orange-600 group-hover:text-orange-700 transition-colors duration-200"
                size={18}
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700 transition-colors duration-200">
                Coupons
              </span>
            </Link>
            <Link
              to="/dashboard-events"
              className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-200 group transform hover:scale-105"
            >
              <MdOutlineLocalOffer
                className="text-green-600 group-hover:text-green-700 transition-colors duration-200"
                size={18}
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-700 transition-colors duration-200">
                Events
              </span>
            </Link>
            <Link
              to="/dashboard-products"
              className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-200 group transform hover:scale-105"
            >
              <FiShoppingBag
                className="text-blue-600 group-hover:text-blue-700 transition-colors duration-200"
                size={18}
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors duration-200">
                Products
              </span>
            </Link>
            <Link
              to="/dashboard-orders"
              className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all duration-200 group transform hover:scale-105"
            >
              <FiPackage
                className="text-purple-600 group-hover:text-purple-700 transition-colors duration-200"
                size={18}
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors duration-200">
                Orders
              </span>
            </Link>
            <Link
              to="/dashboard-messages"
              className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 transition-all duration-200 group transform hover:scale-105"
            >
              <BiMessageSquareDetail
                className="text-indigo-600 group-hover:text-indigo-700 transition-colors duration-200"
                size={18}
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 transition-colors duration-200">
                Messages
              </span>
            </Link>
          </div>

          {/* Desktop Profile Section */}
          <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
            <Link
              to={`/shop/${seller._id}`}
              className="flex items-center space-x-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 rounded-xl p-3 transition-all duration-200 group transform hover:scale-105 shadow-sm hover:shadow-md"
            >
              <img
                src={`${backend_url}${seller.avatar}`}
                alt=""
                className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-colors duration-200"
              />
              <div className="hidden xl:block">
                <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors duration-200">
                  {seller.name}
                </p>
                <p className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors duration-200">
                  Seller Profile
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Mobile Menu Toggle & Profile */}
        <div className="lg:hidden flex items-center space-x-3">
          <Link
            to={`/shop/${seller._id}`}
            className="hover:scale-105 transition-transform duration-200"
          >
            <img
              src={`${backend_url}${seller.avatar}`}
              alt=""
              className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 hover:border-blue-300 transition-colors duration-200"
            />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="relative p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <div className="w-5 h-5 relative flex items-center justify-center">
              <AiOutlineMenu
                className={`absolute text-gray-600 transition-all duration-300 ${
                  isMobileMenuOpen
                    ? "opacity-0 rotate-180 scale-0"
                    : "opacity-100 rotate-0 scale-100"
                }`}
                size={20}
              />
              <AiOutlineClose
                className={`absolute text-gray-600 transition-all duration-300 ${
                  isMobileMenuOpen
                    ? "opacity-100 rotate-0 scale-100"
                    : "opacity-0 rotate-180 scale-0"
                }`}
                size={20}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu with Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
          isMobileMenuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Mobile Menu */}
        <div
          className={`absolute top-16 md:top-20 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-2xl transform transition-all duration-300 ease-out ${
            isMobileMenuOpen
              ? "translate-y-0 opacity-100 scale-100"
              : "-translate-y-full opacity-0 scale-95"
          }`}
        >
          <div className="p-5 space-y-3">
            <div className="mb-6 pb-5 border-b border-gray-200">
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100">
                <div className="relative">
                  <img
                    src={`${backend_url}${seller.avatar}`}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover border-3 border-white shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-gray-800">
                    {seller.name}
                  </p>
                  <p className="text-sm text-blue-600 font-medium">
                    Seller Dashboard
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/dashboard-coupouns"
              className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 transition-all duration-200 group hover:shadow-md border border-transparent hover:border-orange-200 bg-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 group-hover:scale-110 transition-all duration-200 shadow-sm">
                <AiOutlineGift className="text-orange-600" size={20} />
              </div>
              <span className="text-gray-700 font-semibold group-hover:text-orange-700 transition-colors duration-200 text-base">
                Coupons
              </span>
            </Link>

            <Link
              to="/dashboard-events"
              className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-200 group hover:shadow-md border border-transparent hover:border-green-200 bg-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 group-hover:scale-110 transition-all duration-200 shadow-sm">
                <MdOutlineLocalOffer className="text-green-600" size={20} />
              </div>
              <span className="text-gray-700 font-semibold group-hover:text-green-700 transition-colors duration-200 text-base">
                Events
              </span>
            </Link>

            <Link
              to="/dashboard-products"
              className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-200 group hover:shadow-md border border-transparent hover:border-blue-200 bg-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-200 shadow-sm">
                <FiShoppingBag className="text-blue-600" size={20} />
              </div>
              <span className="text-gray-700 font-semibold group-hover:text-blue-700 transition-colors duration-200 text-base">
                Products
              </span>
            </Link>

            <Link
              to="/dashboard-orders"
              className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all duration-200 group hover:shadow-md border border-transparent hover:border-purple-200 bg-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 group-hover:scale-110 transition-all duration-200 shadow-sm">
                <FiPackage className="text-purple-600" size={20} />
              </div>
              <span className="text-gray-700 font-semibold group-hover:text-purple-700 transition-colors duration-200 text-base">
                Orders
              </span>
            </Link>

            <Link
              to="/dashboard-messages"
              className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 transition-all duration-200 group hover:shadow-md border border-transparent hover:border-indigo-200 bg-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="p-3 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 group-hover:scale-110 transition-all duration-200 shadow-sm">
                <BiMessageSquareDetail className="text-indigo-600" size={20} />
              </div>
              <span className="text-gray-700 font-semibold group-hover:text-indigo-700 transition-colors duration-200 text-base">
                Messages
              </span>
            </Link>

            <div className="mt-6 pt-5 border-t border-gray-200">
              <Link
                to={`/shop/${seller._id}`}
                className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="font-bold">Visit Shop</span>
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xs">→</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardHeader;
