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
import { getAvatarUrl } from "../../utils/mediaUtils";
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
    <div className="w-full h-20 bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6">
      {/* Left Side - Logo */}
      <div className="flex items-center space-x-5">
        <Link to="/" className="flex items-center space-x-4">
          <img
            src="/logo (10).png"
            alt="Brand Logo"
            className="h-16 w-auto object-contain transition-all duration-300 hover:scale-105"
            style={{
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
            }}
          />
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.role === "Manager"
                ? "Manager Panel"
                : user?.role === "SubAdmin"
                ? "SubAdmin Panel"
                : "Admin Panel"}
            </h1>
            <p className="text-base text-gray-500">Management Dashboard</p>
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
              <p className="text-xs text-gray-500">
                {user?.role === "Admin" && "Administrator"}
                {user?.role === "SubAdmin" && "Sub Administrator"}
                {user?.role === "Manager" && "Manager"}
              </p>
            </div>
            <div className="relative">
              <img
                src={getAvatarUrl(user?.avatar, backend_url)}
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
                    src={getAvatarUrl(user?.avatar, backend_url)}
                    alt="Admin Avatar"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs text-blue-600 font-medium">
                      {user?.role === "Admin" && "Administrator"}
                      {user?.role === "SubAdmin" && "Sub Administrator"}
                      {user?.role === "Manager" && "Manager"}
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

      {/* Mobile Sidebar Overlay - Enhanced with Beautiful Design */}
      {isMobileMenuOpen && (
        <div className="800px:hidden fixed inset-0 z-50 admin-mobile-menu-overlay">
          {/* Enhanced Backdrop with gradient and better blur */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/30 backdrop-blur-md transition-all duration-300 ease-out"
            onClick={toggleMobileMenu}
          />

          {/* Mobile Sidebar with refined sizing */}
          <div className="absolute top-0 left-0 bottom-0 w-64 max-w-[75vw] bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 admin-mobile-sidebar">
            <div className="h-full flex flex-col overflow-hidden">
              {/* Refined Header Section */}
              <div className="flex-shrink-0 p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                      <HiOutlineViewGrid className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-gray-800">
                        {user?.role === "Manager"
                          ? "Manager Panel"
                          : user?.role === "SubAdmin"
                          ? "SubAdmin Panel"
                          : "Admin Panel"}
                      </h2>
                      <p className="text-xs text-gray-500">
                        Management Dashboard
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleMobileMenu}
                    className="p-1.5 rounded-lg bg-white/80 hover:bg-white border border-gray-200/50 transition-all duration-200 hover:shadow-sm group"
                  >
                    <HiOutlineX
                      size={16}
                      className="text-gray-500 group-hover:text-gray-700"
                    />
                  </button>
                </div>
              </div>

              {/* Navigation Content */}
              <div className="flex-1 overflow-hidden">
                <AdminSideBar
                  active={activeMenuItem}
                  onItemClick={() => setIsMobileMenuOpen(false)}
                  isMobileOverlay={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHeader;
