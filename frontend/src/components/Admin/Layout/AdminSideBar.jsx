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
      name: "Analytics",
      icon: HiOutlineChartBar,
      url: "/admin/analytics",
      color: "bg-teal-500",
    },
  ];

  return (
    <div className="w-full h-full bg-white shadow-sm border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div
        className={`flex-shrink-0 p-6 border-b border-gray-100 ${
          isMobileOverlay ? "bg-gradient-to-r from-blue-50 to-purple-50" : ""
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <HiOutlineViewGrid className="h-5 w-5 text-white" />
          </div>
          <div
            className={`${isMobileOverlay ? "block" : "hidden 800px:block"}`}
          >
            <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
            <p className="text-sm text-gray-500">Management Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu - Scrollable */}
      <div
        className={`flex-1 overflow-y-auto p-4 admin-sidebar-scroll ${
          isMobileOverlay ? "py-6" : ""
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
                  flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                  ${isMobileOverlay ? "py-4" : "py-2.5"}
                `}
                title={item.name}
              >
                <div
                  className={`
                  w-10 h-10 rounded-lg flex items-center justify-center mr-4
                  ${isActive ? item.color : "bg-gray-100"}
                  ${isMobileOverlay ? "mr-4" : "mr-3"}
                `}
                >
                  <IconComponent
                    className={`h-5 w-5 ${
                      isActive ? "text-white" : "text-gray-600"
                    }`}
                  />
                </div>
                <span
                  className={`${
                    isMobileOverlay ? "block text-base" : "hidden 800px:block"
                  } font-medium`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer - Fixed */}
      <div
        className={`flex-shrink-0 p-4 border-t border-gray-100 space-y-3 ${
          isMobileOverlay ? "block" : "hidden 800px:block"
        }`}
      >
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
        >
          <HiOutlineLogout className="w-4 h-4 mr-2" />
          <span
            className={`${isMobileOverlay ? "block" : "hidden 800px:block"}`}
          >
            Logout
          </span>
        </button>

        <div className="text-center text-xs text-gray-500">
          <p>Admin Dashboard v2.0</p>
          <p>© 2025 Your Platform</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSideBar;
