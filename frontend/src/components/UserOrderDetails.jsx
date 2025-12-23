import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { backend_url, server } from "../server";
import { getProductImageUrl } from "../utils/mediaUtils";
import { getOrderNumber } from "../utils/orderUtils";
import { RxCross1 } from "react-icons/rx";
import { getAllOrdersOfUser } from "../redux/actions/order";
import { useDispatch, useSelector } from "react-redux";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import {
  HiOutlineShoppingBag,
  HiOutlineLocationMarker,
  HiOutlineCreditCard,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineClock,
} from "react-icons/hi";
import {
  FiPackage,
  FiArrowLeft,
  FiMessageCircle,
  FiDownload,
  FiTruck,
} from "react-icons/fi";
import { BsShieldCheck, BsExclamationTriangle } from "react-icons/bs";
import InvoiceDownloadButton from "./InvoiceDownloadButton";

const UserOrderDetails = () => {
  const { orders } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState(1);
  const [adminOrder, setAdminOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { id } = useParams();

  // Check if this is being used in admin context
  const isAdminView = location.pathname.includes("/admin/");

  useEffect(() => {
    if (isAdminView) {
      // If admin view, fetch order directly by ID
      fetchAdminOrder();
    } else if (user?._id) {
      // If user view, fetch user's orders
      dispatch(getAllOrdersOfUser(user._id));
    }
  }, [dispatch, user, id, isAdminView]);

  const fetchAdminOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${server}/order/admin-get-order/${id}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setAdminOrder(response.data.order);
      }
    } catch (error) {
      console.error("Error fetching admin order:", error);
      toast.error(error.response?.data?.message || "Failed to fetch order");
    } finally {
      setLoading(false);
    }
  };

  // Get the order data based on context
  const data = isAdminView
    ? adminOrder
    : orders && orders.find((item) => item._id === id);

  const reviewHandler = async (type) => {
    try {
      const endpoint =
        type === "product"
          ? "/product/create-new-review"
          : "/event/create-new-review-event";

      const res = await axios.put(
        `${server}${endpoint}`,
        {
          user,
          rating,
          comment,
          productId: selectedItem?._id,
          orderId: id,
        },
        { withCredentials: true }
      );

      toast.success(res.data.message);
      dispatch(getAllOrdersOfUser(user._id));
      setComment("");
      setRating(null);
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const combinedHandler = async () => {
    if (rating > 1) {
      await reviewHandler("product");
      await reviewHandler("event");
    }
  };

  // Refund
  const refundHandler = async () => {
    try {
      const res = await axios.put(
        `${server}/order/order-refund/${id}`,
        {
          status: "Processing refund",
        },
        { withCredentials: true }
      );
      toast.success(res.data.message);
      dispatch(getAllOrdersOfUser(user._id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Refund request failed");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

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
          <button
            onClick={() => navigate(isAdminView ? "/admin-orders" : "/profile")}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg font-medium group"
          >
            <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            {isAdminView ? "Back to Admin Orders" : "Back to Orders"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate(isAdminView ? "/admin-orders" : "/profile")}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors duration-200 group"
          >
            <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">
              {isAdminView ? "Back to Admin Orders" : "Back to Orders"}
            </span>
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <HiOutlineShoppingBag className="text-3xl text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                Order Details
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Track and manage your order information
              </p>
            </div>
          </div>
        </div>

        {/* Order Info Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Order {getOrderNumber(data)}
                </h2>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                  ${
                    data.status === "Delivered"
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : data.status === "Processing"
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      : data.status === "Shipping"
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : data.status === "Processing refund"
                      ? "bg-orange-100 text-orange-800 border border-orange-200"
                      : "bg-gray-100 text-gray-800 border border-gray-200"
                  }`}
                >
                  {data.status === "Delivered" ? (
                    <HiOutlineCheckCircle className="w-3 h-3 mr-1" />
                  ) : data.status === "Processing" ? (
                    <HiOutlineClock className="w-3 h-3 mr-1" />
                  ) : data.status === "Shipping" ? (
                    <FiTruck className="w-3 h-3 mr-1" />
                  ) : data.status === "Processing refund" ? (
                    <BsExclamationTriangle className="w-3 h-3 mr-1" />
                  ) : (
                    <HiOutlineClock className="w-3 h-3 mr-1" />
                  )}
                  {data.status}
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <HiOutlineCalendar className="w-4 h-4 mr-1" />
                  <span>Placed on {formatDate(data.createdAt)}</span>
                </div>
                {data.deliveredAt && (
                  <div className="flex items-center">
                    <HiOutlineCheckCircle className="w-4 h-4 mr-1 text-green-600" />
                    <span>Delivered on {formatDate(data.deliveredAt)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <InvoiceDownloadButton
                order={data}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Order Items */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FiPackage className="w-5 h-5 mr-2 text-blue-600" />
                  Order Items
                </h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {data.cart.length} item{data.cart.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-4">
                {data.cart.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 p-4 sm:p-6 border border-gray-100 rounded-xl hover:shadow-md transition-shadow duration-200 bg-gray-50/50"
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={getProductImageUrl(item.images, 0, backend_url)}
                        alt={item.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-gray-200 shadow-sm"
                        onError={(e) => {
                          e.target.src = "/placeholder-image.svg";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-base sm:text-lg mb-2 line-clamp-2">
                        {item.name}
                      </h4>

                      {/* Selected Attributes */}
                      {item.selectedAttributes &&
                        Object.keys(item.selectedAttributes).length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(item.selectedAttributes).map(
                                ([key, value]) => (
                                  <span
                                    key={key}
                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                                  >
                                    {key}: {value}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Price:</span>
                          <span className="font-medium text-blue-600">
                            ₹
                            {(item.finalPrice || item.discountPrice).toFixed(2)}
                          </span>
                          {item.finalPrice &&
                            item.finalPrice !== item.discountPrice && (
                              <span className="text-sm text-gray-400 line-through">
                                ₹{item.discountPrice.toFixed(2)}
                              </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Qty:</span>
                          <span className="font-medium text-gray-900 bg-white px-2 py-1 rounded-md text-sm border">
                            {item.qty}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="text-lg font-bold text-gray-900">
                          ₹
                          {(
                            (item.finalPrice || item.discountPrice) * item.qty
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-full sm:w-auto">
                      {!item.isReviewed && data.status === "Delivered" && (
                        <button
                          onClick={() => {
                            setOpen(true);
                            setSelectedItem(item);
                          }}
                          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm flex items-center justify-center"
                        >
                          <AiFillStar className="w-4 h-4 mr-1" />
                          Write Review
                        </button>
                      )}
                      {item.isReviewed && (
                        <div className="flex items-center text-green-600 text-sm font-medium">
                          <BsShieldCheck className="w-4 h-4 mr-1" />
                          Reviewed
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-6 mt-8">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Subtotal:</span>
                    <span>
                      ₹
                      {data.cart
                        .reduce((total, item) => {
                          const itemPrice =
                            item.finalPrice || item.discountPrice;
                          return total + itemPrice * item.qty;
                        }, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  {data.shippingPrice > 0 && (
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Shipping:</span>
                      <span>₹{data.shippingPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {data.discountPrice > 0 && (
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Discount:</span>
                      <span className="text-green-600">
                        -₹{data.discountPrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">
                        Total Amount
                      </span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ₹{data.totalPrice?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <HiOutlineLocationMarker className="w-5 h-5 text-blue-600" />
                </div>
                Shipping Address
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="space-y-2 text-gray-700">
                    <p className="font-semibold text-gray-900 text-base">
                      {data.shippingAddress.address1}
                    </p>
                    {data.shippingAddress.address2 && (
                      <p className="text-gray-600">
                        {data.shippingAddress.address2}
                      </p>
                    )}
                    <p className="text-gray-600">
                      {data.shippingAddress.city},{" "}
                      {data.shippingAddress.country}
                    </p>
                    <p className="text-gray-600 font-medium">
                      {data.shippingAddress.zipCode}
                    </p>
                  </div>
                </div>
                {data.user?.phoneNumber && (
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <HiOutlinePhone className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-blue-800 font-medium">
                      {data.user.phoneNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <HiOutlineCreditCard className="w-5 h-5 text-green-600" />
                </div>
                Payment Info
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 font-medium">Status:</span>
                    <div className="flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          data.paymentInfo?.status === "succeeded" ||
                          data.paymentInfo?.status === "Succeeded"
                            ? "bg-green-500"
                            : "bg-orange-500"
                        }`}
                      />
                      <span
                        className={`font-semibold text-sm ${
                          data.paymentInfo?.status === "succeeded" ||
                          data.paymentInfo?.status === "Succeeded"
                            ? "text-green-700"
                            : "text-orange-700"
                        }`}
                      >
                        {data.paymentInfo?.status === "succeeded" ||
                        data.paymentInfo?.status === "Succeeded"
                          ? "Paid"
                          : "Pending"}
                      </span>
                    </div>
                  </div>
                  {data.paymentInfo?.type && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Method:</span>
                      <span className="font-semibold text-gray-900 text-sm capitalize">
                        {data.paymentInfo.type}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 font-medium">
                      Amount Paid:
                    </span>
                    <span className="font-bold text-blue-900 text-lg">
                      ₹{data.totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-5">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to={`/user/track/order/${data._id}`}
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm group"
                >
                  <FiTruck className="mr-2 group-hover:scale-110 transition-transform duration-200" />
                  Track Order
                </Link>

                {!isAdminView && data.status === "Delivered" && (
                  <button
                    onClick={refundHandler}
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-sm group"
                  >
                    <BsExclamationTriangle className="mr-2 group-hover:scale-110 transition-transform duration-200" />
                    Request Refund
                  </button>
                )}

                <Link
                  to="/inbox"
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm group"
                >
                  <FiMessageCircle className="mr-2 group-hover:scale-110 transition-transform duration-200" />
                  Contact Support
                </Link>

                <div className="pt-2 border-t border-gray-200">
                  <InvoiceDownloadButton
                    order={data}
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-sm group"
                  >
                    <FiDownload className="mr-2 group-hover:scale-110 transition-transform duration-200" />
                    Download Invoice
                  </InvoiceDownloadButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">
                Write a Review
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200 group"
              >
                <RxCross1
                  size={20}
                  className="text-gray-500 group-hover:text-gray-700"
                />
              </button>
            </div>

            <div className="p-6">
              {/* Product Info */}
              <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <img
                  src={getProductImageUrl(selectedItem?.images, 0, backend_url)}
                  alt={selectedItem?.name}
                  className="w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-sm"
                  onError={(e) => {
                    e.target.src = "/placeholder-image.svg";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-2">
                    {selectedItem?.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    ₹{selectedItem?.discountPrice} × {selectedItem?.qty}
                  </p>
                  <p className="text-blue-600 font-semibold text-sm mt-1">
                    Total: ₹
                    {(selectedItem?.discountPrice * selectedItem?.qty).toFixed(
                      2
                    )}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2 justify-center p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  {[1, 2, 3, 4, 5].map((i) =>
                    rating >= i ? (
                      <AiFillStar
                        key={i}
                        className="cursor-pointer text-yellow-400 hover:text-yellow-500 transform hover:scale-110 transition-all duration-200"
                        size={32}
                        onClick={() => setRating(i)}
                      />
                    ) : (
                      <AiOutlineStar
                        key={i}
                        className="cursor-pointer text-gray-300 hover:text-yellow-400 transform hover:scale-110 transition-all duration-200"
                        size={32}
                        onClick={() => setRating(i)}
                      />
                    )
                  )}
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Your Review <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this product... What did you like? How was the quality?"
                  rows={4}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 bg-gray-50 hover:bg-white"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Your review helps other customers make informed decisions.
                </p>
              </div>

              {/* Submit Button */}
              <button
                onClick={rating >= 1 ? combinedHandler : null}
                disabled={rating < 1}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-base shadow-lg disabled:shadow-none transform hover:scale-[1.02] disabled:transform-none"
              >
                {rating < 1 ? "Please select a rating" : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrderDetails;
