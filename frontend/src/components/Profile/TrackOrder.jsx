import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getAllOrdersOfUser } from "../../redux/actions/order";
import {
  FiPackage,
  FiTruck,
  FiMapPin,
  FiCheck,
  FiClock,
  FiArrowLeft,
} from "react-icons/fi";
import { MdLocalShipping, MdStore, MdHome } from "react-icons/md";
import { Link } from "react-router-dom";

const TrackOrder = () => {
  const { orders } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { id } = useParams();

  useEffect(() => {
    if (user?._id) {
      dispatch(getAllOrdersOfUser(user._id));
    }
  }, [dispatch, user]);

  const data = orders && orders.find((item) => item._id === id);

  // Define order statuses with timeline
  const orderStatuses = [
    {
      status: "Processing",
      title: "Order Confirmed",
      description: "We have received your order and are preparing it",
      icon: FiPackage,
      color: "blue",
    },
    {
      status: "Transferred to delivery partner",
      title: "Picked up by Courier",
      description: "Your order has been picked up by our delivery partner",
      icon: MdStore,
      color: "blue",
    },
    {
      status: "Shipping",
      title: "In Transit",
      description: "Your order is on the way to destination",
      icon: FiTruck,
      color: "blue",
    },
    {
      status: "Received",
      title: "Out for Delivery",
      description:
        "Your order has reached your city and will be delivered soon",
      icon: MdLocalShipping,
      color: "blue",
    },
    {
      status: "On the way",
      title: "Out for Delivery",
      description: "Our delivery executive is on the way to deliver your order",
      icon: FiMapPin,
      color: "orange",
    },
    {
      status: "Delivered",
      title: "Delivered",
      description: "Your order has been successfully delivered",
      icon: FiCheck,
      color: "green",
    },
  ];

  // Define refund statuses
  const refundStatuses = [
    {
      status: "Processing refund",
      title: "Refund Processing",
      description: "Your refund request is being processed",
      icon: FiClock,
      color: "orange",
    },
    {
      status: "Refund Success",
      title: "Refund Completed",
      description: "Your refund has been successfully processed",
      icon: FiCheck,
      color: "green",
    },
  ];

  // Check if order is in refund process
  const isRefundProcess =
    data &&
    (data.status === "Processing refund" || data.status === "Refund Success");

  // Use appropriate status array
  const currentStatuses = isRefundProcess ? refundStatuses : orderStatuses;

  // Get current status index
  const getCurrentStatusIndex = () => {
    if (!data) return -1;
    return currentStatuses.findIndex((status) => status.status === data.status);
  };

  // Calculate estimated delivery date
  const getEstimatedDelivery = () => {
    if (!data) return null;
    const orderDate = new Date(data.createdAt);
    const currentStatus = data.status;

    let daysToAdd = 7; // Default 7 days

    switch (currentStatus) {
      case "Processing":
        daysToAdd = 6;
        break;
      case "Transferred to delivery partner":
        daysToAdd = 4;
        break;
      case "Shipping":
        daysToAdd = 3;
        break;
      case "Received":
        daysToAdd = 1;
        break;
      case "On the way":
        daysToAdd = 0;
        break;
      case "Delivered":
        return new Date(data.deliveredAt || data.createdAt);
      default:
        daysToAdd = 7;
    }

    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(orderDate.getDate() + daysToAdd);
    return estimatedDate;
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const currentStatusIndex = getCurrentStatusIndex();
  const estimatedDelivery = getEstimatedDelivery();

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="p-4 bg-white rounded-full shadow-lg inline-block mb-6">
            <FiPackage className="text-6xl text-gray-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            The order you're looking for doesn't exist or may have been removed.
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg font-medium group"
          >
            <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            to="/profile"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors duration-200 group"
          >
            <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Orders</span>
          </Link>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Track Your Order
            </h1>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              Order ID:{" "}
              <span className="font-semibold text-blue-600">
                #{data._id.slice(-8).toUpperCase()}
              </span>
            </p>

            {/* Progress Bar */}
            {!isRefundProcess && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span className="font-medium">Order Progress</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                    {Math.round(
                      ((currentStatusIndex + 1) / currentStatuses.length) * 100
                    )}
                    % Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
                    style={{
                      width: `${
                        ((currentStatusIndex + 1) / currentStatuses.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Order Timeline */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FiTruck className="w-6 h-6 mr-3 text-blue-600" />
                Order Status
              </h2>

              {/* Estimated Delivery */}
              {!isRefundProcess &&
                data.status !== "Delivered" &&
                estimatedDelivery && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-5 mb-6 shadow-sm">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <FiClock className="text-blue-600 w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900 text-base">
                          Estimated Delivery: {formatDate(estimatedDelivery)}
                        </p>
                        <p className="text-sm text-blue-700">
                          Expected by end of day
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Refund Info */}
              {isRefundProcess && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 sm:p-5 mb-6 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg mr-3">
                      <FiClock className="text-orange-600 w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-orange-900 text-base">
                        {data.status === "Refund Success"
                          ? "Refund Completed"
                          : "Processing Refund"}
                      </p>
                      <p className="text-sm text-orange-700">
                        {data.status === "Refund Success"
                          ? "Amount will be credited to your account within 3-5 business days"
                          : "Refund will be processed within 3-5 business days"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-6">
                {currentStatuses.map((statusItem, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const IconComponent = statusItem.icon;

                  // Get timestamp from status history if available
                  const statusHistory = data.statusHistory?.find(
                    (history) => history.status === statusItem.status
                  );

                  return (
                    <div key={index} className="flex items-start">
                      {/* Timeline Icon */}
                      <div className="flex-shrink-0 mr-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                            isCompleted
                              ? isCurrent
                                ? statusItem.color === "green"
                                  ? "bg-green-500 border-green-500 text-white"
                                  : statusItem.color === "orange"
                                  ? "bg-orange-500 border-orange-500 text-white"
                                  : "bg-blue-500 border-blue-500 text-white"
                                : "bg-green-500 border-green-500 text-white"
                              : "bg-gray-100 border-gray-300 text-gray-400"
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        {/* Connector Line */}
                        {index < orderStatuses.length - 1 && (
                          <div
                            className={`w-0.5 h-12 mx-auto mt-2 ${
                              index < currentStatusIndex
                                ? "bg-green-500"
                                : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>

                      {/* Timeline Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3
                            className={`text-lg font-medium ${
                              isCompleted ? "text-gray-900" : "text-gray-500"
                            }`}
                          >
                            {statusItem.title}
                          </h3>
                          {statusHistory && (
                            <span className="text-sm text-gray-500">
                              {formatTime(new Date(statusHistory.timestamp))}
                            </span>
                          )}
                          {isCurrent && !statusHistory && (
                            <span className="text-sm text-gray-500">
                              {formatTime(new Date())}
                            </span>
                          )}
                        </div>
                        <p
                          className={`mt-1 text-sm ${
                            isCompleted ? "text-gray-600" : "text-gray-400"
                          }`}
                        >
                          {statusHistory?.note || statusItem.description}
                        </p>
                        {statusHistory && (
                          <p className="mt-1 text-xs text-gray-500">
                            {formatDate(new Date(statusHistory.timestamp))}
                          </p>
                        )}
                        {isCurrent && data.status === "Delivered" && (
                          <p className="mt-2 text-sm text-green-600 font-medium">
                            Delivered on{" "}
                            {formatDate(
                              new Date(data.deliveredAt || data.createdAt)
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Details Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center">
                <FiPackage className="w-5 h-5 mr-2 text-blue-600" />
                Order Details
              </h3>

              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 font-medium">
                    Order Date
                  </p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(new Date(data.createdAt))}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 font-medium">
                    Total Amount
                  </p>
                  <p className="font-bold text-gray-900 text-lg">
                    ₹{data.totalPrice}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 font-medium">
                    Payment Status
                  </p>
                  <p className="font-semibold text-green-600">
                    {data.paymentInfo?.status || "Paid"}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 font-medium">Items</p>
                  <p className="font-semibold text-gray-900">
                    {data.cart?.length || 0} item
                    {data.cart?.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {data.trackingNumber && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-700 font-medium">
                      Tracking Number
                    </p>
                    <p className="font-semibold text-blue-900 text-sm break-all">
                      {data.trackingNumber}
                    </p>
                  </div>
                )}

                {data.courierPartner && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-sm text-green-700 font-medium">
                      Courier Partner
                    </p>
                    <p className="font-semibold text-green-900">
                      {data.courierPartner}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <MdHome className="w-5 h-5 text-blue-600" />
                </div>
                Shipping Address
              </h3>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-sm text-gray-700 space-y-2">
                  <p className="font-semibold text-gray-900 text-base">
                    {data.shippingAddress?.address1}
                  </p>
                  {data.shippingAddress?.address2 && (
                    <p className="text-gray-600">
                      {data.shippingAddress.address2}
                    </p>
                  )}
                  <p className="text-gray-600">
                    {data.shippingAddress?.city},{" "}
                    {data.shippingAddress?.country}
                  </p>
                  <p className="text-gray-600 font-medium">
                    {data.shippingAddress?.zipCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center">
                <FiPackage className="w-5 h-5 mr-2 text-green-600" />
                Order Items
              </h3>

              <div className="space-y-4">
                {data.cart?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow duration-200"
                  >
                    <img
                      src={`${
                        process.env.REACT_APP_BACKEND_URL ||
                        "http://localhost:8000"
                      }${item.images?.[0]}`}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg border border-gray-200 shadow-sm"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.svg";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate mb-1">
                        {item.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600">
                          Qty: <span className="font-medium">{item.qty}</span>
                        </p>
                        <p className="text-sm font-bold text-blue-600">
                          ₹{item.discountPrice}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
