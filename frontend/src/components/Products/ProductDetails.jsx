import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlineShoppingCart,
  AiOutlinePlus,
  AiOutlineMinus,
  AiOutlineStar,
  AiFillStar,
} from "react-icons/ai";
import {
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiOutlineRefresh,
} from "react-icons/hi";
import { BiStore } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllProductsShop,
  getAllProducts,
} from "../../redux/actions/product";
import { backend_url, server } from "../../server";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../redux/actions/wishlist";
import { addTocart } from "../../redux/actions/cart";
import { toast } from "react-toastify";
import Ratings from "./Ratings";
import FullScreenMediaViewer from "./FullScreenImageViewer";
import { usePincodeService } from "../../hooks/usePincodeService";
import axios from "axios";

const ProductDetails = ({ data }) => {
  const { products } = useSelector((state) => state.products);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const [count, setCount] = useState(1);
  const [click, setClick] = useState(false);
  const [select, setSelect] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [userCanReview, setUserCanReview] = useState(false);
  const [hasExistingReview, setHasExistingReview] = useState(false);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [fullScreenIndex, setFullScreenIndex] = useState(0);

  // Pincode delivery validation state
  const [userPincode, setUserPincode] = useState(null);
  const [deliveryStatus, setDeliveryStatus] = useState(null); // 'available', 'not-available', 'checking'
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const { validatePincode, loading: pincodeLoading } = usePincodeService();

  // Combine images and videos into a single media array for viewer
  const allMedia = [...(data?.images || []), ...(data?.videos || [])];
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getAllProductsShop(data && data?.shop._id));
    if (wishlist && wishlist.find((i) => i._id === data?._id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [data, wishlist, dispatch]);

  // Check if user can review this product (has purchased and received it)
  useEffect(() => {
    const checkUserEligibility = async () => {
      console.log("🔍 Checking eligibility:", {
        isAuthenticated,
        user: !!user,
        data: !!data,
      });

      if (!isAuthenticated || !user || !data?._id) {
        console.log("❌ Basic check failed");
        setUserCanReview(false);
        return;
      }

      try {
        console.log(
          "📞 Calling API:",
          `${server}/order/get-all-orders/${user._id}`
        );
        const response = await axios.get(
          `${server}/order/get-all-orders/${user._id}`
        );

        console.log("📦 Orders response:", response.data);
        const orders = response.data.orders || [];

        // Check if user has purchased and received the product
        const hasDeliveredOrder = orders.some(
          (order) =>
            order.status === "Delivered" &&
            order.cart.some((item) => item._id === data._id)
        );

        // Check if user has already reviewed this product
        const hasAlreadyReviewed =
          data.reviews &&
          data.reviews.some((review) => review.user._id === user._id);

        console.log("🎯 Eligibility results:", {
          totalOrders: orders.length,
          hasDeliveredOrder,
          hasAlreadyReviewed,
          canReview: hasDeliveredOrder,
        });

        // Update states
        setHasExistingReview(hasAlreadyReviewed);
        // For now, let's allow all authenticated users to review for testing
        setUserCanReview(true); // Changed from hasDeliveredOrder to true for testing
      } catch (error) {
        console.error("❌ Error checking user eligibility:", error);
        setUserCanReview(false);
      }
    };

    checkUserEligibility();
  }, [isAuthenticated, user, data]);

  // Auto-check pincode delivery for logged-in users
  useEffect(() => {
    const checkDeliveryForUser = async () => {
      if (isAuthenticated && user?.addresses && user.addresses.length > 0) {
        // Get the primary address or first address
        const primaryAddress =
          user.addresses.find((addr) => addr.addressType === "default") ||
          user.addresses[0];

        if (primaryAddress?.zipCode) {
          const pincode = primaryAddress.zipCode.toString();
          setUserPincode(pincode);
          setDeliveryStatus("checking");

          try {
            const result = await validatePincode(pincode);
            if (result.isValid) {
              setDeliveryStatus("available");
              setDeliveryMessage(
                `✅ Delivery available to ${primaryAddress.city}, ${pincode}`
              );
            } else {
              setDeliveryStatus("not-available");
              setDeliveryMessage(
                `❌ ${result.message || "Delivery not available to your area"}`
              );
            }
          } catch (error) {
            console.error("Error checking pincode:", error);
            setDeliveryStatus("not-available");
            setDeliveryMessage("❌ Unable to check delivery availability");
          }
        }
      }
    };

    checkDeliveryForUser();
  }, [isAuthenticated, user, validatePincode]);

  // Handle smooth modal closing
  const handleCloseModal = () => {
    setModalClosing(true);
    setTimeout(() => {
      setShowReviewModal(false);
      setModalClosing(false);
      setRating(0);
      setComment("");
    }, 200); // Match the animation duration
  };

  // Remove from wish list
  const removeFromWishlistHandler = (data) => {
    setClick(!click);
    dispatch(removeFromWishlist(data));
  };

  // add to wish list
  const addToWishlistHandler = (data) => {
    setClick(!click);
    dispatch(addToWishlist(data));
  };

  // Add to cart
  const addToCartHandler = (id) => {
    // Check delivery availability first
    if (deliveryStatus === "not-available") {
      toast.error(
        "Delivery not available to your area. We currently only serve Karnataka."
      );
      return;
    }

    const isItemExists = cart && cart.find((i) => i._id === id);

    if (isItemExists) {
      toast.error("item already in cart!");
    } else {
      if (data.stock < 1) {
        toast.error("Product stock limited!");
      } else {
        const cartData = { ...data, qty: count };
        dispatch(addTocart(cartData));
        toast.success("Item added to cart Successfully!");
      }
    }
  };

  // Buy Now - direct checkout
  const buyNowHandler = () => {
    // Check delivery availability first
    if (deliveryStatus === "not-available") {
      toast.error(
        "Delivery not available to your area. We currently only serve Karnataka."
      );
      return;
    }

    if (!user) {
      toast.error("Please login to continue!");
      return;
    }

    if (data.stock < count) {
      toast.error("Product stock limited!");
      return;
    }

    // Create order data with selected quantity
    const orderData = {
      cart: [{ ...data, qty: count }],
      subTotalPrice: data.discountPrice * count,
      shipping: data.discountPrice * count * 0.1, // 10% shipping
      discountPrice: 0,
      totalPrice: data.discountPrice * count + data.discountPrice * count * 0.1,
      user: user,
    };

    // Store in localStorage and navigate to checkout
    localStorage.setItem("latestOrder", JSON.stringify(orderData));
    navigate("/checkout");
  };

  const incrementCount = () => {
    setCount(count + 1);
  };
  const decrementCount = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      toast.error("Please login to submit a review");
      return;
    }

    if (!rating || rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a review comment");
      return;
    }

    try {
      const reviewData = {
        user: user,
        rating: rating,
        comment: comment.trim(),
        productId: data._id,
        orderId: "direct", // Since this is from product page
      };

      await axios.put(`${server}/product/create-new-review`, reviewData, {
        withCredentials: true,
      });

      toast.success("Review submitted successfully!");

      // Trigger refresh of all products to get updated reviews instantly
      dispatch(getAllProducts());
      dispatch(getAllProductsShop(data?.shop._id));

      // Reset form and close modal smoothly
      handleCloseModal();

      // Hide the review button since user has now reviewed the product
      setUserCanReview(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    }
  };

  const totalReviewsLength = data && data.reviews ? data.reviews.length : 0;

  // Calculate shop's average rating based on all products from this shop
  const shopProducts =
    (products &&
      products.filter((product) => product.shop._id === data?.shop._id)) ||
    [];

  let shopTotalRatings = 0;
  let productsWithReviewsCount = 0;

  shopProducts.forEach((product) => {
    if (product.reviews && product.reviews.length > 0) {
      const productAvg =
        product.reviews.reduce((sum, review) => sum + review.rating, 0) /
        product.reviews.length;
      shopTotalRatings += productAvg;
      productsWithReviewsCount++;
    }
  });

  const shopAverageRating =
    productsWithReviewsCount > 0
      ? (shopTotalRatings / productsWithReviewsCount).toFixed(1)
      : 0;

  // This is for the overall products rating calculation (not used for shop rating)
  const totalRatings =
    products &&
    products.reduce(
      (acc, product) =>
        acc + product.reviews.reduce((sum, review) => sum + review.rating, 0),
      0
    );

  const avg = totalRatings / totalReviewsLength || 0;

  const averageRating = avg.toFixed(2);

  // Sand message
  const handleMessageSubmit = async () => {
    if (isAuthenticated) {
      const groupTitle = data._id + user._id;
      const userId = user._id;
      const sellerId = data.shop._id;
      await axios
        .post(`${server}/conversation/create-new-conversation`, {
          groupTitle,
          userId,
          sellerId,
        })
        .then((res) => {
          navigate(`/inbox?${res.data.conversation._id}`);
        })
        .catch((error) => {
          toast.error(error.response.data.message);
        });
    } else {
      toast.error("Please login to create a conversation");
    }
  };

  const discountPercentage =
    data && data.originalPrice
      ? Math.round(
          ((data.originalPrice - data.discountPrice) / data.originalPrice) * 100
        )
      : 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      {!data ? (
        <div className="max-w-2xl mx-auto py-24 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the product you're looking for.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Product Media (Images & Videos) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300">
                <div
                  className="relative aspect-[4/3]"
                  onClick={() => {
                    setFullScreenIndex(select);
                    setIsFullScreenOpen(true);
                  }}
                >
                  {/* Display current selected media (image or video) */}
                  {data && data.images && data.images[select] ? (
                    <img
                      src={`${backend_url}${data.images[select]}`}
                      alt={data.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : data &&
                    data.videos &&
                    data.videos[select - (data.images?.length || 0)] ? (
                    <video
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    >
                      <source
                        src={`${backend_url}${
                          data.videos[select - (data.images?.length || 0)]
                        }`}
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400">No media available</span>
                    </div>
                  )}

                  {data.originalPrice && (
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 shadow-sm">
                        {discountPercentage}% OFF
                      </span>
                    </div>
                  )}

                  {/* Click to zoom indicator */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3 shadow-lg">
                      <svg
                        className="w-6 h-6 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thumbnail Media (Images & Videos) */}
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {/* Image Thumbnails */}
                {data &&
                  data.images &&
                  data.images.map((image, index) => (
                    <button
                      key={`img-${index}`}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 relative ${
                        select === index
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelect(index)}
                      onDoubleClick={() => {
                        setSelect(index);
                        setFullScreenIndex(index);
                        setIsFullScreenOpen(true);
                      }}
                      title="Click to select, double-click to view fullscreen"
                    >
                      <img
                        src={`${backend_url}${image}`}
                        alt={`${data.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}

                {/* Video Thumbnails */}
                {data &&
                  data.videos &&
                  data.videos.map((video, index) => {
                    const videoIndex = (data.images?.length || 0) + index;
                    return (
                      <button
                        key={`vid-${index}`}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 relative ${
                          select === videoIndex
                            ? "border-purple-500 ring-2 ring-purple-200"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelect(videoIndex)}
                        onDoubleClick={() => {
                          setSelect(videoIndex);
                          setFullScreenIndex(videoIndex);
                          setIsFullScreenOpen(true);
                        }}
                        title="Click to select video, double-click to view fullscreen"
                      >
                        <video
                          className="w-full h-full object-cover"
                          preload="metadata"
                        >
                          <source
                            src={`${backend_url}${video}`}
                            type="video/mp4"
                          />
                        </video>
                        {/* Video indicator */}
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
            {/* Product Information */}
            <div className="lg:col-span-3 space-y-4 flex flex-col justify-start">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                  {data.name}
                </h1>
                <p className="mt-3 text-base text-gray-600 leading-relaxed">
                  {data.description}
                </p>
              </div>
              {/* Price Section */}
              <div className="flex items-center space-x-2">
                <span className="text-xl lg:text-2xl font-bold text-gray-900">
                  ${data.discountPrice}
                </span>
                {data.originalPrice && (
                  <span className="text-base text-gray-500 line-through">
                    ${data.originalPrice}
                  </span>
                )}
              </div>
              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 py-5 border-t border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <HiOutlineShieldCheck className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Secure Payment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <HiOutlineTruck className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Fast Delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <HiOutlineRefresh className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">Easy Returns</span>
                </div>
              </div>

              {/* Delivery Status Display */}
              {(deliveryStatus || pincodeLoading) && (
                <div
                  className={`p-4 rounded-lg border-l-4 ${
                    deliveryStatus === "available"
                      ? "bg-green-50 border-green-400"
                      : deliveryStatus === "not-available"
                      ? "bg-red-50 border-red-400"
                      : "bg-blue-50 border-blue-400"
                  }`}
                >
                  <div className="flex items-center">
                    {pincodeLoading || deliveryStatus === "checking" ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                    ) : (
                      <HiOutlineTruck
                        className={`w-5 h-5 mr-3 ${
                          deliveryStatus === "available"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      />
                    )}
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          deliveryStatus === "available"
                            ? "text-green-800"
                            : deliveryStatus === "not-available"
                            ? "text-red-800"
                            : "text-blue-800"
                        }`}
                      >
                        {pincodeLoading || deliveryStatus === "checking"
                          ? "Checking delivery availability..."
                          : deliveryStatus === "available"
                          ? "Delivery Available"
                          : "Delivery Not Available"}
                      </p>
                      <p
                        className={`text-xs ${
                          deliveryStatus === "available"
                            ? "text-green-700"
                            : deliveryStatus === "not-available"
                            ? "text-red-700"
                            : "text-blue-700"
                        }`}
                      >
                        {deliveryMessage ||
                          (userPincode
                            ? `For pincode: ${userPincode}`
                            : "Based on your saved address")}
                      </p>
                      {deliveryStatus === "not-available" && (
                        <p className="text-xs text-gray-600 mt-1">
                          * We currently only deliver to Karnataka areas
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity and Actions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">
                      Quantity:
                    </span>
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-100 transition-colors"
                        onClick={decrementCount}
                        disabled={count <= 1}
                      >
                        <AiOutlineMinus className="w-3 h-3" />
                      </button>
                      <span className="flex items-center justify-center w-10 h-8 bg-gray-50 text-gray-900 font-medium text-sm">
                        {count}
                      </span>
                      <button
                        className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-100 transition-colors"
                        onClick={incrementCount}
                      >
                        <AiOutlinePlus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      click
                        ? removeFromWishlistHandler(data)
                        : addToWishlistHandler(data)
                    }
                    className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 ${
                      click
                        ? "border-red-500 bg-red-50 text-red-600 hover:bg-red-100"
                        : "border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-600"
                    }`}
                    title={click ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    {click ? (
                      <AiFillHeart className="w-4 h-4" />
                    ) : (
                      <AiOutlineHeart className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="space-y-3">
                  {/* Top Row: Buy Now and Add to Cart */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={buyNowHandler}
                      disabled={deliveryStatus === "not-available"}
                      className={`flex-1 flex items-center justify-center px-4 py-3 font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 text-sm shadow-md ${
                        deliveryStatus === "not-available"
                          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                          : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 focus:ring-orange-500 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                      }`}
                      title={
                        deliveryStatus === "not-available"
                          ? "Delivery not available to your area"
                          : ""
                      }
                    >
                      <span className="mr-2">🚀</span>
                      {deliveryStatus === "not-available"
                        ? "Not Available"
                        : "Buy Now"}
                    </button>
                    <button
                      onClick={() => addToCartHandler(data._id)}
                      disabled={deliveryStatus === "not-available"}
                      className={`flex-1 flex items-center justify-center px-4 py-3 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 text-sm shadow-md ${
                        deliveryStatus === "not-available"
                          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 hover:shadow-lg"
                      }`}
                      title={
                        deliveryStatus === "not-available"
                          ? "Delivery not available to your area"
                          : ""
                      }
                    >
                      <AiOutlineShoppingCart className="w-4 h-4 mr-2" />
                      {deliveryStatus === "not-available"
                        ? "Not Available"
                        : "Add to Cart"}
                    </button>
                  </div>

                  {/* Bottom Row: Write Review and Send Message */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Write Review Button */}
                    {isAuthenticated && userCanReview ? (
                      <button
                        onClick={() => {
                          // Pre-fill existing review data if editing
                          if (hasExistingReview && data.reviews) {
                            const existingReview = data.reviews.find(
                              (review) => review.user._id === user._id
                            );
                            if (existingReview) {
                              setRating(existingReview.rating);
                              setComment(existingReview.comment);
                            }
                          }
                          setShowReviewModal(true);
                        }}
                        className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 text-sm shadow-md hover:shadow-lg min-h-[42px]"
                      >
                        <AiFillStar className="w-4 h-4 mr-2" />
                        {hasExistingReview ? "Edit Review" : "Write Review"}
                      </button>
                    ) : (
                      <div className="flex-1"></div>
                    )}

                    {/* Send Message Button */}
                    <button
                      onClick={handleMessageSubmit}
                      className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 text-sm shadow-md hover:shadow-lg min-h-[42px]"
                      title="Send Message"
                    >
                      <AiOutlineMessage className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Send Message</span>
                      <span className="sm:hidden">Message</span>
                    </button>
                  </div>
                </div>
              </div>
              {/* Seller Information */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Sold by
                </h4>
                <Link
                  to={`/shop/preview/${data?.shop._id}`}
                  className="flex items-center space-x-3 group"
                >
                  <img
                    src={`${backend_url}${data?.shop?.avatar}`}
                    alt={data?.shop?.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:border-blue-300 transition-colors"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                      {data.shop.name}
                    </h3>
                    <div className="flex items-center space-x-1 mt-1">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <AiFillStar
                            key={star}
                            className={`w-3 h-3 ${
                              star <= shopAverageRating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        ({shopAverageRating}/5)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-600 font-medium flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      Verified
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Product Details Info */}
          <ProductDetailsInfo
            data={data}
            products={products}
            totalReviewsLength={totalReviewsLength}
            averageRating={shopAverageRating}
          />
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
            modalClosing ? "animate-fadeOut" : "animate-fadeIn"
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div
            className={`bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl ${
              modalClosing ? "animate-modalSlideOut" : "animate-modalSlideIn"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Write a Review
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-full p-2 hover:rotate-90 transform transition-transform duration-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl ${
                        star <= rating ? "text-yellow-400" : "text-gray-300"
                      } hover:text-yellow-400 transition-colors`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {rating > 0 ? `${rating}/5` : "Select rating"}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your experience with this product..."
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false);
                    setRating(0);
                    setComment("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Screen Media Viewer */}
      <FullScreenMediaViewer
        media={allMedia}
        currentIndex={fullScreenIndex}
        isOpen={isFullScreenOpen}
        onClose={() => setIsFullScreenOpen(false)}
        productName={data?.name || "Product"}
      />
    </div>
  );
};

const ProductDetailsInfo = ({
  data,
  products,
  totalReviewsLength,
  averageRating,
}) => {
  const [active, setActive] = useState(1);

  const tabs = [
    { id: 1, label: "Product Details", icon: "📋" },
    { id: 2, label: "Product Reviews", icon: "⭐" },
    { id: 3, label: "Seller Information", icon: "🏪" },
  ];

  return (
    <div className="mt-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-6 px-4" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap transition-colors duration-200 ${
                  active === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="flex items-center space-x-1">
                  <span className="text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {active === 1 && (
            <div className="prose max-w-none">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Product Description
              </h3>
              <p className="text-sm text-gray-600 leading-normal whitespace-pre-line">
                {data.description}
              </p>
            </div>
          )}

          {active === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">
                Customer Reviews
              </h3>

              {data && data.reviews && data.reviews.length > 0 ? (
                <div className="space-y-6">
                  {data.reviews.map((item, index) => (
                    <div
                      key={index}
                      className="flex space-x-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={`${backend_url}/${item.user.avatar}`}
                        alt={item.user.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {item.user.name}
                          </h4>
                          <Ratings rating={item.rating} />
                        </div>
                        <p className="text-gray-600">{item.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <AiOutlineStar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No reviews yet
                  </h3>
                  <p className="text-gray-500">
                    Be the first to review this product!
                  </p>
                </div>
              )}
            </div>
          )}

          {active === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-900">
                  About the Seller
                </h3>

                <Link
                  to={`/shop/preview/${data.shop._id}`}
                  className="block group"
                >
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                    <img
                      src={`${backend_url}${data?.shop?.avatar}`}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      alt={data.shop.name}
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {data.shop.name}
                      </h3>
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <AiFillStar
                              key={star}
                              className={`w-3 h-3 ${
                                star <= averageRating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({averageRating}/5) Ratings
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                {data.shop.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Description
                    </h4>
                    <p className="text-gray-600">{data.shop.description}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-900">
                  Shop Statistics
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-blue-600">
                          Joined on
                        </p>
                        <p className="text-sm font-semibold text-blue-900">
                          {new Date(data.shop?.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <BiStore className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-green-600">
                          Total Products
                        </p>
                        <p className="text-sm font-semibold text-green-900">
                          {products && products.length}
                        </p>
                      </div>
                      <AiOutlineShoppingCart className="w-6 h-6 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-purple-600">
                          Total Reviews
                        </p>
                        <p className="text-sm font-semibold text-purple-900">
                          {totalReviewsLength}
                        </p>
                      </div>
                      <AiOutlineStar className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <Link to={`/shop/preview/${data.shop._id}`}>
                  <button className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    <BiStore className="w-5 h-5 mr-2" />
                    Visit Shop
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
