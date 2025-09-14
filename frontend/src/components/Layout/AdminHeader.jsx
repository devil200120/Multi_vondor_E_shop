import React, { useState, useRef, useEffect } from "react";
import { MdOutlineLocalOffer } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { CiMoneyBill } from "react-icons/ci";
import { GrWorkshop } from "react-icons/gr";
import {
  HiOutlineMenuAlt2,
  HiOutlineX,
  HiOutlineLogout,
  HiOutlineChevronDown,
  HiOutlineViewGrid,
} from "react-icons/hi";
import { logoutUser } from "../../redux/actions/user";
import { toast } from "react-toastify";
import { backend_url } from "../../server";
import BrandingLogo from "../../Branding_logo.jpg";
import AdminSideBar from "../Admin/Layout/AdminSideBar";
import AdminNotifications from "./AdminNotifications";

const AdminHeader = ({ activeMenuItem = 1 }) => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success("Logged out successfully!");
    navigate("/");
    setIsProfileDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        <AdminNotifications />

        {/* User Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleProfileDropdown}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
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
            <HiOutlineChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${
                isProfileDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {/* Profile Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <img
                    src={`${backend_url}${user?.avatar}`}
                    alt="Admin Avatar"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs text-blue-600 font-medium">
                      Administrator
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  to="/admin/dashboard"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  <HiOutlineViewGrid className="w-4 h-4 mr-3 text-gray-500" />
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <HiOutlineLogout className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="800px:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? (
            <HiOutlineX size={20} />
          ) : (
            <HiOutlineMenuAlt2 size={20} />
          )}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 800px:hidden"
            onClick={toggleMobileMenu}
          ></div>

          {/* Mobile Sidebar */}
          <div className="fixed top-20 left-0 w-80 h-full bg-white z-50 transform transition-transform duration-300 ease-in-out 800px:hidden">
            <AdminSideBar
              active={activeMenuItem}
              onItemClick={() => setIsMobileMenuOpen(false)}
              isMobileOverlay={true}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminHeader;
