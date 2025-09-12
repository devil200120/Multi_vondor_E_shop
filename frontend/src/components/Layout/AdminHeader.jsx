import React from "react";
import { MdOutlineLocalOffer, MdNotifications, MdLogout } from "react-icons/md";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { CiMoneyBill } from "react-icons/ci";
import { GrWorkshop } from "react-icons/gr";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { backend_url } from "../../server";
import BrandingLogo from "../../Branding_logo.jpg";

const AdminHeader = () => {
  const { user } = useSelector((state) => state.user);

  return (
    <div className="w-full h-20 bg-white shadow-sm border-b border-gray-200 sticky top-0 left-0 z-30 flex items-center justify-between px-6">
      {/* Left Side - Logo */}
      <div className="flex items-center space-x-4">
        <Link to="/" className="flex items-center space-x-3">
          <img
            src={BrandingLogo}
            alt="Brand Logo"
            className="h-12 w-auto object-contain enhanced-logo"
          />
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500">Management Dashboard</p>
          </div>
        </Link>
      </div>

      {/* Center - Search (optional for future) */}
      <div className="hidden lg:flex flex-1 max-w-lg mx-8">
        {/* Search can be added here later */}
      </div>

      {/* Right Side - Actions & Profile */}
      <div className="flex items-center space-x-4">
        {/* Quick Actions */}
        <div className="hidden md:flex items-center space-x-2">
          <Link
            to="/admin-withdraw"
            className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
            title="Withdraw Requests"
          >
            <CiMoneyBill size={20} />
          </Link>
          <Link
            to="/admin-events"
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Events"
          >
            <MdOutlineLocalOffer size={20} />
          </Link>
          <Link
            to="/admin-sellers"
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Sellers"
          >
            <GrWorkshop size={20} />
          </Link>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <MdNotifications size={20} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <div className="relative">
            <img
              src={`${backend_url}${user?.avatar}`}
              alt="Admin Avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 hover:border-blue-400 transition-colors"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
          <HiOutlineMenuAlt2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default AdminHeader;
