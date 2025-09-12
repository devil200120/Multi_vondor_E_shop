import React, { useState, useEffect } from "react";
import {
  AiOutlineFolderAdd,
  AiOutlineGift,
  AiOutlineMenu,
  AiOutlineClose,
} from "react-icons/ai";
import { FiPackage, FiShoppingBag } from "react-icons/fi";
import { MdOutlineLocalOffer } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";
import { VscNewFile } from "react-icons/vsc";
import { CiMoneyBill, CiSettings } from "react-icons/ci";
import { Link, useLocation } from "react-router-dom";
import { BiMessageSquareDetail } from "react-icons/bi";
import { HiOutlineReceiptRefund } from "react-icons/hi";

const DashboardSideBar = ({ active }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    {
      id: 1,
      title: "Dashboard",
      link: "/dashboard",
      icon: RxDashboard,
      badge: null,
    },
    {
      id: 2,
      title: "All Orders",
      link: "/dashboard-orders",
      icon: FiShoppingBag,
      badge: "24",
    },
    {
      id: 3,
      title: "All Products",
      link: "/dashboard-products",
      icon: FiPackage,
      badge: null,
    },
    {
      id: 4,
      title: "Create Product",
      link: "/dashboard-create-product",
      icon: AiOutlineFolderAdd,
      badge: null,
    },
    {
      id: 5,
      title: "All Events",
      link: "/dashboard-events",
      icon: MdOutlineLocalOffer,
      badge: "3",
    },
    {
      id: 6,
      title: "Create Event",
      link: "/dashboard-create-event",
      icon: VscNewFile,
      badge: null,
    },
    {
      id: 7,
      title: "All Coupons",
      link: "/dashboard-coupouns",
      icon: AiOutlineGift,
      badge: null,
    },
    {
      id: 8,
      title: "Messages",
      link: "/dashboard-messages",
      icon: BiMessageSquareDetail,
      badge: "7",
    },
    {
      id: 9,
      title: "Refund Requests",
      link: "/dashboard-refunds",
      icon: HiOutlineReceiptRefund,
      badge: "2",
    },
    {
      id: 10,
      title: "Withdraw Money",
      link: "/dashboard-withdraw-money",
      icon: CiMoneyBill,
      badge: null,
    },
    {
      id: 11,
      title: "Shop Settings",
      link: "/settings",
      icon: CiSettings,
      badge: null,
    },
  ];

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div
        className={`${
          mobile ? "p-5 pb-4" : "p-6 pb-4"
        } border-b border-gray-100/80`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            {(!isCollapsed || mobile) && (
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  Seller Panel
                </h2>
                <p className="text-xs text-gray-500">Manage your store</p>
              </div>
            )}
          </div>
          {!mobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <AiOutlineMenu
                size={16}
                className={`text-gray-500 transition-transform duration-200 ${
                  isCollapsed ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
          {mobile && (
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <AiOutlineClose size={18} className="text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <div
        className={`flex-1 ${
          mobile ? "p-5 pt-4" : "p-6 pt-4"
        } space-y-1 overflow-y-auto`}
      >
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = active === item.id;

          return (
            <Link
              key={item.id}
              to={item.link}
              onClick={() => mobile && setIsMobileSidebarOpen(false)}
              className={`relative flex items-center rounded-xl transition-all duration-200 group ${
                isCollapsed && !mobile
                  ? "p-3 justify-center"
                  : mobile
                  ? "p-4 space-x-4"
                  : "p-3 space-x-3"
              } ${
                isActive
                  ? "bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border border-blue-200/50 shadow-sm"
                  : "hover:bg-gray-50 hover:shadow-sm border border-transparent hover:border-gray-200/50"
              }`}
            >
              <div
                className={`relative flex items-center justify-center rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-110"
                    : mobile
                    ? "bg-gray-100 group-hover:bg-blue-100 text-gray-600 group-hover:text-blue-600"
                    : "text-gray-600 group-hover:text-blue-600"
                } ${
                  mobile ? "w-12 h-12" : isCollapsed ? "w-8 h-8" : "w-8 h-8"
                }`}
              >
                <IconComponent
                  size={mobile ? 20 : isCollapsed ? 18 : 18}
                  className="transition-all duration-200"
                />
              </div>

              {(!isCollapsed || mobile) && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span
                    className={`font-semibold transition-colors duration-200 truncate ${
                      mobile ? "text-base" : "text-sm"
                    } ${
                      isActive
                        ? "text-blue-700"
                        : "text-gray-700 group-hover:text-blue-600"
                    }`}
                  >
                    {item.title}
                  </span>

                  {item.badge && (
                    <span
                      className={`inline-flex items-center justify-center text-xs font-bold rounded-full transition-all duration-200 ${
                        mobile ? "min-w-6 h-6 px-2" : "min-w-5 h-5 px-1.5"
                      } ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 group-hover:bg-blue-100 group-hover:text-blue-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {isActive && (
                <div className="absolute right-2 w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Section */}
      <div
        className={`${
          mobile ? "p-5 pt-4" : "p-6 pt-4"
        } border-t border-gray-100/80`}
      >
        <div
          className={`bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border border-blue-200/50 rounded-xl transition-all duration-200 ${
            isCollapsed && !mobile ? "p-3" : mobile ? "p-4" : "p-4"
          }`}
        >
          {(!isCollapsed || mobile) && (
            <>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-600">
                  Store Status: Active
                </span>
              </div>
              <div className="text-xs text-gray-500 leading-relaxed">
                Your store is live and accepting orders. Keep providing
                excellent service!
              </div>
            </>
          )}
          {isCollapsed && !mobile && (
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mx-auto"></div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/95 backdrop-blur-md border-r border-gray-200/80 shadow-xl transition-all duration-300 z-20 ${
          isCollapsed ? "w-20" : "w-56"
        }`}
      >
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Toggle Button - Fixed Position */}
      <button
        onClick={() => setIsMobileSidebarOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-30 transform hover:scale-110 active:scale-95"
      >
        <AiOutlineMenu size={22} className="animate-pulse" />
      </button>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
          isMobileSidebarOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileSidebarOpen(false)}
        />

        {/* Mobile Sidebar */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white/95 backdrop-blur-md shadow-2xl transform transition-all duration-300 ease-out ${
            isMobileSidebarOpen
              ? "translate-x-0 opacity-100 scale-100"
              : "-translate-x-full opacity-0 scale-95"
          }`}
        >
          <SidebarContent mobile />
        </div>
      </div>
    </>
  );
};

export default DashboardSideBar;
