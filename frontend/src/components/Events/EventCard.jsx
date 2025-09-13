import React, { useEffect } from "react";
import { backend_url } from "../../server";
import CountDown from "./CountDown";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addTocart } from "../../redux/actions/cart";
import { toast } from "react-toastify";
import {
  HiOutlineShoppingCart,
  HiOutlineEye,
  HiFire,
  HiStar,
  HiTag,
  HiClock,
  HiSparkles,
  HiArrowRight,
} from "react-icons/hi";

const EventCard = ({ active, data, compact = false }) => {
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const addToCartHandler = (data) => {
    const isItemExists = cart && cart.find((i) => i._id === data._id);
    if (isItemExists) {
      toast.error("Item already in cart!");
    } else {
      if (data.stock < 1) {
        toast.error("Product stock limited!");
      } else {
        const cartData = { ...data, qty: 1 };
        dispatch(addTocart(cartData));
        toast.success("Item added to cart successfully!");
      }
    }
  };

  // Buy Now - direct checkout for events
  const buyNowHandler = (data) => {
    if (!user) {
      toast.error("Please login to continue!");
      return;
    }
    
    if (data.stock < 1) {
      toast.error("Product stock limited!");
      return;
    }

    // Create order data with single item
    const orderData = {
      cart: [{ ...data, qty: 1 }],
      subTotalPrice: data.discountPrice,
      shipping: data.discountPrice * 0.1, // 10% shipping
      discountPrice: 0,
      totalPrice: data.discountPrice + (data.discountPrice * 0.1),
      user: user,
    };

    // Store in localStorage and navigate to checkout
    localStorage.setItem("latestOrder", JSON.stringify(orderData));
    navigate("/checkout");
  };

  const discountPercentage = Math.round(
    ((data.originalPrice - data.discountPrice) / data.originalPrice) * 100
  );

  if (compact) {
    return (
      <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 overflow-hidden">
        <div className="relative overflow-hidden">
          <img
            src={`${backend_url}${data.images[0]}`}
            alt={data.name}
            className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Discount Badge */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg">
              <HiFire className="w-3 h-3 mr-1" />
              {discountPercentage}% OFF
            </span>
          </div>

          {/* Sales Badge */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-90 text-gray-700 shadow-md">
              <HiStar className="w-3 h-3 mr-1" />
              {data.sold_out} sold
            </span>
          </div>

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex space-x-2">
              <Link to={`/product/${data._id}?isEvent=true`}>
                <button className="flex items-center space-x-1 bg-white text-gray-900 px-3 py-2 rounded-full font-semibold text-sm shadow-lg hover:bg-gray-100 transition-colors duration-200">
                  <HiOutlineEye className="w-4 h-4" />
                  <span>View</span>
                </button>
              </Link>
              <button
                onClick={() => addToCartHandler(data)}
                className="flex items-center space-x-1 bg-red-600 text-white px-3 py-2 rounded-full font-semibold text-sm shadow-lg hover:bg-red-700 transition-colors duration-200"
              >
                <HiOutlineShoppingCart className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors duration-200">
            {data.name}
          </h3>

          <div className="flex items-center space-x-2 mb-3">
            <span className="text-sm text-gray-500 line-through">
              ${data.originalPrice}
            </span>
            <span className="text-xl font-bold text-gray-900">
              ${data.discountPrice}
            </span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
              Save ${(data.originalPrice - data.discountPrice).toFixed(2)}
            </span>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700 flex items-center">
                <HiClock className="w-3 h-3 mr-1" />
                Deal ends in:
              </span>
              <HiFire className="w-4 h-4 text-red-500 animate-pulse" />
            </div>
            <CountDown data={data} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link to={`/product/${data._id}?isEvent=true`} className="block">
              <button className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
                <HiOutlineEye className="w-4 h-4 mr-1" />
                Details
              </button>
            </Link>
            <button
              onClick={() => addToCartHandler(data)}
              className="inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <HiOutlineShoppingCart className="w-4 h-4 mr-1" />
              Add
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden ${
        active ? "" : "mb-6"
      } hover:shadow-xl transition-all duration-500`}
    >
      <div className="lg:flex">
        <div className="lg:w-1/2 relative overflow-hidden">
          <img
            src={`${backend_url}${data.images[0]}`}
            alt={data.name}
            className="w-full h-40 lg:h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Featured Event Badge */}
          <div className="absolute top-4 left-4">
            <div className="flex flex-col space-y-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                <HiSparkles className="w-3 h-3 mr-1" />
                MEGA DEAL
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
                <HiFire className="w-3 h-3 mr-1" />
                {discountPercentage}% OFF
              </span>
            </div>
          </div>

          {/* Sales Count */}
          <div className="absolute bottom-4 left-4">
            <div className="flex items-center space-x-1 bg-black bg-opacity-50 backdrop-blur-sm rounded-full px-2 py-1">
              <HiStar className="w-3 h-3 text-yellow-400" />
              <span className="text-white text-xs font-medium">
                {data.sold_out} sold
              </span>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => addToCartHandler(data)}
              className="flex items-center space-x-1 bg-white text-gray-900 px-3 py-1.5 rounded-full font-semibold text-xs shadow-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <HiOutlineShoppingCart className="w-3 h-3" />
              <span>Quick Add</span>
            </button>
          </div>
        </div>

        <div className="lg:w-1/2 p-4 lg:p-5 flex flex-col justify-center">
          <div className="mb-3">
            <div className="flex items-center space-x-2 mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                <HiTag className="w-3 h-3 mr-1" />
                LIMITED TIME
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <HiStar className="w-3 h-3 mr-1" />
                TRENDING
              </span>
            </div>

            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1 leading-tight group-hover:text-red-600 transition-colors duration-300">
              {data.name}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
              {data.description}
            </p>
          </div>

          <div className="mb-4">
            <div className="flex items-baseline space-x-2 mb-1">
              <span className="text-lg text-gray-500 line-through">
                ${data.originalPrice}
              </span>
              <span className="text-2xl font-bold text-gray-900">
                ${data.discountPrice}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full font-bold">
                Save ${(data.originalPrice - data.discountPrice).toFixed(2)}
              </span>
              <span className="text-xs text-gray-600">
                ({discountPercentage}% off)
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 rounded-xl p-3 mb-3 border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-900 flex items-center">
                <HiClock className="w-4 h-4 mr-1 text-red-500" />
                Deal Ends In:
              </h3>
              <HiFire className="w-4 h-4 text-red-500 animate-pulse" />
            </div>
            <CountDown data={data} />
          </div>

          <div className="flex flex-col space-y-2">
            {/* Buy Now Button */}
            <button
              onClick={() => buyNowHandler(data)}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="mr-1">🚀</span>
              Buy Now
            </button>
            
            {/* Bottom Row: View Details & Add to Cart */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Link to={`/product/${data._id}?isEvent=true`} className="flex-1">
                <button className="w-full inline-flex items-center justify-center px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 group">
                  <HiOutlineEye className="w-4 h-4 mr-1" />
                  <span>View Details</span>
                  <HiArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </Link>
              <button
                onClick={() => addToCartHandler(data)}
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <HiOutlineShoppingCart className="w-4 h-4 mr-1" />
                Add to Cart
              </button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-3 mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <HiStar className="w-3 h-3 text-yellow-500" />
              <span>4.8 Rating</span>
            </div>
            <div className="w-px h-3 bg-gray-300"></div>
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <span>✓ Fast Delivery</span>
            </div>
            <div className="w-px h-3 bg-gray-300"></div>
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <span>✓ 30-Day Return</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
