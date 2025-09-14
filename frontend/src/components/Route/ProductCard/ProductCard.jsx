import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { AiFillHeart, AiOutlineEye, AiOutlineHeart } from "react-icons/ai";
import { RiShoppingCartFill } from "react-icons/ri";
import { backend_url } from "../../../server";
import ProductDetailsCard from "../ProductDetailsCard/ProductDetailsCard.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../../redux/actions/wishlist";
import { addTocart } from "../../../redux/actions/cart";
import { toast } from "react-toastify";
import Ratings from "../../Products/Ratings";

const ProductCard = ({ data, isEvent, isCompact = false }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user);
  const [click, setClick] = useState(false);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (wishlist && wishlist.find((i) => i._id === data._id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [wishlist, data._id]);

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
    const isItemExists = cart && cart.find((i) => i._id === id);

    if (isItemExists) {
      toast.error("item already in cart!");
    } else {
      if (data.stock < 1) {
        toast.error("Product stock limited!");
      } else {
        const cartData = { ...data, qty: 1 };
        dispatch(addTocart(cartData));
        toast.success("Item added to cart Successfully!");
      }
    }
  };

  // Buy Now - direct checkout
  const buyNowHandler = () => {
    if (!user) {
      toast.error("Please login to continue!");
      return;
    }

    if (data.stock < 1) {
      toast.error("Product stock limited!");
      return;
    }

    // Create order data with single item
    const cartItem = { ...data, qty: 1 };
    const subTotalPrice = data.discountPrice;
    const shipping = subTotalPrice * 0.1; // 10% shipping

    const orderData = {
      cart: [cartItem],
      subTotalPrice: subTotalPrice,
      shipping: shipping,
      discountPrice: 0,
      totalPrice: subTotalPrice + shipping,
      user: user,
    };

    // Store in localStorage and navigate to checkout
    localStorage.setItem("latestOrder", JSON.stringify(orderData));
    navigate("/checkout");
  };

  return (
    <>
      <div
        className={`group bg-white ${
          isCompact
            ? "rounded-lg shadow-sm hover:shadow-md"
            : "rounded-2xl shadow-sm hover:shadow-xl"
        } transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 relative ${
          isCompact
            ? "hover:-translate-y-0.5"
            : "transform hover:-translate-y-1"
        } h-full flex flex-col min-h-[240px] sm:min-h-[280px] md:min-h-[320px]`}
      >
        {/* Product Image Container */}
        <div className="relative overflow-hidden bg-gray-50">
          <Link
            to={`${
              isEvent === true
                ? `/product/${data._id}?isEvent=true`
                : `/product/${data._id}`
            }`}
          >
            <div
              className={`${
                isCompact
                  ? "aspect-square"
                  : "aspect-[6/5] sm:aspect-[5/4] md:aspect-[4/3]"
              } w-full`}
            >
              <img
                src={`${backend_url}${data.images && data.images[0]}`}
                alt={data.name}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isCompact ? "group-hover:scale-105" : "group-hover:scale-110"
                }`}
              />
            </div>
          </Link>
          {/* Modern Discount Badge */}
          {data.originalPrice && data.originalPrice > data.discountPrice && (
            <div
              className={`absolute ${
                isCompact
                  ? "top-2 left-2 px-2 py-1 text-xs"
                  : "top-3 left-3 px-3 py-1.5 text-xs"
              } bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-bold shadow-lg`}
            >
              {Math.round(
                ((data.originalPrice - data.discountPrice) /
                  data.originalPrice) *
                  100
              )}
              % OFF
            </div>
          )}
          {/* Floating Action Buttons */}
          {!isCompact && (
            <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <button
                onClick={() =>
                  click
                    ? removeFromWishlistHandler(data)
                    : addToWishlistHandler(data)
                }
                className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border border-white/20"
                title={click ? "Remove from wishlist" : "Add to wishlist"}
              >
                {click ? (
                  <AiFillHeart size={18} className="text-red-500" />
                ) : (
                  <AiOutlineHeart
                    size={18}
                    className="text-gray-600 hover:text-red-500"
                  />
                )}
              </button>

              <button
                onClick={() => setOpen(!open)}
                className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border border-white/20"
                title="Quick view"
              >
                <AiOutlineEye
                  size={18}
                  className="text-gray-600 hover:text-blue-500"
                />
              </button>
            </div>
          )}{" "}
          {/* Stock Status Overlay */}
          {data.stock < 1 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Information */}
        <div
          className={`${
            isCompact
              ? "p-1 space-y-0.5"
              : "p-1.5 sm:p-2 md:p-2.5 space-y-0.5 sm:space-y-1"
          } flex-grow flex flex-col`}
        >
          {/* Shop Name & Category */}
          {!isCompact && (
            <div className="hidden sm:flex items-center justify-between">
              <Link
                to={`${
                  isEvent === true
                    ? `/product/${data._id}?isEvent=true`
                    : `/product/${data._id}`
                }`}
                className="inline-block"
              >
                <span className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 bg-blue-50 px-2 py-1 rounded-full">
                  {data?.shop?.name || "Shop"}
                </span>
              </Link>

              {data?.sold_out > 0 && (
                <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
                  {data.sold_out} sold
                </span>
              )}
            </div>
          )}

          {/* Product Name */}
          <div className="flex items-start justify-between">
            <Link to={`/product/${data._id}`} className="flex-1">
              <h3
                className={`font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-tight ${
                  isCompact
                    ? "text-[10px] min-h-[1.2rem]"
                    : "text-[11px] sm:text-xs min-h-[1.2rem] sm:min-h-[1.5rem]"
                } flex items-start`}
              >
                {isCompact
                  ? data.name.length > 45
                    ? data.name.slice(0, 45) + "..."
                    : data.name
                  : data.name.length > 50
                  ? data.name.slice(0, 50) + "..."
                  : data.name}
              </h3>
            </Link>

            {/* Compact Wishlist Button */}
            {isCompact && (
              <button
                onClick={() =>
                  click
                    ? removeFromWishlistHandler(data)
                    : addToWishlistHandler(data)
                }
                className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                title={click ? "Remove from wishlist" : "Add to wishlist"}
              >
                {click ? (
                  <AiFillHeart size={14} className="text-red-500" />
                ) : (
                  <AiOutlineHeart
                    size={14}
                    className="text-gray-400 hover:text-red-500"
                  />
                )}
              </button>
            )}
          </div>

          {/* Rating & Reviews */}
          {!isCompact && (
            <div className="hidden sm:flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Ratings rating={data?.ratings} />
              </div>
              <span className="text-sm text-gray-500 font-medium">
                {data?.ratings?.toFixed(1) || "0.0"}
              </span>
              <span className="text-xs text-gray-400">
                ({data?.numOfReviews || 0} reviews)
              </span>
            </div>
          )}

          {/* Price Section */}
          <div className={`${isCompact ? "space-y-0" : "space-y-0"} mt-0`}>
            <div className="flex items-baseline space-x-1">
              <span
                className={`${
                  isCompact ? "text-xs" : "text-sm sm:text-base"
                } font-bold text-gray-900`}
              >
                ₹
                {data.originalPrice === 0
                  ? data.originalPrice
                  : data.discountPrice}
              </span>
              {data.originalPrice &&
                data.originalPrice > data.discountPrice && (
                  <span
                    className={`${
                      isCompact ? "text-[10px]" : "text-xs sm:text-sm"
                    } text-gray-400 line-through font-medium`}
                  >
                    ₹{data.originalPrice}
                  </span>
                )}
            </div>

            {!isCompact &&
              data.originalPrice &&
              data.originalPrice > data.discountPrice && (
                <div className="text-[10px] sm:text-xs text-green-600 font-semibold">
                  You save ₹{data.originalPrice - data.discountPrice}
                </div>
              )}
          </div>

          {/* Action Buttons */}
          {!isCompact && (
            <div className="pt-0.5 space-y-0.5 mt-auto">
              {/* Buy Now Button */}
              <button
                onClick={buyNowHandler}
                disabled={data.stock < 1}
                className={`w-full py-1 sm:py-1.5 rounded-md font-medium text-[10px] sm:text-xs transition-all duration-200 ${
                  data.stock < 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-sm hover:shadow-md transform hover:scale-[1.01] active:scale-[0.99]"
                }`}
              >
                {data.stock < 1 ? "Out of Stock" : "🚀 Buy Now"}
              </button>

              {/* Add to Cart Button */}
              <button
                onClick={() => addToCartHandler(data._id)}
                disabled={data.stock < 1}
                className={`w-full py-1 sm:py-1.5 rounded-md font-medium text-[10px] sm:text-xs transition-all duration-200 flex items-center justify-center gap-0.5 ${
                  data.stock < 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-sm hover:shadow-md transform hover:scale-[1.01] active:scale-[0.99]"
                }`}
              >
                <RiShoppingCartFill className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {data.stock < 1 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          )}
        </div>

        {/* Product Details Modal */}
        {open &&
          createPortal(
            <ProductDetailsCard setOpen={setOpen} data={data} />,
            document.body
          )}
      </div>
    </>
  );
};

export default ProductCard;
