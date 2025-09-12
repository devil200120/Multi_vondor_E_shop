import React from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineViewGrid,
  HiOutlineShoppingBag,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineCube,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";

const AdminSideBar = ({ active }) => {
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
  ];

  return (
    <div className="w-64 h-screen bg-white shadow-sm border-r border-gray-200 flex flex-col sticky top-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <HiOutlineViewGrid className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
            <p className="text-sm text-gray-500">Management Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = active === item.id;

          return (
            <Link
              key={item.id}
              to={item.url}
              className={`
                flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200
                ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <div
                className={`
                w-8 h-8 rounded-lg flex items-center justify-center mr-3
                ${isActive ? item.color : "bg-gray-100"}
              `}
              >
                <IconComponent
                  className={`h-4 w-4 ${
                    isActive ? "text-white" : "text-gray-600"
                  }`}
                />
              </div>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="text-center text-xs text-gray-500">
          <p>Admin Dashboard v2.0</p>
          <p>© 2025 Your Platform</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSideBar;
