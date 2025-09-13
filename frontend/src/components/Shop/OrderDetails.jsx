import React, { useEffect, useState, useRef } from "react";
import styles from "../../styles/styles";
import {
  BsFillBagFill,
  BsArrowLeft,
  BsCalendar3,
  BsGeoAlt,
  BsCreditCard,
  BsCheckCircle,
  BsClock,
  BsTruck,
  BsBox,
  BsBroadcast,
  BsEye,
  BsBell,
} from "react-icons/bs";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { backend_url, server } from "../../server";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { useDispatch, useSelector } from "react-redux";
import OrderLocationMap from "./OrderLocationMap";
import socketIO from "socket.io-client";
const SOCKET_ENDPOINT = "https://multi-vondor-e-shop-2.onrender.com";

const OrderDetails = () => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();

  const [status, setStatus] = useState("");
  const [shopLocation, setShopLocation] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [realTimeStatus, setRealTimeStatus] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    dispatch(getAllOrdersOfShop(seller._id));
  }, [dispatch, seller._id]);

  // Initialize socket connection for real-time tracking
  useEffect(() => {
    if (seller?._id && id) {
      socketRef.current = socketIO(SOCKET_ENDPOINT);
      socketRef.current.emit("addUser", seller._id);

      // Join order tracking room
      socketRef.current.emit("joinOrderTracking", {
        orderId: id,
        userId: seller._id,
        userType: "seller",
      });

      // Listen for real-time order updates
      socketRef.current.on("orderStatusUpdate", (updateData) => {
        if (updateData.orderId === id) {
          setRealTimeStatus(updateData.status);
          setLastUpdated(new Date());
          dispatch(getAllOrdersOfShop(seller._id));

          // Add notification
          const notification = {
            id: Date.now(),
            message: `Order status updated to: ${updateData.status}`,
            time: new Date(),
            type: "status",
          };
          setNotifications((prev) => [notification, ...prev.slice(0, 4)]);

          toast.info(`Order status updated to: ${updateData.status}`);
        }
      });

      // Listen for delivery partner updates
      socketRef.current.on("deliveryUpdate", (updateData) => {
        if (updateData.orderId === id) {
          const notification = {
            id: Date.now(),
            message: updateData.message,
            time: new Date(),
            type: "delivery",
          };
          setNotifications((prev) => [notification, ...prev.slice(0, 4)]);
          toast.info(updateData.message);
        }
      });

      // Listen for timeline updates
      socketRef.current.on("orderTimelineUpdate", (eventData) => {
        if (eventData.orderId === id) {
          const notification = {
            id: Date.now(),
            message: `${eventData.event}: ${eventData.description}`,
            time: new Date(),
            type: "timeline",
          };
          setNotifications((prev) => [notification, ...prev.slice(0, 4)]);
        }
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.emit("leaveOrderTracking", {
            orderId: id,
            userId: seller._id,
          });
          socketRef.current.disconnect();
        }
      };
    }
  }, [seller?._id, id, dispatch]);

  // Auto-refresh functionality
  useEffect(() => {
    let interval;
    if (autoRefresh && !isLiveTracking) {
      interval = setInterval(() => {
        dispatch(getAllOrdersOfShop(seller._id));
        setLastUpdated(new Date());
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, isLiveTracking, seller._id, dispatch]);

  // Set shop location from seller data
  useEffect(() => {
    if (seller) {
      setShopLocation({
        address: seller.address,
        latitude: seller.latitude,
        longitude: seller.longitude,
      });
    }
  }, [seller]);

  const data = orders && orders.find((item) => item._id === id);

  const orderUpdateHandler = async (e) => {
    if (!status) {
      toast.error("Please select a status");
      return;
    }

    setIsUpdating(true);
    try {
      await axios.put(
        `${server}/order/update-order-status/${id}`,
        { status },
        { withCredentials: true }
      );

      // Broadcast real-time update
      if (socketRef.current) {
        socketRef.current.emit("orderStatusChanged", {
          orderId: id,
          status: status,
          shopId: seller._id,
          timestamp: new Date(),
        });
      }

      toast.success("Order status updated successfully!");
      dispatch(getAllOrdersOfShop(seller._id));
      setStatus(""); // Reset status selector
      setLastUpdated(new Date());
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order");
    } finally {
      setIsUpdating(false);
    }
  };

  const refundOrderUpdateHandler = async (e) => {
    if (!status) {
      toast.error("Please select a status");
      return;
    }

    setIsUpdating(true);
    try {
      await axios.put(
        `${server}/order/order-refund-success/${id}`,
        { status },
        { withCredentials: true }
      );

      // Broadcast real-time update
      if (socketRef.current) {
        socketRef.current.emit("orderStatusChanged", {
          orderId: id,
          status: status,
          shopId: seller._id,
          timestamp: new Date(),
          type: "refund",
        });
      }

      toast.success("Refund status updated successfully!");
      dispatch(getAllOrdersOfShop(seller._id));
      setStatus(""); // Reset status selector
      setLastUpdated(new Date());
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update refund");
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle live tracking
  const toggleLiveTracking = () => {
    setIsLiveTracking(!isLiveTracking);
    if (!isLiveTracking) {
      toast.success("Live tracking enabled!");
      setAutoRefresh(false); // Disable auto-refresh when live tracking is on
    } else {
      toast.info("Live tracking disabled");
    }
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    if (!autoRefresh) {
      toast.success("Auto-refresh enabled (30s intervals)");
      setIsLiveTracking(false); // Disable live tracking when auto-refresh is on
    } else {
      toast.info("Auto-refresh disabled");
    }
  };

  // Clear notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Manual refresh
  const handleManualRefresh = () => {
    dispatch(getAllOrdersOfShop(seller._id));
    setLastUpdated(new Date());
    toast.success("Order data refreshed");
  };

  // Send test notification (for demo purposes)
  const sendTestNotification = () => {
    if (socketRef.current) {
      socketRef.current.emit("addOrderEvent", {
        orderId: id,
        event: "Test Event",
        description: "This is a test notification for real-time tracking",
        timestamp: new Date(),
      });
    }
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    const statusMap = {
      Processing: {
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
        icon: BsClock,
      },
      "Transferred to delivery partner": {
        color: "text-blue-600 bg-blue-50 border-blue-200",
        icon: BsTruck,
      },
      Shipping: {
        color: "text-purple-600 bg-purple-50 border-purple-200",
        icon: BsTruck,
      },
      Received: {
        color: "text-indigo-600 bg-indigo-50 border-indigo-200",
        icon: BsBox,
      },
      "On the way": {
        color: "text-orange-600 bg-orange-50 border-orange-200",
        icon: BsTruck,
      },
      Delivered: {
        color: "text-green-600 bg-green-50 border-green-200",
        icon: BsCheckCircle,
      },
      "Processing refund": {
        color: "text-red-600 bg-red-50 border-red-200",
        icon: BsClock,
      },
      "Refund Success": {
        color: "text-green-600 bg-green-50 border-green-200",
        icon: BsCheckCircle,
      },
    };
    return (
      statusMap[status] || {
        color: "text-gray-600 bg-gray-50 border-gray-200",
        icon: BsClock,
      }
    );
  };

  const statusInfo = getStatusInfo(data?.status);
  const StatusIcon = statusInfo.icon;

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c4980] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard-orders"
                className="flex items-center text-gray-600 hover:text-[#1c4980] transition-colors"
              >
                <BsArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#1c4980] rounded-lg">
                  <BsFillBagFill className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Order Details
                  </h1>
                  <p className="text-sm text-gray-600">
                    Manage order status and view details
                  </p>
                </div>
              </div>
            </div>
            <Link
              to="/dashboard-orders"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-Time Tracking Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BsBroadcast
                    className={`w-5 h-5 ${
                      isLiveTracking ? "text-green-600" : "text-blue-600"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Real-Time Tracking
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isLiveTracking
                      ? "Live tracking active"
                      : "Enable live order tracking and notifications"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {lastUpdated && (
                  <span className="text-xs text-gray-500">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
                <div
                  className={`w-3 h-3 rounded-full ${
                    isLiveTracking
                      ? "bg-green-500 animate-pulse"
                      : "bg-gray-300"
                  }`}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Live Tracking Toggle */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Live Tracking
                  </span>
                  <button
                    onClick={toggleLiveTracking}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isLiveTracking ? "bg-green-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isLiveTracking ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-600">
                  {isLiveTracking
                    ? "Receiving live updates"
                    : "Enable for instant notifications"}
                </p>
              </div>

              {/* Auto Refresh Toggle */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Auto Refresh
                  </span>
                  <button
                    onClick={toggleAutoRefresh}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoRefresh ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoRefresh ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-600">
                  {autoRefresh ? "Refreshing every 30s" : "Manual refresh only"}
                </p>
              </div>

              {/* Notifications */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Notifications
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {notifications.length}
                    </span>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  Recent updates and alerts
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={handleManualRefresh}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <BsEye className="w-4 h-4 inline mr-2" />
                Refresh Now
              </button>
              <button
                onClick={sendTestNotification}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <BsBell className="w-4 h-4 inline mr-2" />
                Test Alert
              </button>
            </div>

            {/* Recent Notifications */}
            {notifications.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <BsBell className="w-4 h-4 mr-2" />
                  Recent Notifications
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg text-sm"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          notification.type === "status"
                            ? "bg-blue-500"
                            : "bg-green-500"
                        }`}
                      ></div>
                      <span className="flex-1 text-gray-700">
                        {notification.message}
                      </span>
                      <span className="text-xs text-gray-500">
                        {notification.time.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <BsFillBagFill className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    #{data._id.slice(0, 8)}
                  </h2>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <BsCalendar3 className="w-4 h-4" />
                      <span>
                        Placed on{" "}
                        {new Date(data.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div
                  className={`px-4 py-2 rounded-full border ${statusInfo.color} flex items-center space-x-2`}
                >
                  <StatusIcon className="w-4 h-4" />
                  <span className="font-medium">{data.status}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    US${data.totalPrice}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Items
            </h3>
            <div className="space-y-4">
              {data.cart.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <img
                      src={`${backend_url}/${item.images[0]}`}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-medium text-gray-900 truncate">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.qty}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      US${item.discountPrice}
                    </p>
                    <p className="text-sm text-gray-600">Each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer & Shipping Info */}
          <div className="space-y-8">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BsGeoAlt className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Shipping Address
                  </h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">
                      {data.user.name}
                    </p>
                    <p className="text-gray-700">
                      {data.shippingAddress.address1}
                      {data.shippingAddress.address2 &&
                        `, ${data.shippingAddress.address2}`}
                    </p>
                    <p className="text-gray-700">
                      {data.shippingAddress.city},{" "}
                      {data.shippingAddress.country}
                    </p>
                    <p className="text-gray-700">
                      ZIP: {data.shippingAddress.zipCode}
                    </p>
                    <p className="text-gray-700">
                      Phone: {data.user.phoneNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BsCreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Payment Information
                  </h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Status:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          data.paymentInfo?.status === "Succeeded"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {data.paymentInfo?.status || "Not Paid"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium text-gray-900">
                        {data.paymentInfo?.type || "Cash on Delivery"}
                      </span>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total Amount:</span>
                        <span className="text-[#1c4980]">
                          US${data.totalPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Status Management */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <BsTruck className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order Status Management
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-600">
                        Current status:
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                      >
                        {realTimeStatus || data.status}
                      </span>
                      {realTimeStatus && realTimeStatus !== data.status && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          Updated
                        </span>
                      )}
                    </div>
                  </div>
                  {isLiveTracking && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium">Live</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Update Order Status
                    </label>
                    {data.status !== "Processing refund" &&
                    data.status !== "Refund Success" ? (
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4980] focus:border-transparent transition-colors"
                      >
                        <option value="">Select new status...</option>
                        {[
                          "Processing",
                          "Transferred to delivery partner",
                          "Shipping",
                          "Received",
                          "On the way",
                          "Delivered",
                        ]
                          .slice(
                            [
                              "Processing",
                              "Transferred to delivery partner",
                              "Shipping",
                              "Received",
                              "On the way",
                              "Delivered",
                            ].indexOf(data.status)
                          )
                          .map((option, index) => (
                            <option value={option} key={index}>
                              {option}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4980] focus:border-transparent transition-colors"
                      >
                        <option value="">Select refund status...</option>
                        {["Processing refund", "Refund Success"]
                          .slice(
                            ["Processing refund", "Refund Success"].indexOf(
                              data.status
                            )
                          )
                          .map((option, index) => (
                            <option value={option} key={index}>
                              {option}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>

                  <button
                    onClick={
                      data.status !== "Processing refund"
                        ? orderUpdateHandler
                        : refundOrderUpdateHandler
                    }
                    disabled={!status || isUpdating}
                    className="w-full bg-[#1c4980] hover:bg-[#164070] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <BsCheckCircle className="w-4 h-4" />
                        <span>Update Status</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Map */}
        <div className="mt-8">
          <OrderLocationMap order={data} shopLocation={shopLocation} />
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
