import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import Lottie from "react-lottie";
import animationData from "../Assests/animations/107043-success.json";
import {
  BiCheckCircle,
  BiUser,
  BiPhone,
  BiMapPin,
  BiTime,
  BiCreditCard,
  BiPackage,
} from "react-icons/bi";
import { FiDownload, FiEye } from "react-icons/fi";
import { BsArrowRight } from "react-icons/bs";

const OrderSuccessPage = () => {
  return (
    <div>
      <Header />
      <Success />
      <Footer />
    </div>
  );
};

const Success = () => {
  const [orderData, setOrderData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get order data from localStorage
    const latestOrderData = localStorage.getItem("latestOrderData");
    if (latestOrderData) {
      try {
        const parsedData = JSON.parse(latestOrderData);
        setOrderData(parsedData);
        // Clear the data after setting it
        localStorage.removeItem("latestOrderData");
      } catch (error) {
        console.error("Error parsing order data:", error);
      }
    }
  }, []);

  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrderNumber = (order) => {
    return (
      order.orderNumber || `#${order._id.toString().slice(-8).toUpperCase()}`
    );
  };

  // If no order data, show basic success message
  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="mb-6">
            <Lottie options={defaultOptions} width={200} height={200} />
          </div>

          {/* Animated Order Success */}
          <div className="mb-6">
            <div
              className="animate-bounce"
              style={{
                animationDuration: "1.5s",
                animationIterationCount: "3",
              }}
            >
              <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-4 rounded-xl shadow-lg mb-4">
                <p className="text-sm font-medium opacity-90">Status</p>
                <p className="text-3xl font-bold tracking-wider">SUCCESS ✓</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Order Placed! 🎉
            </h2>
          </div>

          <p className="text-gray-600 mb-6">
            Your order has been placed successfully.
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View My Orders <BsArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Animated Order ID Hero Section */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            {/* Success Animation */}
            <div className="mb-6">
              <Lottie options={defaultOptions} width={200} height={200} />
            </div>

            {/* Animated Order IDs - Main Focus */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                🎉 Order Confirmed!
              </h1>
              <div className="space-y-3">
                {orderData.orders && orderData.orders.length > 0 ? (
                  orderData.orders.map((order, index) => (
                    <div
                      key={order._id}
                      className="animate-bounce delay-150"
                      style={{
                        animationDelay: `${index * 200}ms`,
                        animationDuration: "1.5s",
                        animationIterationCount: "3",
                      }}
                    >
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl shadow-lg">
                        <p className="text-sm font-medium opacity-90">
                          Order ID
                        </p>
                        <p className="text-3xl font-bold tracking-wider">
                          {getOrderNumber(order)}
                        </p>
                        {order.shopName && (
                          <p className="text-sm opacity-80 mt-1">
                            from {order.shopName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="animate-pulse">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl shadow-lg">
                      <p className="text-sm font-medium opacity-90">Order ID</p>
                      <p className="text-3xl font-bold tracking-wider">
                        #SUCCESS
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Success Message */}
            <div className="flex items-center justify-center mb-4">
              <BiCheckCircle className="text-green-500 text-3xl mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">
                Your order is confirmed!
              </h2>
            </div>

            <p className="text-gray-600 mb-4">
              Thank you for your purchase! Your order is being processed.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                📧 Confirmation sent to {orderData.user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Order Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <BiPackage className="mr-3 text-blue-600" />
              Order Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatPrice(orderData.totalAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Method:</span>
                <div className="flex items-center">
                  <BiCreditCard className="mr-2 text-blue-600" />
                  <span className="font-medium text-gray-800">
                    {orderData.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order Date:</span>
                <div className="flex items-center">
                  <BiTime className="mr-2 text-blue-600" />
                  <span className="font-medium text-gray-800">
                    {formatDate(orderData.timestamp)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Number of Orders:</span>
                <span className="font-medium text-gray-800">
                  {orderData.orders?.length || 0} order(s)
                </span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <BiUser className="mr-3 text-blue-600" />
              Customer Details
            </h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <BiUser className="mr-3 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-800">
                    {orderData.user?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {orderData.user?.email}
                  </p>
                </div>
              </div>

              {orderData.user?.phoneNumber && (
                <div className="flex items-center">
                  <BiPhone className="mr-3 text-gray-400" />
                  <span className="text-gray-800">
                    {orderData.user.phoneNumber}
                  </span>
                </div>
              )}

              {orderData.orders?.[0]?.shippingAddress && (
                <div className="flex items-start">
                  <BiMapPin className="mr-3 text-gray-400 mt-1" />
                  <div className="text-gray-800">
                    <p className="font-medium">Delivery Address:</p>
                    <p className="text-sm">
                      {orderData.orders[0].shippingAddress.address1}
                      {orderData.orders[0].shippingAddress.address2 &&
                        `, ${orderData.orders[0].shippingAddress.address2}`}
                    </p>
                    <p className="text-sm">
                      {orderData.orders[0].shippingAddress.city},{" "}
                      {orderData.orders[0].shippingAddress.country} -{" "}
                      {orderData.orders[0].shippingAddress.zipCode}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Individual Orders */}
        {orderData.orders && orderData.orders.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Order Details
            </h2>

            <div className="space-y-6">
              {orderData.orders.map((order, index) => (
                <div
                  key={order._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {order.shopName || "N/A"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Items: {order.cart?.length || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-800">
                        {formatPrice(order.totalPrice)}
                      </p>
                      <p className="text-sm text-green-600 font-medium">
                        {order.status || "Processing"}
                      </p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {order.cart?.slice(0, 3).map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center bg-gray-50 rounded-lg p-3"
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded-lg mr-3 flex items-center justify-center">
                          <BiPackage className="text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            Qty: {item.qty} × {formatPrice(item.discountPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.cart?.length > 3 && (
                      <div className="flex items-center justify-center bg-gray-50 rounded-lg p-3">
                        <span className="text-sm text-gray-600">
                          +{order.cart.length - 3} more items
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/profile"
              className="flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <FiEye className="mr-2" />
              Track Orders
            </Link>

            <Link
              to="/"
              className="flex items-center justify-center bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Continue Shopping
              <BsArrowRight className="ml-2" />
            </Link>
          </div>

          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              🎉 Thank you for choosing us! We'll send you updates about your
              order via email and SMS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
