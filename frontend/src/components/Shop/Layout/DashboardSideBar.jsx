import React, { useState, useEffect } from "react";
import {
  AiOutlineFolderAdd,
  AiOutlineGift,
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineLogout,
} from "react-icons/ai";
import { FiPackage, FiShoppingBag, FiLock } from "react-icons/fi";
import {
  MdOutlineLocalOffer,
  MdVideoLibrary,
  MdRateReview,
  MdOutlineCampaign,
} from "react-icons/md";
import { RxDashboard } from "react-icons/rx";
import { VscNewFile } from "react-icons/vsc";
import { CiMoneyBill, CiSettings } from "react-icons/ci";
import {
  HiOutlineCalculator,
  HiOutlineReceiptRefund,
  HiExclamationCircle,
} from "react-icons/hi";
import { BsCreditCard2Back, BsMegaphone } from "react-icons/bs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BiMessageSquareDetail } from "react-icons/bi";
import { FaVideo, FaTags } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../../server";
import { logoutSeller } from "../../../redux/actions/user";

const DashboardSideBar = ({ active }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [conversationsCount, setConversationsCount] = useState(0);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionFeatures, setSubscriptionFeatures] = useState(null);
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

  // Fetch current subscription plan
  useEffect(() => {
    const getCurrentSubscription = async () => {
      try {
        const { data } = await axios.get(
          `${server}/subscription/my-subscription`,
          { withCredentials: true }
        );
        if (data.subscription) {
          setCurrentPlan(data.subscription.plan);
          setSubscriptionFeatures(data.subscription.features || {});
          setHasActiveSubscription(
            data.subscription.status === "active" ||
              data.subscription.status === "pending"
          );
        } else {
          setHasActiveSubscription(false);
          setSubscriptionFeatures(null);
        }
      } catch (error) {
        console.log("No active subscription");
        setCurrentPlan(null);
        setHasActiveSubscription(false);
        setSubscriptionFeatures(null);
      }
    };

    getCurrentSubscription();
  }, []);

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
      requiresSubscription: true,
      featureKey: null, // Always accessible with subscription
    },
    {
      id: 2,
      title: "All Orders",
      link: "/dashboard-orders",
      icon: FiShoppingBag,
      badge: ordersCount > 0 ? ordersCount.toString() : null,
      requiresSubscription: true,
      featureKey: null, // Always accessible with subscription
    },
    {
      id: 3,
      title: "All Products",
      link: "/dashboard-products",
      icon: FiPackage,
      badge: productsCount > 0 ? productsCount.toString() : null,
      requiresSubscription: true,
      featureKey: null, // Always accessible with subscription
    },
    {
      id: 4,
      title: "Create Product",
      link: "/dashboard-create-product",
      icon: AiOutlineFolderAdd,
      badge: null,
      requiresSubscription: true,
      featureKey: null, // Always accessible with subscription (but product limit applies)
    },
    {
      id: 7,
      title: "All Coupons",
      link: "/dashboard-coupouns",
      icon: AiOutlineGift,
      badge: null,
      requiresSubscription: true,
      featureKey: null, // Always accessible with subscription
    },
    {
      id: 20,
      title: "Advertisements",
      link: "/dashboard-advertisements",
      icon: BsMegaphone,
      badge: null,
      requiresSubscription: true,
      featureKey: null, // Always accessible with subscription
    },
    {
      id: 21,
      title: "Create Advertisement",
      link: "/dashboard-create-advertisement",
      icon: MdOutlineCampaign,
      badge: null,
      requiresSubscription: true,
      featureKey: null, // Always accessible with subscription
    },
    {
      id: 22,
      title: "Ad Pricing",
      link: "/dashboard-advertisement-pricing",
      icon: FaTags,
      badge: null,
      requiresSubscription: false, // Always accessible to see pricing
      featureKey: null,
    },
    {
      id: 8,
      title: "Video Calls",
      link: "/dashboard-video-calls",
      icon: FaVideo,
      badge: null,
      requiresSubscription: true,
      featureKey: "contactSeller", // Requires contactSeller feature (Silver+)
    },
    {
      id: 9,
      title: "Video Banners",
      link: "/dashboard-video-banners",
      icon: MdVideoLibrary,
      badge: null,
      requiresSubscription: true,
      featureKey: "videoOption", // Requires videoOption feature (Silver+)
    },
    {
      id: 10,
      title: "Create Video Banner",
      link: "/dashboard-create-video-banner",
      icon: AiOutlineFolderAdd,
      badge: null,
      requiresSubscription: true,
      featureKey: "videoOption", // Requires videoOption feature (Silver+)
    },
    {
      id: 15,
      title: "Subscription Plans",
      link: "/shop/subscriptions",
      icon: BsCreditCard2Back,
      badge: currentPlan ? currentPlan.toUpperCase() : "FREE",
      requiresSubscription: false, // Always accessible
      featureKey: null,
    },
    {
      id: 11,
      title: "Messages",
      link: "/dashboard-messages",
      icon: BiMessageSquareDetail,
      badge: conversationsCount > 0 ? conversationsCount.toString() : null,
      requiresSubscription: true,
      featureKey: "contactSeller", // Requires contactSeller feature (Silver+)
    },
    {
      id: 12,
      title: "Refund Requests",
      link: "/dashboard-refunds",
      icon: HiOutlineReceiptRefund,
      badge: refundRequestsCount > 0 ? refundRequestsCount.toString() : null,
      requiresSubscription: true,
      featureKey: null, // Always accessible with subscription
    },
    // REMOVED: Withdraw Money - Payments now go directly to seller
    // {
    //   id: 13,
    //   title: "Withdraw Money",
    //   link: "/dashboard-withdraw-money",
    //   icon: CiMoneyBill,
    //   badge: null,
    //   requiresSubscription: true,
    //   featureKey: null,
    // },
    {
      id: 14,
      title: "Product Shipping",
      link: "/dashboard-product-shipping",
      icon: FiPackage,
      badge: null,
      requiresSubscription: true,
      featureKey: null, // Always accessible with subscription
    },
    {
      id: 16,
      title: "Shop Settings",
      link: "/settings",
      icon: CiSettings,
      badge: null,
      requiresSubscription: true,
      featureKey: null, // Always accessible with subscription
    },
    {
      id: 17,
      title: "GST Settings",
      link: "/dashboard-gst-settings",
      icon: HiOutlineCalculator,
      badge: null,
      requiresSubscription: true,
      featureKey: null, // Always accessible with subscription
    },
    {
      id: 18,
      title: "Review Management",
      link: "/dashboard-reviews",
      icon: MdRateReview,
      badge: null,
      requiresSubscription: true,
      featureKey: null, // Always accessible with subscription
    },
    {
      id: 19,
      title: "Inventory Alerts",
      link: "/dashboard-inventory-alerts",
      icon: HiExclamationCircle,
      badge: null,
      requiresSubscription: true,
      featureKey: null, // Always accessible with subscription
    },
  ];

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header Section */}
      <div
        className={`${
          mobile ? "p-5 pb-4" : "p-6 pb-4"
        } border-b border-gray-100/80 flex-shrink-0`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            {(!isCollapsed || mobile) && (
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-gray-800 truncate">
                  Seller Panel
                </h2>
                <p className="text-xs text-gray-500 truncate">
                  Manage your store
                </p>
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
          mobile ? "p-5 pt-4" : "p-4 pt-4"
        } space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide`}
        style={{
          /* Hide scrollbar for webkit browsers */
          WebkitScrollbar: { display: "none" },
          /* Hide scrollbar for IE, Edge and Firefox */
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = active === item.id;
          // Check if item is locked based on subscription and feature requirements
          const isLocked =
            item.requiresSubscription &&
            (!hasActiveSubscription ||
              (item.featureKey &&
                subscriptionFeatures &&
                !subscriptionFeatures[item.featureKey]));

          // Handle locked item clicks
          const handleClick = (e) => {
            if (isLocked) {
              e.preventDefault();
              // Get the feature name for better error message
              const featureName = item.featureKey
                ? item.featureKey.replace(/([A-Z])/g, " $1").trim()
                : "active subscription";
              toast.warning(
                `This feature requires ${featureName}. Please upgrade your plan!`,
                {
                  position: "top-right",
                  autoClose: 3000,
                }
              );
              navigate("/shop/subscriptions");
            } else if (mobile) {
              setIsMobileSidebarOpen(false);
            }
          };

          return (
            <Link
              key={item.id}
              to={isLocked ? "#" : item.link}
              onClick={handleClick}
              className={`relative flex items-center rounded-xl transition-all duration-200 group ${
                isCollapsed && !mobile
                  ? "p-3 justify-center"
                  : mobile
                  ? "p-4 space-x-4"
                  : "p-3 space-x-3"
              } ${
                isLocked
                  ? "opacity-50 cursor-not-allowed bg-gray-100/50"
                  : isActive
                  ? "bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border border-blue-200/50 shadow-sm"
                  : "hover:bg-gray-50 hover:shadow-sm border border-transparent hover:border-gray-200/50"
              }`}
            >
              <div
                className={`relative flex items-center justify-center rounded-lg transition-all duration-200 ${
                  isLocked
                    ? "bg-gray-200 text-gray-400"
                    : isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-110"
                    : mobile
                    ? "bg-gray-100 group-hover:bg-blue-100 text-gray-600 group-hover:text-blue-600"
                    : "text-gray-600 group-hover:text-blue-600"
                } ${
                  mobile ? "w-12 h-12" : isCollapsed ? "w-8 h-8" : "w-8 h-8"
                }`}
              >
                {isLocked ? (
                  <FiLock
                    size={mobile ? 20 : isCollapsed ? 18 : 18}
                    className="transition-all duration-200"
                  />
                ) : (
                  <IconComponent
                    size={mobile ? 20 : isCollapsed ? 18 : 18}
                    className="transition-all duration-200"
                  />
                )}
              </div>

              {(!isCollapsed || mobile) && (
                <div className="flex-1 flex items-center justify-between min-w-0 overflow-hidden">
                  <span
                    className={`font-semibold transition-colors duration-200 truncate flex-shrink mr-2 ${
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
                      className={`inline-flex items-center justify-center text-xs font-medium rounded-full transition-all duration-200 leading-none ${
                        mobile
                          ? "min-w-[22px] h-[22px] px-2"
                          : "min-w-5 h-5 px-1.5"
                      } ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-red-500 text-white shadow-lg"
                      }`}
                    >
                      {item.badge > 99 ? "99+" : item.badge}
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
          mobile ? "p-5 pt-4" : "p-4 pt-4"
        } border-t border-gray-100/80 flex-shrink-0`}
      >
        {!hasActiveSubscription ? (
          // Free user - Show subscription warning
          <div
            className={`bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 border border-orange-200/50 rounded-xl transition-all duration-200 ${
              isCollapsed && !mobile ? "p-3" : mobile ? "p-4" : "p-4"
            }`}
          >
            {(!isCollapsed || mobile) && (
              <>
                <div className="flex items-center space-x-2 mb-2">
                  <FiLock className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-orange-700">
                    FREE PLAN - Limited Access
                  </span>
                </div>
                <div className="text-xs text-orange-600 leading-relaxed mb-3">
                  Subscribe to unlock all features and start selling!
                </div>
                <Link
                  to="/shop/subscriptions"
                  className="block w-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold py-2 px-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 text-center"
                  onClick={() => mobile && setIsMobileSidebarOpen(false)}
                >
                  View Plans →
                </Link>
              </>
            )}
            {isCollapsed && !mobile && (
              <FiLock className="w-4 h-4 text-orange-500 mx-auto" />
            )}
          </div>
        ) : (
          // Subscribed user - Show active status
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
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/95 backdrop-blur-md border-r border-gray-200/80 shadow-xl transition-all duration-300 z-20 overflow-hidden ${
          isCollapsed ? "w-20" : "w-64"
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
                    className={`w-full flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all duration-200 mobile-nav-item ${
                      isMobileSidebarOpen
                        ? "bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border border-blue-200/50 shadow-sm"
                        : "hover:bg-gray-50 active:bg-gray-100"
                    }`}
                  >
                    <div
                      className={`relative flex items-center justify-center rounded-lg transition-all duration-200 w-8 h-8 mb-1 ${
                        isMobileSidebarOpen
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-110"
                          : "text-gray-600 hover:text-blue-600"
                      }`}
                    >
                      <IconComponent size={16} />
                    </div>
                    <span
                      className={`text-xs font-medium truncate max-w-full leading-tight ${
                        isMobileSidebarOpen ? "text-blue-700" : "text-gray-600"
                      }`}
                    >
                      {item.title}
                    </span>
                  </button>
                ) : (
                  <Link
                    to={item.link}
                    className={`w-full flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all duration-200 mobile-nav-item relative ${
                      isActive
                        ? "bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border border-blue-200/50 shadow-sm"
                        : "hover:bg-gray-50 active:bg-gray-100"
                    }`}
                  >
                    {/* Notification Badge - Properly sized and centered */}
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium shadow-lg z-10 border-2 border-white px-1">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}

                    <div
                      className={`relative flex items-center justify-center rounded-lg transition-all duration-200 w-8 h-8 mb-1 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-110"
                          : "text-gray-600 hover:text-blue-600"
                      }`}
                    >
                      <IconComponent size={16} />
                    </div>

                    <span
                      className={`text-xs font-medium truncate max-w-full leading-tight ${
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

        {/* Mobile Sidebar - Unacademy Style */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl transform transition-all duration-300 ease-out ${
            isMobileSidebarOpen
              ? "translate-x-0 opacity-100 scale-100"
              : "-translate-x-full opacity-0 scale-95"
          }`}
        >
          <div className="h-full flex flex-col bg-gray-50">
            {/* Header - Unacademy Style */}
            <div className="bg-white p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">
                      Seller Panel
                    </h1>
                    <p className="text-sm text-gray-500">Manage your store</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <AiOutlineClose size={16} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Main Menu Section */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-6">
              {/* Dashboard Card */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Overview
                </h3>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center p-4 transition-all duration-200 ${
                      active === 1
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        active === 1
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <RxDashboard size={20} />
                    </div>
                    <div className="ml-3 flex-1">
                      <h4
                        className={`font-semibold text-base ${
                          active === 1 ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        Dashboard
                      </h4>
                      <p className="text-sm text-gray-500">View analytics</p>
                    </div>
                    {active === 1 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>
                </div>
              </div>

              {/* Orders & Products Section */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Orders & Products
                </h3>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* All Orders */}
                  <Link
                    to="/dashboard-orders"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center p-4 border-b border-gray-50 transition-all duration-200 ${
                      active === 2
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center relative ${
                        active === 2
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <FiShoppingBag size={18} />
                      {ordersCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center font-bold">
                          {ordersCount}
                        </span>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <h4
                        className={`font-semibold text-base ${
                          active === 2 ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        All Orders
                      </h4>
                      <p className="text-sm text-gray-500">Manage orders</p>
                    </div>
                    {active === 2 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>

                  {/* All Products */}
                  <Link
                    to="/dashboard-products"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center p-4 border-b border-gray-50 transition-all duration-200 ${
                      active === 3
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center relative ${
                        active === 3
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <FiPackage size={18} />
                      {productsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center font-bold">
                          {productsCount}
                        </span>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <h4
                        className={`font-semibold text-base ${
                          active === 3 ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        All Products
                      </h4>
                      <p className="text-sm text-gray-500">Product catalog</p>
                    </div>
                    {active === 3 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>

                  {/* Create Product */}
                  <Link
                    to="/dashboard-create-product"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center p-4 transition-all duration-200 ${
                      active === 4
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        active === 4
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <AiOutlineFolderAdd size={18} />
                    </div>
                    <div className="ml-3 flex-1">
                      <h4
                        className={`font-semibold text-base ${
                          active === 4 ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        Create Product
                      </h4>
                      <p className="text-sm text-gray-500">Add new product</p>
                    </div>
                    {active === 4 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>
                </div>
              </div>

              {/* Events & Promotions Section */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Events & Promotions
                </h3>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* All Events */}
                  <Link
                    to="/dashboard-events"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center p-4 border-b border-gray-50 transition-all duration-200 ${
                      active === 5
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center relative ${
                        active === 5
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <MdOutlineLocalOffer size={18} />
                      {eventsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center font-bold">
                          {eventsCount}
                        </span>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <h4
                        className={`font-semibold text-base ${
                          active === 5 ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        All Events
                      </h4>
                      <p className="text-sm text-gray-500">Event management</p>
                    </div>
                    {active === 5 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>

                  {/* Create Event */}
                  <Link
                    to="/dashboard-create-event"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center p-4 border-b border-gray-50 transition-all duration-200 ${
                      active === 6
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        active === 6
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <VscNewFile size={18} />
                    </div>
                    <div className="ml-3 flex-1">
                      <h4
                        className={`font-semibold text-base ${
                          active === 6 ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        Create Event
                      </h4>
                      <p className="text-sm text-gray-500">New event</p>
                    </div>
                    {active === 6 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>

                  {/* All Coupons */}
                  <Link
                    to="/dashboard-coupouns"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center p-4 transition-all duration-200 ${
                      active === 7
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        active === 7
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <AiOutlineGift size={18} />
                    </div>
                    <div className="ml-3 flex-1">
                      <h4
                        className={`font-semibold text-base ${
                          active === 7 ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        All Coupons
                      </h4>
                      <p className="text-sm text-gray-500">Discount codes</p>
                    </div>
                    {active === 7 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>
                </div>
              </div>

              {/* Communication Section */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Communication
                </h3>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Video Calls */}
                  <Link
                    to="/dashboard-video-calls"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center p-4 border-b border-gray-50 transition-all duration-200 ${
                      active === 8
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        active === 8
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <FaVideo size={18} />
                    </div>
                    <div className="ml-3 flex-1">
                      <h4
                        className={`font-semibold text-base ${
                          active === 8 ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        Video Calls
                      </h4>
                      <p className="text-sm text-gray-500">Customer support</p>
                    </div>
                    {active === 8 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>

                  {/* Messages */}
                  <Link
                    to="/dashboard-messages"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center p-4 border-b border-gray-50 transition-all duration-200 ${
                      active === 9
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center relative ${
                        active === 9
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <BiMessageSquareDetail size={18} />
                      {conversationsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center font-bold">
                          {conversationsCount}
                        </span>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <h4
                        className={`font-semibold text-base ${
                          active === 9 ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        Messages
                      </h4>
                      <p className="text-sm text-gray-500">Customer chat</p>
                    </div>
                    {active === 9 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>

                  {/* Refund Requests */}
                  <Link
                    to="/dashboard-refunds"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center p-4 transition-all duration-200 ${
                      active === 10
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center relative ${
                        active === 10
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <HiOutlineReceiptRefund size={18} />
                      {refundRequestsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center font-bold">
                          {refundRequestsCount}
                        </span>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <h4
                        className={`font-semibold text-base ${
                          active === 10 ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        Refund Requests
                      </h4>
                      <p className="text-sm text-gray-500">Handle refunds</p>
                    </div>
                    {active === 10 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>
                </div>
              </div>

              {/* Financial Section */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Financial
                </h3>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Withdraw Money */}
                  <Link
                    to="/dashboard-withdraw-money"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center p-4 border-b border-gray-50 transition-all duration-200 ${
                      active === 11
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        active === 11
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <CiMoneyBill size={18} />
                    </div>
                    <div className="ml-3 flex-1">
                      <h4
                        className={`font-semibold text-base ${
                          active === 11 ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        Withdraw Money
                      </h4>
                      <p className="text-sm text-gray-500">Available: ₹0.00</p>
                    </div>
                    {active === 11 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>

                  {/* Product Shipping */}
                  <Link
                    to="/dashboard-product-shipping"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center p-4 border-b border-gray-50 transition-all duration-200 ${
                      active === 12
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        active === 12
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <FiPackage size={18} />
                    </div>
                    <div className="ml-3 flex-1">
                      <h4
                        className={`font-semibold text-base ${
                          active === 12 ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        Product Shipping
                      </h4>
                      <p className="text-sm text-gray-500">
                        Configure per product
                      </p>
                    </div>
                    {active === 12 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>

                  {/* Shop Settings */}
                  <Link
                    to="/settings"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center p-4 border-b border-gray-50 transition-all duration-200 ${
                      active === 13
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        active === 13
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <CiSettings size={18} />
                    </div>
                    <div className="ml-3 flex-1">
                      <h4
                        className={`font-semibold text-base ${
                          active === 13 ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        Shop Settings
                      </h4>
                      <p className="text-sm text-gray-500">
                        Store configuration
                      </p>
                    </div>
                    {active === 13 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>

                  {/* GST Settings */}
                  <Link
                    to="/dashboard-gst-settings"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center p-4 border-b border-gray-50 transition-all duration-200 ${
                      active === 17
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        active === 17
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <HiOutlineCalculator size={18} />
                    </div>
                    <div className="ml-3 flex-1">
                      <h4
                        className={`font-semibold text-base ${
                          active === 17 ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        GST Settings
                      </h4>
                      <p className="text-sm text-gray-500">Tax configuration</p>
                    </div>
                    {active === 17 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>

                  {/* Review Management */}
                  <Link
                    to="/dashboard-reviews"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center p-4 border-b border-gray-50 transition-all duration-200 ${
                      active === 18
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        active === 18
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <MdRateReview size={18} />
                    </div>
                    <div className="ml-3 flex-1">
                      <h4
                        className={`font-semibold text-base ${
                          active === 18 ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        Review Management
                      </h4>
                      <p className="text-sm text-gray-500">Manage reviews</p>
                    </div>
                    {active === 18 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>

                  {/* Inventory Alerts */}
                  <Link
                    to="/dashboard-inventory-alerts"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center p-4 transition-all duration-200 ${
                      active === 19
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        active === 19
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <HiExclamationCircle size={18} />
                    </div>
                    <div className="ml-3 flex-1">
                      <h4
                        className={`font-semibold text-base ${
                          active === 19 ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        Inventory Alerts
                      </h4>
                      <p className="text-sm text-gray-500">Stock monitoring</p>
                    </div>
                    {active === 19 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>

                  {/* Subscription Plans */}
                  <Link
                    to="/shop/subscriptions"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center p-4 transition-all duration-200 ${
                      active === 15
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        active === 15
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <BsCreditCard2Back size={18} />
                    </div>
                    <div className="ml-3 flex-1">
                      <h4
                        className={`font-semibold text-base ${
                          active === 15 ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        Subscription Plans
                      </h4>
                      <p className="text-sm text-gray-500">
                        {currentPlan ? currentPlan.toUpperCase() : "FREE"}
                      </p>
                    </div>
                    {active === 15 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer Section - Unacademy Style */}
            <div className="p-4 bg-white border-t border-gray-100">
              {/* Logout Button */}
              <button
                onClick={logoutHandler}
                className="w-full flex items-center space-x-3 p-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 transition-all duration-200 group mb-3"
              >
                <div className="w-10 h-10 rounded-xl bg-red-100 group-hover:bg-red-200 flex items-center justify-center text-red-600 transition-colors">
                  <AiOutlineLogout size={18} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-red-600 group-hover:text-red-700">
                    Logout
                  </h4>
                  <p className="text-sm text-red-500">
                    Sign out of your account
                  </p>
                </div>
              </button>

              {/* Store Status */}
              <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-green-700">
                    Store Active
                  </span>
                </div>
                <p className="text-xs text-green-600">
                  Your store is live and accepting orders
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSideBar;
