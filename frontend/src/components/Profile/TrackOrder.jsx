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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiPackage className="mx-auto text-6xl text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-500">
            The order you're looking for doesn't exist.
          </p>
          <Link
            to="/profile"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/profile"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to Orders
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
          <p className="text-gray-600 mt-2">
            Order ID: #{data._id.slice(-8).toUpperCase()}
          </p>

          {/* Progress Bar */}
          {!isRefundProcess && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Order Progress</span>
                <span>
                  {Math.round(
                    ((currentStatusIndex + 1) / currentStatuses.length) * 100
                  )}
                  % Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${
                      ((currentStatusIndex + 1) / currentStatuses.length) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Status
              </h2>

              {/* Estimated Delivery */}
              {!isRefundProcess &&
                data.status !== "Delivered" &&
                estimatedDelivery && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <FiClock className="text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-blue-900">
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
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <FiClock className="text-orange-600 mr-3" />
                    <div>
                      <p className="font-medium text-orange-900">
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
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Details
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(new Date(data.createdAt))}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-gray-900">
                    ₹{data.totalPrice}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <p className="font-medium text-green-600">
                    {data.paymentInfo?.status || "Paid"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Items</p>
                  <p className="font-medium text-gray-900">
                    {data.cart?.length || 0} item
                    {data.cart?.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {data.trackingNumber && (
                  <div>
                    <p className="text-sm text-gray-500">Tracking Number</p>
                    <p className="font-medium text-blue-600 text-sm break-all">
                      {data.trackingNumber}
                    </p>
                  </div>
                )}

                {data.courierPartner && (
                  <div>
                    <p className="text-sm text-gray-500">Courier Partner</p>
                    <p className="font-medium text-gray-900">
                      {data.courierPartner}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MdHome className="mr-2" />
                Shipping Address
              </h3>

              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">
                  {data.shippingAddress?.address1}
                </p>
                {data.shippingAddress?.address2 && (
                  <p>{data.shippingAddress.address2}</p>
                )}
                <p>
                  {data.shippingAddress?.city}, {data.shippingAddress?.country}
                </p>
                <p>{data.shippingAddress?.zipCode}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Items
              </h3>

              <div className="space-y-4">
                {data.cart?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <img
                      src={item.images?.[0]?.url || "/placeholder-image.jpg"}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.qty} × ₹{item.discountPrice}
                      </p>
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
