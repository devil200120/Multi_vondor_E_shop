import React, { useState, useEffect } from "react";
import {
  AiOutlineFolderAdd,
  AiOutlineGift,
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineLogout,
} from "react-icons/ai";
import { FiPackage, FiShoppingBag } from "react-icons/fi";
import { MdOutlineLocalOffer } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";
import { VscNewFile } from "react-icons/vsc";
import { CiMoneyBill, CiSettings } from "react-icons/ci";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BiMessageSquareDetail } from "react-icons/bi";
import { HiOutlineReceiptRefund } from "react-icons/hi";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../../server";
import { logoutSeller } from "../../../redux/actions/user";

const DashboardSideBar = ({ active }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [conversationsCount, setConversationsCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get data from Redux state
  const { orders } = useSelector((state) => state.order);
  const { events } = useSelector((state) => state.events);
  const { products } = useSelector((state) => state.products);
  const { seller } = useSelector((state) => state.seller);

  // Logout handler
  const logoutHandler = async () => {
    try {
      await dispatch(logoutSeller());
      toast.success("Logout successful!");
      navigate("/shop-login");
      setIsMobileSidebarOpen(false); // Close mobile sidebar after logout
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  // Calculate dynamic counts
  const ordersCount = orders ? orders.length : 0;
  const eventsCount = events ? events.length : 0;
  const productsCount = products ? products.length : 0;

  // Count refund requests (orders with "Processing refund" or "Refund Success" status)
  const refundRequestsCount = orders
    ? orders.filter(
        (order) =>
          order.status === "Processing refund" ||
          order.status === "Refund Success"
      ).length
    : 0;

  // Fetch conversations count
  useEffect(() => {
    const getConversationsCount = async () => {
      try {
        if (seller?._id) {
          const response = await axios.get(
            `${server}/conversation/get-all-conversation-seller/${seller._id}`,
            { withCredentials: true }
          );
          setConversationsCount(response.data.conversations?.length || 0);
        }
      } catch (error) {
        console.log("Error fetching conversations:", error);
        setConversationsCount(0);
      }
    };

    getConversationsCount();
  }, [seller]);

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
      badge: ordersCount > 0 ? ordersCount.toString() : null,
    },
    {
      id: 3,
      title: "All Products",
      link: "/dashboard-products",
      icon: FiPackage,
      badge: productsCount > 0 ? productsCount.toString() : null,
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
      badge: eventsCount > 0 ? eventsCount.toString() : null,
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
      badge: conversationsCount > 0 ? conversationsCount.toString() : null,
    },
    {
      id: 9,
      title: "Refund Requests",
      link: "/dashboard-refunds",
      icon: HiOutlineReceiptRefund,
      badge: refundRequestsCount > 0 ? refundRequestsCount.toString() : null,
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

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-xl z-30 mobile-nav-blur">
        <div className="grid grid-cols-5 gap-1 px-2 py-2 safe-area-inset-bottom">
          {/* Show only most important menu items for mobile */}
          {[
            menuItems[0], // Dashboard
            menuItems[1], // All Orders
            menuItems[2], // All Products
            menuItems[7], // Messages
            {
              id: "more",
              title: "More",
              icon: AiOutlineMenu,
              link: "#",
              badge: null,
            },
          ].map((item, index) => {
            const IconComponent = item.icon;
            const isActive = active === item.id;
            const isMoreButton = item.id === "more";

            return (
              <div key={item.id || index} className="relative">
                {isMoreButton ? (
                  <button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className={`w-full flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-200 mobile-nav-item ${
                      isMobileSidebarOpen
                        ? "bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border border-blue-200/50 shadow-sm"
                        : "hover:bg-gray-50 active:bg-gray-100"
                    }`}
                  >
                    <div
                      className={`relative flex items-center justify-center rounded-lg transition-all duration-200 w-7 h-7 ${
                        isMobileSidebarOpen
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-110"
                          : "text-gray-600 hover:text-blue-600"
                      }`}
                    >
                      <IconComponent size={16} />
                    </div>
                    <span
                      className={`text-xs font-medium mt-1 truncate max-w-full ${
                        isMobileSidebarOpen ? "text-blue-700" : "text-gray-600"
                      }`}
                    >
                      {item.title}
                    </span>
                  </button>
                ) : (
                  <Link
                    to={item.link}
                    className={`w-full flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-200 mobile-nav-item ${
                      isActive
                        ? "bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border border-blue-200/50 shadow-sm"
                        : "hover:bg-gray-50 active:bg-gray-100"
                    }`}
                  >
                    <div
                      className={`relative flex items-center justify-center rounded-lg transition-all duration-200 w-7 h-7 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-110"
                          : "text-gray-600 hover:text-blue-600"
                      }`}
                    >
                      <IconComponent size={16} />
                      {item.badge && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-4 h-4 flex items-center justify-center font-bold shadow-sm animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium mt-1 truncate max-w-full ${
                        isActive ? "text-blue-700" : "text-gray-600"
                      }`}
                    >
                      {item.title}
                    </span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Sidebar Overlay - Enhanced for better UX */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
          isMobileSidebarOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        {/* Backdrop with improved blur */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileSidebarOpen(false)}
        />

        {/* Mobile Sidebar - Full menu with improved styling */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white/98 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 transform transition-all duration-300 ease-out ${
            isMobileSidebarOpen
              ? "translate-x-0 opacity-100 scale-100"
              : "-translate-x-full opacity-0 scale-95"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Enhanced Header with Close Button */}
            <div className="p-6 pb-4 border-b border-gray-100/80 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-800">
                      Seller Panel
                    </h2>
                    <p className="text-xs text-gray-500">Manage your store</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 rounded-xl bg-white/70 hover:bg-white border border-gray-200/50 transition-all duration-200 hover:shadow-sm"
                >
                  <AiOutlineClose size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Navigation Items with improved spacing */}
            <div className="flex-1 p-6 pt-4 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = active === item.id;

                return (
                  <Link
                    key={item.id}
                    to={item.link}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`relative flex items-center p-4 space-x-4 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? "bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border border-blue-200/50 shadow-sm"
                        : "hover:bg-gray-50 hover:shadow-sm border border-transparent hover:border-gray-200/50"
                    }`}
                  >
                    <div
                      className={`relative flex items-center justify-center rounded-lg transition-all duration-200 w-12 h-12 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-110"
                          : "bg-gray-100 group-hover:bg-blue-100 text-gray-600 group-hover:text-blue-600"
                      }`}
                    >
                      <IconComponent
                        size={20}
                        className="transition-all duration-200"
                      />
                    </div>

                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span
                        className={`font-semibold transition-colors duration-200 truncate text-base ${
                          isActive
                            ? "text-blue-700"
                            : "text-gray-700 group-hover:text-blue-600"
                        }`}
                      >
                        {item.title}
                      </span>

                      {item.badge && (
                        <span
                          className={`inline-flex items-center justify-center text-xs font-bold rounded-full transition-all duration-200 min-w-6 h-6 px-2 ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-700 group-hover:bg-blue-100 group-hover:text-blue-700"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {isActive && (
                      <div className="absolute right-2 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Enhanced Footer with Logout Option */}
            <div className="p-6 pt-4 border-t border-gray-100/80 space-y-4">
              {/* Logout Button */}
              <button
                onClick={logoutHandler}
                className="w-full flex items-center space-x-4 p-4 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 transition-all duration-200 group"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-100 group-hover:bg-red-200 text-red-600 transition-colors">
                  <AiOutlineLogout size={20} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-base font-semibold text-red-600 group-hover:text-red-700">
                    Logout
                  </p>
                  <p className="text-sm text-red-500">
                    Sign out of your account
                  </p>
                </div>
              </button>

              {/* Store Status Card */}
              <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border border-blue-200/50 rounded-xl p-4">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSideBar;
