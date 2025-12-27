import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { HiStar, HiCheck, HiX, HiClock } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const AdminReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      // This assumes we'll create an admin endpoint to fetch all reviews
      const { data } = await axios.get(`${server}/product/admin-all-reviews`, {
        withCredentials: true,
      });
      setReviews(data.reviews);
    } catch (error) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId, productId) => {
    setProcessing((prev) => ({ ...prev, [reviewId]: true }));
    try {
      await axios.put(
        `${server}/product/${productId}/review/${reviewId}/approve`,
        {},
        { withCredentials: true }
      );
      toast.success("Review approved successfully");
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve review");
    } finally {
      setProcessing((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  const handleReject = async (reviewId, productId) => {
    setProcessing((prev) => ({ ...prev, [reviewId]: true }));
    try {
      await axios.delete(`${server}/product/${productId}/review/${reviewId}`, {
        withCredentials: true,
      });
      toast.success("Review rejected and removed");
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject review");
    } finally {
      setProcessing((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === "all") return true;
    if (filter === "pending") return !review.isApprovedByAdmin;
    if (filter === "approved") return review.isApprovedByAdmin;
    if (filter === "verified") return review.isVerifiedPurchase;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <AiOutlineLoading3Quarters className="animate-spin text-4xl text-primary-600" />
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Review Management
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Reviews" value={reviews.length} color="blue" />
        <StatCard
          title="Pending Approval"
          value={reviews.filter((r) => !r.isApprovedByAdmin).length}
          color="yellow"
        />
        <StatCard
          title="Approved"
          value={reviews.filter((r) => r.isApprovedByAdmin).length}
          color="green"
        />
        <StatCard
          title="Verified Purchases"
          value={reviews.filter((r) => r.isVerifiedPurchase).length}
          color="purple"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { value: "pending", label: "Pending" },
          { value: "approved", label: "Approved" },
          { value: "verified", label: "Verified Purchases" },
          { value: "all", label: "All Reviews" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === tab.value
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div
            key={review._id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <HiStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {review.user?.name}
                  </span>
                  {review.isVerifiedPurchase && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <HiCheck className="w-3 h-3 mr-1" />
                      Verified Purchase
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Product: {review.product?.name}</span>
                  <span>
                    Date: {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                  {review.orderId && <span>Order: {review.orderId}</span>}
                </div>

                {/* Vendor Reply */}
                {review.vendorReply && (
                  <div className="mt-3 pl-4 border-l-2 border-primary-200 bg-blue-50 p-3 rounded">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Vendor Reply:
                    </p>
                    <p className="text-sm text-gray-600">
                      {review.vendorReply.reply}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(
                        review.vendorReply.repliedAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                {review.isApprovedByAdmin ? (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-green-100 text-green-800">
                    <HiCheck className="w-4 h-4 mr-1" />
                    Approved
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        handleApprove(review._id, review.product._id)
                      }
                      disabled={processing[review._id]}
                      className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                    >
                      {processing[review._id] ? (
                        <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <HiCheck className="w-4 h-4 mr-1" />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() =>
                        handleReject(review._id, review.product._id)
                      }
                      disabled={processing[review._id]}
                      className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                    >
                      {processing[review._id] ? (
                        <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <HiX className="w-4 h-4 mr-1" />
                          Reject
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No reviews found for this filter
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color }) => {
  const colors = {
    blue: "text-blue-600",
    yellow: "text-yellow-600",
    green: "text-green-600",
    purple: "text-purple-600",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
};

export default AdminReviewManagement;
