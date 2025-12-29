import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  HiStar,
  HiOutlineStar,
  HiOutlineReply,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineShoppingBag,
} from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsFilter } from "react-icons/bs";

const ReviewManagement = () => {
  const { seller } = useSelector((state) => state.seller);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    ratingDistribution: {},
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRating, setFilterRating] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingReply, setEditingReply] = useState(null);

  useEffect(() => {
    if (seller?._id) {
      fetchReviews();
      fetchStats();
    }
  }, [seller, filterStatus, filterRating]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }
      if (filterRating) {
        params.append("rating", filterRating);
      }

      const { data } = await axios.get(
        `${server}/review/seller-reviews?${params}`,
        { withCredentials: true }
      );

      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${server}/review/seller-review-stats`, {
        withCredentials: true,
      });

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await axios.post(
        `${server}/review/reply/${reviewId}`,
        { replyText },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Reply posted successfully!");
        setReplyingTo(null);
        setEditingReply(null);
        setReplyText("");
        fetchReviews();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReply = (review) => {
    setEditingReply(review._id);
    setReplyText(review.vendorReply.text);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setEditingReply(null);
    setReplyText("");
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) =>
          star <= rating ? (
            <HiStar key={star} className="w-5 h-5 text-yellow-400" />
          ) : (
            <HiOutlineStar key={star} className="w-5 h-5 text-gray-300" />
          )
        )}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (review) => {
    if (!review.isApprovedByAdmin) {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center">
          <HiOutlineClock className="w-4 h-4 mr-1" />
          Pending Approval
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center">
        <HiOutlineCheckCircle className="w-4 h-4 mr-1" />
        Approved
      </span>
    );
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen pt-20 px-4 py-8 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Review Management
          </h1>
          <p className="text-gray-600">
            Monitor and respond to customer reviews for your products
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Total Reviews
              </h3>
              <HiStar className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalReviews}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Average Rating
              </h3>
              <HiStar className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-3xl font-bold text-gray-900">
                {stats.averageRating.toFixed(1)}
              </p>
              <span className="text-sm text-gray-500">/ 5.0</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Pending Approval
              </h3>
              <HiOutlineClock className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.pendingReviews}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Approved</h3>
              <HiOutlineCheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.approvedReviews}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Status Filter */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BsFilter className="w-5 h-5 mr-2" />
                Filter by Status
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    filterStatus === "all"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Reviews
                </button>
                <button
                  onClick={() => setFilterStatus("approved")}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    filterStatus === "approved"
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Approved
                </button>
                <button
                  onClick={() => setFilterStatus("pending")}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    filterStatus === "pending"
                      ? "bg-yellow-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Pending
                </button>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Filter by Rating
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setFilterRating(null)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    filterRating === null
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Ratings
                </button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(rating)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-1 ${
                      filterRating === rating
                        ? "bg-yellow-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span>{rating}</span>
                    <HiStar className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <AiOutlineLoading3Quarters className="animate-spin text-4xl text-blue-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <HiOutlineStar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No Reviews Found
            </h3>
            <p className="text-gray-600">
              {filterStatus === "pending"
                ? "No pending reviews at the moment"
                : "You haven't received any reviews yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Product Info */}
                  <div className="lg:w-1/3">
                    <div className="flex items-start space-x-4">
                      {review.product?.images?.[0]?.url && (
                        <img
                          src={review.product.images[0].url}
                          alt={review.product.name}
                          className="w-20 h-20 object-cover rounded-xl"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {review.product?.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {review.product?.category}
                        </p>
                        {review.isVerifiedPurchase && (
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium mt-2">
                            <HiOutlineCheckCircle className="w-3 h-3 mr-1" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="lg:w-2/3">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <HiOutlineUser className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {review.user?.name || "Anonymous"}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <HiOutlineCalendar className="w-4 h-4 mr-1" />
                            {formatDate(review.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {renderStars(review.rating)}
                        {getStatusBadge(review)}
                      </div>
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <div className="mb-4">
                        <p className="text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    )}

                    {/* Vendor Reply */}
                    {review.vendorReply && editingReply !== review._id ? (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <HiOutlineReply className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-blue-900">
                                Your Reply
                              </span>
                              <div className="flex items-center space-x-3">
                                <span className="text-xs text-blue-600">
                                  {formatDate(review.vendorReply.createdAt)}
                                </span>
                                <button
                                  onClick={() => handleEditReply(review)}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  Edit
                                </button>
                              </div>
                            </div>
                            <p className="text-gray-700">
                              {review.vendorReply.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {replyingTo === review._id ||
                        editingReply === review._id ? (
                          <div className="mt-4">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write your reply..."
                              rows="4"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            />
                            <div className="flex items-center space-x-3 mt-3">
                              <button
                                onClick={() => handleReply(review._id)}
                                disabled={submitting}
                                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                              >
                                {submitting ? (
                                  <AiOutlineLoading3Quarters className="animate-spin" />
                                ) : editingReply === review._id ? (
                                  "Update Reply"
                                ) : (
                                  "Post Reply"
                                )}
                              </button>
                              <button
                                onClick={handleCancelReply}
                                disabled={submitting}
                                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors duration-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          !review.vendorReply && (
                            <button
                              onClick={() => setReplyingTo(review._id)}
                              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-xl hover:bg-blue-200 transition-colors duration-300"
                            >
                              <HiOutlineReply className="w-5 h-5" />
                              <span>Reply to Customer</span>
                            </button>
                          )
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewManagement;
