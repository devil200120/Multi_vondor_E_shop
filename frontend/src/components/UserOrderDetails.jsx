import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { backend_url, server } from "../server";
import { RxCross1 } from "react-icons/rx";
import { getAllOrdersOfUser } from "../redux/actions/order";
import { useDispatch, useSelector } from "react-redux";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import {
  HiOutlineShoppingBag,
  HiOutlineLocationMarker,
  HiOutlineCreditCard,
} from "react-icons/hi";
import { FiPackage, FiArrowLeft, FiMessageCircle } from "react-icons/fi";
import InvoiceDownloadButton from "./InvoiceDownloadButton";

const UserOrderDetails = () => {
  const { orders } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState(1);
  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    if (user?._id) {
      dispatch(getAllOrdersOfUser(user._id));
    }
  }, [dispatch, user]);

  const data = orders && orders.find((item) => item._id === id);

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
          <button
            onClick={() => navigate("/profile")}
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/profile")}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to Orders
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <HiOutlineShoppingBag className="text-2xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order Details
              </h1>
              <p className="text-gray-600">
                View and manage your order information
              </p>
            </div>
          </div>
        </div>

        {/* Order Info Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Order #{data._id.slice(-8).toUpperCase()}
              </h2>
              <p className="text-gray-500">
                Placed on {formatDate(data.createdAt)}
              </p>
            </div>
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <InvoiceDownloadButton
                order={data}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              />
            </div>
            <div className="mt-4 sm:mt-0">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${
                  data.status === "Delivered"
                    ? "bg-green-100 text-green-800"
                    : data.status === "Processing"
                    ? "bg-yellow-100 text-yellow-800"
                    : data.status === "Shipping"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {data.status}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Order Items
              </h3>
              <div className="space-y-4">
                {data.cart.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg"
                  >
                    <img
                      src={`${backend_url}/${item.images[0]}`}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-gray-600 mt-1">
                        ₹{item.discountPrice} × {item.qty}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 mt-2">
                        ₹{(item.discountPrice * item.qty).toFixed(2)}
                      </p>
                    </div>
                    {!item.isReviewed && data.status === "Delivered" && (
                      <button
                        onClick={() => {
                          setOpen(true);
                          setSelectedItem(item);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Write Review
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4 mt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{data.totalPrice}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HiOutlineLocationMarker className="mr-2 text-blue-600" />
                Shipping Address
              </h3>
              <div className="space-y-2 text-gray-600">
                <p className="font-medium text-gray-900">
                  {data.shippingAddress.address1}
                </p>
                {data.shippingAddress.address2 && (
                  <p>{data.shippingAddress.address2}</p>
                )}
                <p>
                  {data.shippingAddress.city}, {data.shippingAddress.country}
                </p>
                <p>{data.shippingAddress.zipCode}</p>
                <p className="border-t pt-2 mt-2">{data.user?.phoneNumber}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HiOutlineCreditCard className="mr-2 text-blue-600" />
                Payment Info
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`font-medium ${
                      data.paymentInfo?.status === "succeeded" ||
                      data.paymentInfo?.status === "Succeeded"
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {data.paymentInfo?.status || "Not Paid"}
                  </span>
                </div>
                {data.paymentInfo?.type && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium text-gray-900">
                      {data.paymentInfo.type}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to={`/track/order/${data._id}`}
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiPackage className="mr-2" />
                  Track Order
                </Link>

                {data.status === "Delivered" && (
                  <button
                    onClick={refundHandler}
                    className="w-full px-4 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Request Refund
                  </button>
                )}

                <Link
                  to="/inbox"
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FiMessageCircle className="mr-2" />
                  Send Message
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Write a Review
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RxCross1 size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Product Info */}
              <div className="flex items-center space-x-3 mb-6">
                <img
                  src={`${backend_url}/${selectedItem?.images[0]}`}
                  alt={selectedItem?.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-medium text-gray-900">
                    {selectedItem?.name}
                  </h3>
                  <p className="text-gray-600">
                    ₹{selectedItem?.discountPrice} × {selectedItem?.qty}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((i) =>
                    rating >= i ? (
                      <AiFillStar
                        key={i}
                        className="cursor-pointer text-yellow-400 hover:text-yellow-500"
                        size={24}
                        onClick={() => setRating(i)}
                      />
                    ) : (
                      <AiOutlineStar
                        key={i}
                        className="cursor-pointer text-gray-300 hover:text-yellow-400"
                        size={24}
                        onClick={() => setRating(i)}
                      />
                    )
                  )}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Comment <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={rating >= 1 ? combinedHandler : null}
                disabled={rating < 1}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrderDetails;
