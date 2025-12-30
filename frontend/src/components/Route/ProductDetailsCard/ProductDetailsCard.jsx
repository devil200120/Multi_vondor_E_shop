import React, { useEffect, useState } from "react";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlineShoppingCart,
  AiOutlineMinus,
  AiOutlinePlus,
} from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { HiStar, HiOutlineStar } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import { backend_url } from "../../../server";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addTocart } from "../../../redux/actions/cart";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../../redux/actions/wishlist";
import { getProductImageUrl, getAvatarUrl } from "../../../utils/mediaUtils";
import { useCurrency } from "../../../context/CurrencyContext";

const ProductDetailsCard = ({ setOpen, data }) => {
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [count, setCount] = useState(1);
  const [click, setClick] = useState(false);
  const { formatPrice } = useCurrency();

  const handleMessageSubmit = () => {};

  const decrementCount = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };
  const incrementCount = () => {
    setCount(count + 1);
  };

  // Add to cart
  const addToCartHandler = (id) => {
    const isItemExists = cart && cart.find((i) => i._id === id);

    if (isItemExists) {
      toast.error("item already in cart!");
    } else {
      if (data.stock < count) {
        toast.error("Product stock limited!");
      } else {
        const cartData = { ...data, qty: count };
        dispatch(addTocart(cartData));
        toast.success("Item added to cart Successfully!");
        setOpen(false);
      }
    }
  };

  // Buy Now - direct checkout
  const buyNowHandler = () => {
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
    setOpen(false);
    navigate("/checkout");
  };

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

  return (
    <>
      <div className="bg-transparent">
        {data ? (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden relative">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                <h2 className="text-lg font-bold text-gray-900">Quick View</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors duration-200 border border-gray-200 hover:border-red-300"
                >
                  <RxCross1 size={18} className="text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="flex flex-col lg:flex-row max-h-[calc(90vh-64px)] overflow-y-auto">
                {/* Left Side - Images and Shop Info */}
                <div className="w-full lg:w-1/2 p-4 space-y-4">
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden">
                    <img
                      src={getProductImageUrl(data.images, 0, backend_url)}
                      alt={data.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Shop Info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <Link
                      to={`/shop/preview/${data.shop._id}`}
                      className="flex items-center space-x-3 group"
                    >
                      <img
                        src={getAvatarUrl(data?.shop?.avatar, backend_url)}
                        alt={data.shop.name}
                        className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {data.shop.name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) =>
                              i < 4 ? (
                                <HiStar
                                  key={i}
                                  className="w-4 h-4 text-yellow-400"
                                />
                              ) : (
                                <HiOutlineStar
                                  key={i}
                                  className="w-4 h-4 text-gray-300"
                                />
                              )
                            )}
                          </div>
                          <span className="text-sm text-gray-600">(4.5)</span>
                        </div>
                      </div>
                    </Link>

                    <button
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                      onClick={handleMessageSubmit}
                    >
                      <AiOutlineMessage size={18} />
                      <span>Send Message</span>
                    </button>
                  </div>

                  {/* Sales Info */}
                  {data.sold_out > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                      <span className="text-green-700 font-semibold text-sm">
                        🔥 {data.sold_out} items sold
                      </span>
                    </div>
                  )}
                </div>

                {/* Right Side - Product Details */}
                <div className="w-full lg:w-1/2 p-4 space-y-4">
                  {/* Product Title */}
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 leading-tight mb-3">
                      {data.name}
                    </h1>

                    {/* Seller Tag */}
                    {data.isSellerProduct && data.sellerShop && (
                      <div className="mb-3">
                        <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          <span>{data.isAdminTagged ? "👑" : "🏪"}</span>
                          <span>
                            {data.isAdminTagged
                              ? "Admin Tagged Product"
                              : "Seller Product"}
                          </span>
                          <span className="text-blue-600">
                            • {data.sellerShop.name}
                          </span>
                        </div>
                        {data.isAdminTagged && (
                          <div className="mt-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                            Curated and tagged by platform admin
                          </div>
                        )}
                        {data.sellerShop.phoneNumber && (
                          <div className="mt-1 text-xs text-gray-600">
                            Contact: {data.sellerShop.phoneNumber}
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-gray-600 leading-relaxed text-sm">
                      {data.description}
                    </p>
                  </div>

                  {/* Price Section */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-baseline space-x-3 mb-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(data.discountPrice)}
                      </span>
                      {data.originalPrice &&
                        data.originalPrice > data.discountPrice && (
                          <span className="text-lg text-gray-400 line-through">
                            {formatPrice(data.originalPrice)}
                          </span>
                        )}
                    </div>
                    {data.originalPrice &&
                      data.originalPrice > data.discountPrice && (
                        <div className="text-green-600 font-semibold text-sm">
                          You save{" "}
                          {formatPrice(data.originalPrice - data.discountPrice)}{" "}
                          (
                          {Math.round(
                            ((data.originalPrice - data.discountPrice) /
                              data.originalPrice) *
                              100
                          )}
                          % off)
                        </div>
                      )}
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        data.stock > 0 ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <span
                      className={`font-medium text-sm ${
                        data.stock > 0 ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {data.stock > 0
                        ? `${data.stock} in stock`
                        : "Out of stock"}
                    </span>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 text-sm">
                        Quantity:
                      </span>
                      <div className="flex items-center space-x-3">
                        <button
                          className="w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
                          onClick={decrementCount}
                          disabled={count <= 1}
                        >
                          <AiOutlineMinus size={14} />
                        </button>

                        <span className="min-w-[2.5rem] text-center font-semibold">
                          {count}
                        </span>

                        <button
                          className="w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
                          onClick={incrementCount}
                          disabled={count >= data.stock}
                        >
                          <AiOutlinePlus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          click
                            ? removeFromWishlistHandler(data)
                            : addToWishlistHandler(data)
                        }
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        title={
                          click ? "Remove from wishlist" : "Add to wishlist"
                        }
                      >
                        {click ? (
                          <AiFillHeart size={20} className="text-red-500" />
                        ) : (
                          <AiOutlineHeart
                            size={20}
                            className="text-gray-600 hover:text-red-500"
                          />
                        )}
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {/* Buy Now Button */}
                      <button
                        className={`w-full py-3 rounded-xl font-semibold text-base transition-all duration-200 flex items-center justify-center space-x-2 ${
                          data.stock < count
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                        }`}
                        onClick={buyNowHandler}
                        disabled={data.stock < count}
                      >
                        <span className="text-lg">🚀</span>
                        <span>
                          {data.stock < count
                            ? "Insufficient Stock"
                            : "Buy Now"}
                        </span>
                      </button>

                      {/* Add to Cart Button */}
                      <button
                        className={`w-full py-3 rounded-xl font-semibold text-base transition-all duration-200 flex items-center justify-center space-x-2 ${
                          data.stock < count
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                        }`}
                        onClick={() => addToCartHandler(data._id)}
                        disabled={data.stock < count}
                      >
                        <AiOutlineShoppingCart size={18} />
                        <span>
                          {data.stock < count
                            ? "Insufficient Stock"
                            : "Add to Cart"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default ProductDetailsCard;
