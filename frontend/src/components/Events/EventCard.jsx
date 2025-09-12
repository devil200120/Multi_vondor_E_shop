import React, { useEffect } from "react";
import { backend_url } from "../../server";
import styles from "../../styles/styles";
import CountDown from "./CountDown";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addTocart } from "../../redux/actions/cart";
import { toast } from "react-toastify";

import { HiOutlineShoppingCart, HiOutlineEye } from "react-icons/hi";
import { FiTag } from "react-icons/fi";

const EventCard = ({ active, data, compact = false }) => {
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

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

  const discountPercentage = Math.round(
    ((data.originalPrice - data.discountPrice) / data.originalPrice) * 100
  );

  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <div className="relative overflow-hidden">
          <img
            src={`${backend_url}${data.images[0]}`}
            alt={data.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <FiTag className="w-3 h-3 mr-1" />
              {discountPercentage}% OFF
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {data.sold_out} sold
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3
            className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors overflow-hidden"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {data.name}
          </h3>

          <div className="flex items-center space-x-2 mb-3">
            <span className="text-sm text-gray-500 line-through">
              ${data.originalPrice}
            </span>
            <span className="text-xl font-bold text-gray-900">
              ${data.discountPrice}
            </span>
          </div>

          <div className="mb-4">
            <CountDown data={data} />
          </div>

          <div className="flex space-x-2">
            <Link to={`/product/${data._id}?isEvent=true`} className="flex-1">
              <button className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                <HiOutlineEye className="w-4 h-4 mr-1" />
                See Details
              </button>
            </Link>
            <button
              onClick={() => addToCartHandler(data)}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <HiOutlineShoppingCart className="w-4 h-4 mr-1" />
              Add to cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden ${
        active ? "" : "mb-12"
      } hover:shadow-xl transition-all duration-300`}
    >
      <div className="lg:flex">
        <div className="lg:w-1/2 relative overflow-hidden">
          <img
            src={`${backend_url}${data.images[0]}`}
            alt={data.name}
            className="w-full h-64 lg:h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 shadow-sm">
              <FiTag className="w-4 h-4 mr-1" />
              {discountPercentage}% OFF
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 shadow-sm">
              {data.sold_out} sold
            </span>
          </div>
        </div>

        <div className="lg:w-1/2 p-6 lg:p-8 flex flex-col justify-center">
          <div className="mb-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">
              {data.name}
            </h2>
            <p
              className="text-gray-600 text-base leading-relaxed overflow-hidden"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {data.description}
            </p>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-lg text-gray-500 line-through">
                ${data.originalPrice}
              </span>
              <span className="text-3xl font-bold text-gray-900">
                ${data.discountPrice}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <CountDown data={data} />
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Link to={`/product/${data._id}?isEvent=true`} className="flex-1">
              <button className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md">
                <HiOutlineEye className="w-5 h-5 mr-2" />
                See Details
              </button>
            </Link>
            <button
              onClick={() => addToCartHandler(data)}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md transform hover:scale-105"
            >
              <HiOutlineShoppingCart className="w-5 h-5 mr-2" />
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
