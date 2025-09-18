import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  HiOutlineViewGrid,
  HiOutlineShoppingBag,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineCube,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlineLogout,
  HiOutlinePhotograph,
  HiOutlineCollection,
} from "react-icons/hi";
import { logoutUser } from "../../../redux/actions/user";
import { toast } from "react-toastify";

const AdminSideBar = ({ active, onItemClick, isMobileOverlay = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success("Logged out successfully!");
    navigate("/");
    if (onItemClick) onItemClick();
  };

  const menuItems = [
    {
      id: 1,
      name: "Dashboard",
      icon: HiOutlineViewGrid,
      url: "/admin/dashboard",
      color: "bg-blue-500",
    },
    {
      id: 2,
      name: "All Orders",
      icon: HiOutlineShoppingBag,
      url: "/admin-orders",
      color: "bg-green-500",
    },
    {
      id: 3,
      name: "All Sellers",
      icon: HiOutlineUserGroup,
      url: "/admin-sellers",
      color: "bg-orange-500",
    },
    {
      id: 4,
      name: "All Users",
      icon: HiOutlineUsers,
      url: "/admin-users",
      color: "bg-purple-500",
    },
    {
      id: 5,
      name: "All Products",
      icon: HiOutlineCube,
      url: "/admin-products",
      color: "bg-indigo-500",
    },
    {
      id: 6,
      name: "All Events",
      icon: HiOutlineCalendar,
      url: "/admin-events",
      color: "bg-yellow-500",
    },
    {
      id: 7,
      name: "Withdraw Request",
      icon: HiOutlineCurrencyDollar,
      url: "/admin-withdraw",
      color: "bg-red-500",
    },
    {
      id: 8,
      name: "Home Banner",
      icon: HiOutlinePhotograph,
      url: "/admin-banner",
      color: "bg-pink-500",
    },
    {
      id: 9,
      name: "Categories",
      icon: HiOutlineCollection,
      url: "/admin-categories",
      color: "bg-cyan-500",
    },
    {
      id: 10,
      name: "Analytics",
      icon: HiOutlineChartBar,
      url: "/admin/analytics",
      color: "bg-teal-500",
    },
  ];

  return (
    <div
      className={`w-full h-full bg-transparent flex flex-col overflow-hidden ${
        isMobileOverlay ? "" : "bg-white shadow-sm border-r border-gray-200"
      }`}
    >
      {/* Header - Only show on desktop or if not mobile overlay */}
      {!isMobileOverlay && (
        <div className="flex-shrink-0 p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <HiOutlineViewGrid className="h-5 w-5 text-white" />
            </div>
            <div className="hidden 800px:block">
              <h2 className="text-lg font-semibold text-gray-900">
                Admin Panel
              </h2>
              <p className="text-sm text-gray-500">Management Dashboard</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu - Refined for cleaner look */}
      <div
        className={`flex-1 overflow-y-auto admin-sidebar-scroll ${
          isMobileOverlay ? "p-4 pt-3" : "p-4"
        }`}
      >
        <div className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = active === item.id;

            return (
              <Link
                key={item.id}
                to={item.url}
                onClick={onItemClick}
                className={`
                  relative flex items-center rounded-lg font-medium transition-all duration-200 group admin-nav-item
                  ${
                    isMobileOverlay
                      ? "px-3 py-3 space-x-3"
                      : "px-4 py-3 space-x-3"
                  }
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border border-blue-200/50 shadow-sm"
                      : "hover:bg-gray-50 hover:shadow-sm border border-transparent hover:border-gray-200/50"
                  }
                `}
                title={item.name}
              >
                <div
                  className={`
                  relative flex items-center justify-center rounded-lg transition-all duration-200
                  ${isMobileOverlay ? "w-10 h-10" : "w-10 h-10"}
                  ${
                    isActive
                      ? "bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 text-white shadow-md transform scale-105"
                      : "bg-gray-100 group-hover:bg-blue-100 text-gray-600 group-hover:text-blue-600"
                  }
                `}
                >
                  <IconComponent
                    className={`transition-all duration-200 ${
                      isMobileOverlay ? "h-5 w-5" : "h-5 w-5"
                    }`}
                  />
                </div>

                <div className="flex-1 flex items-center justify-between min-w-0">
                  <div className="flex-1">
                    <span
                      className={`
                      font-medium transition-colors duration-200 truncate block
                      ${
                        isMobileOverlay
                          ? "text-sm"
                          : "text-sm hidden 800px:block"
                      }
                      ${
                        isActive
                          ? "text-blue-700"
                          : "text-gray-700 group-hover:text-blue-600"
                      }
                    `}
                    >
                      {item.name}
                    </span>
                    {isMobileOverlay && (
                      <span className="text-xs text-gray-500 block mt-0.5">
                        {item.name === "Dashboard" && "Overview & analytics"}
                        {item.name === "All Orders" && "Manage orders"}
                        {item.name === "All Sellers" && "Seller management"}
                        {item.name === "All Users" && "User management"}
                        {item.name === "All Products" && "Product inventory"}
                        {item.name === "All Events" && "Event management"}
                        {item.name === "Withdraw Request" && "Payment requests"}
                        {item.name === "Home Banner" && "Homepage banners"}
                        {item.name === "Categories" && "Category management"}
                        {item.name === "Analytics" && "Reports & insights"}
                      </span>
                    )}
                  </div>
                </div>

                {isActive && (
                  <div className="absolute right-2 w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer - Refined sizing */}
      <div
        className={`flex-shrink-0 border-t border-gray-100 ${
          isMobileOverlay ? "p-4 pt-3 space-y-3" : "p-4 space-y-3"
        } ${isMobileOverlay ? "block" : "hidden 800px:block"}`}
      >
        {/* Logout Button - Refined */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center rounded-lg font-medium transition-all duration-200 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 group hover:shadow-sm ${
            isMobileOverlay ? "px-3 py-3 space-x-3" : "px-4 py-3 space-x-3"
          }`}
        >
          <div
            className={`flex items-center justify-center rounded-lg bg-red-100 group-hover:bg-red-200 text-red-600 transition-colors ${
              isMobileOverlay ? "w-10 h-10" : "w-8 h-8"
            }`}
          >
            <HiOutlineLogout
              className={isMobileOverlay ? "w-5 h-5" : "w-4 h-4"}
            />
          </div>
          <div className="flex-1 text-left">
            <span
              className={`text-red-600 group-hover:text-red-700 font-medium ${
                isMobileOverlay ? "text-sm" : "text-sm"
              }`}
            >
              Logout
            </span>
            {isMobileOverlay && (
              <p className="text-xs text-red-500 mt-0.5">
                Sign out of admin panel
              </p>
            )}
          </div>
        </button>

        {/* Footer info - Refined */}
        <div className="text-center space-y-0.5">
          <p
            className={`font-medium text-gray-700 ${
              isMobileOverlay ? "text-xs" : "text-xs"
            }`}
          >
            Admin Dashboard v2.0
          </p>
          <p
            className={`text-gray-500 ${
              isMobileOverlay ? "text-xs" : "text-xs"
            }`}
          >
            © 2025 Your Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSideBar;
