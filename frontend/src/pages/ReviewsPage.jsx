import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import {
  HiOutlineStar,
  HiStar,
  HiOutlineFilter,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineEye,
} from "react-icons/hi";
import {
  AiOutlineUser,
  AiOutlineCalendar,
  AiOutlineShop,
  AiOutlineDown,
  AiOutlineUp,
} from "react-icons/ai";
import { BiSort } from "react-icons/bi";
import { BsFilter } from "react-icons/bs";
import axios from "axios";
import { server } from "../server";
import { toast } from "react-toastify";

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({});

  // Filters
  const [selectedRating, setSelectedRating] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState(new Set());

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [currentPage, selectedRating, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        sortBy: sortBy,
      });

      if (selectedRating) {
        params.append("rating", selectedRating);
      }

      const response = await axios.get(
        `${server}/review/get-all-reviews?${params}`
      );

      if (response.data.success) {
        setReviews(response.data.reviews);
        setTotalPages(response.data.totalPages);
        setTotalReviews(response.data.totalReviews);
        setAverageRating(response.data.averageRating);
        setRatingDistribution(response.data.ratingDistribution);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRatingFilter = (rating) => {
    setSelectedRating(selectedRating === rating ? null : rating);
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const toggleReviewExpansion = (reviewId) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const renderStars = (rating, size = "w-4 h-4") => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) =>
          star <= rating ? (
            <HiStar key={star} className={`${size} text-yellow-400`} />
          ) : (
            <HiOutlineStar key={star} className={`${size} text-gray-300`} />
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

  const truncateText = (text, maxLength = 150) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "highest", label: "Highest Rating" },
    { value: "lowest", label: "Lowest Rating" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-teal-600 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Customer Reviews
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Discover what our customers are saying about their shopping
            experience with Wanttar
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-white mb-2">
                {totalReviews.toLocaleString()}
              </div>
              <div className="text-blue-100">Total Reviews</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-center mb-2">
                <span className="text-3xl font-bold text-white mr-2">
                  {averageRating}
                </span>
                <HiStar className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="text-blue-100">Average Rating</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-white mb-2">
                {Object.keys(ratingDistribution).length}
              </div>
              <div className="text-blue-100">Products Reviewed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters and Sort */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Rating Filters */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BsFilter className="w-5 h-5 mr-2" />
                Filter by Rating
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleRatingFilter(null)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    selectedRating === null
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Reviews
                </button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingFilter(rating)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                      selectedRating === rating
                        ? "bg-yellow-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span>{rating}</span>
                    <HiStar className="w-4 h-4" />
                    <span className="text-sm">
                      ({ratingDistribution[rating] || 0})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="lg:w-64">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BiSort className="w-5 h-5 mr-2" />
                Sort By
              </h3>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-700">
                Loading Reviews...
              </h3>
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <HiOutlineStar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              No Reviews Found
            </h3>
            <p className="text-gray-600 mb-8">
              {selectedRating
                ? `No reviews found with ${selectedRating} star rating.`
                : "Be the first to share your experience!"}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors duration-300"
            >
              <HiOutlineShoppingBag className="w-5 h-5 mr-2" />
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Product Info Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start space-x-4">
                    {review.product.image && (
                      <img
                        src={review.product.image}
                        alt={review.product.name}
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${review.product._id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-300 line-clamp-2"
                      >
                        {review.product.name}
                      </Link>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-sm text-gray-500">
                          {review.product.category}
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          ₹{review.product.price?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div className="p-6">
                  {/* User Info & Rating */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {review.user?.name?.charAt(0)?.toUpperCase() || "A"}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {review.user?.name || "Anonymous"}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <AiOutlineCalendar className="w-4 h-4 mr-1" />
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {renderStars(review.rating)}
                      <div className="text-sm text-gray-600 mt-1">
                        {review.rating}/5 Stars
                      </div>
                    </div>
                  </div>

                  {/* Review Comment */}
                  {review.comment && (
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed">
                        {expandedReviews.has(review._id)
                          ? review.comment
                          : truncateText(review.comment, 120)}
                      </p>

                      {review.comment.length > 120 && (
                        <button
                          onClick={() => toggleReviewExpansion(review._id)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 flex items-center transition-colors duration-300"
                        >
                          {expandedReviews.has(review._id) ? (
                            <>
                              <AiOutlineUp className="w-4 h-4 mr-1" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <AiOutlineDown className="w-4 h-4 mr-1" />
                              Read More
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Shop Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <AiOutlineShop className="w-4 h-4" />
                      <span>
                        Sold by {review.product.shop?.name || "Unknown Shop"}
                      </span>
                    </div>

                    <Link
                      to={`/product/${review.product._id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center transition-colors duration-300"
                    >
                      <HiOutlineEye className="w-4 h-4 mr-1" />
                      View Product
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-3 rounded-xl border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            >
              <HiOutlineChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + Math.max(1, currentPage - 2);
              if (page > totalPages) return null;

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    currentPage === page
                      ? "bg-blue-600 text-white shadow-lg"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-3 rounded-xl border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            >
              <HiOutlineChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mt-16 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Share Your Experience
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Help other customers make informed decisions by sharing your honest
            review. Your feedback matters and helps us improve our service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Shop Products
            </Link>
            <Link
              to="/profile"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-purple-600 transition-all duration-300"
            >
              My Orders
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ReviewsPage;
