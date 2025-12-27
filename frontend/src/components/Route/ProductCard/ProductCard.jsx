import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { AiFillHeart, AiOutlineEye, AiOutlineHeart } from "react-icons/ai";
import { RiShoppingCartFill } from "react-icons/ri";
import { backend_url, server } from "../../../server";
import ProductDetailsCard from "../ProductDetailsCard/ProductDetailsCard.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../../redux/actions/wishlist";
import { addTocart } from "../../../redux/actions/cart";
import { toast } from "react-toastify";
import Ratings from "../../Products/Ratings";
import { getProductImageUrl } from "../../../utils/mediaUtils";
import axios from "axios";

const ProductCard = ({ data, isEvent, isCompact = false }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user);
  const [click, setClick] = useState(false);
  const [open, setOpen] = useState(false);
  const [shippingInfo, setShippingInfo] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (wishlist && wishlist.find((i) => i._id === data._id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [wishlist, data._id]);

  const fetchShippingInfo = useCallback(async () => {
    try {
      const response = await axios.get(
        `${server}/shipping/simple-config/${data.shopId}`
      );
      if (response.data.success) {
        setShippingInfo(response.data.config);
      }
    } catch (error) {
      console.log("Could not fetch shipping info:", error);
    }
  }, [data?.shopId]);

  useEffect(() => {
    if (data?.shopId) {
      fetchShippingInfo();
    }
  }, [data?.shopId, fetchShippingInfo]);

  const removeFromWishlistHandler = (data) => {
    setClick(!click);
    dispatch(removeFromWishlist(data));
  };

  const addToWishlistHandler = (data) => {
    setClick(!click);
    dispatch(addToWishlist(data));
  };

  const addToCartHandler = (id) => {
    const isItemExists = cart && cart.find((i) => i._id === id);
    if (isItemExists) {
      toast.error("Item already in cart!");
    } else {
      if (data.stock < 1) {
        toast.error("Product stock limited!");
      } else {
        const cartData = { ...data, qty: 1 };
        dispatch(addTocart(cartData));
        toast.success("Item added to cart!");
      }
    }
  };

  const buyNowHandler = async () => {
    if (!user) {
      toast.error("Please login to continue!");
      return;
    }
    if (data.stock < 1) {
      toast.error("Product stock limited!");
      return;
    }

    const cartItem = { ...data, qty: 1 };
    const subTotalPrice = data.discountPrice;
    let shipping = 0;

    if (data.shipping && data.shipping.baseShippingRate > 0) {
      if (
        !data.shipping.freeShippingThreshold ||
        subTotalPrice < data.shipping.freeShippingThreshold
      ) {
        shipping = data.shipping.baseShippingRate;
      }
    } else if (shippingInfo && shippingInfo.isShippingEnabled) {
      if (subTotalPrice < shippingInfo.freeShippingThreshold) {
        shipping = shippingInfo.baseShippingRate || 50;
      }
    }

    const orderData = {
      cart: [cartItem],
      subTotalPrice: subTotalPrice,
      shipping: shipping,
      discountPrice: 0,
      totalPrice: subTotalPrice + shipping,
      user: user,
    };

    localStorage.setItem("latestOrder", JSON.stringify(orderData));
    navigate("/checkout");
  };

  const averageRating =
    data?.reviews && data.reviews.length > 0
      ? (
          data.reviews.reduce((sum, review) => sum + review.rating, 0) /
          data.reviews.length
        ).toFixed(1)
      : "0.0";

  const discountPercent =
    data.originalPrice && data.originalPrice > data.discountPrice
      ? Math.round(
          ((data.originalPrice - data.discountPrice) / data.originalPrice) * 100
        )
      : 0;

  const hasFreeShipping = () => {
    if (
      data.shipping &&
      data.shipping.freeShippingThreshold &&
      data.discountPrice >= data.shipping.freeShippingThreshold
    )
      return true;
    if (
      shippingInfo &&
      shippingInfo.freeShippingThreshold &&
      data.discountPrice >= shippingInfo.freeShippingThreshold
    )
      return true;
    return false;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200 h-full flex flex-col w-full">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <Link
            to={`${
              isEvent
                ? `/product/${data._id}?isEvent=true`
                : `/product/${data._id}`
            }`}
          >
            <img
              src={getProductImageUrl(data.images, 0, backend_url)}
              alt={data.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {discountPercent}% OFF
            </span>
          )}

          {/* Actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5">
            <button
              onClick={() =>
                click
                  ? removeFromWishlistHandler(data)
                  : addToWishlistHandler(data)
              }
              className="p-2 bg-white rounded-full shadow hover:shadow-md transition-shadow"
            >
              {click ? (
                <AiFillHeart size={16} className="text-red-500" />
              ) : (
                <AiOutlineHeart size={16} className="text-gray-500" />
              )}
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="p-2 bg-white rounded-full shadow hover:shadow-md transition-shadow"
            >
              <AiOutlineEye size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Out of Stock */}
          {data.stock < 1 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1">
          {/* Shop */}
          <p className="text-[11px] text-primary-600 font-semibold uppercase tracking-wide truncate">
            {data?.shop?.name}
          </p>

          {/* Name */}
          <Link to={`/product/${data._id}`}>
            <h3 className="text-sm font-semibold text-gray-800 hover:text-primary-600 line-clamp-1 mt-0.5">
              {data.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="mt-1.5">
            <Ratings rating={parseFloat(averageRating)} />
          </div>

          {/* Price */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              ₹{data.discountPrice || data.originalPrice}
            </span>
            {discountPercent > 0 && (
              <span className="text-xs text-gray-400 line-through">
                ₹{data.originalPrice}
              </span>
            )}
          </div>

          {/* Save & Shipping */}
          <div className="flex items-center justify-between mt-1 text-xs">
            {discountPercent > 0 && (
              <span className="text-green-600 font-medium">
                Save ₹{data.originalPrice - data.discountPrice}
              </span>
            )}
            {hasFreeShipping() && (
              <span className="text-blue-600">🚚 Free Shipping</span>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-auto pt-3">
            <button
              onClick={buyNowHandler}
              disabled={data.stock < 1}
              className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${
                data.stock < 1
                  ? "bg-gray-200 text-gray-400"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              Buy Now
            </button>
            <button
              onClick={() => addToCartHandler(data._id)}
              disabled={data.stock < 1}
              className={`flex-1 py-2 text-xs font-bold rounded flex items-center justify-center gap-1 border-2 transition-colors ${
                data.stock < 1
                  ? "bg-gray-200 text-gray-400 border-gray-200"
                  : "bg-white text-primary-600 border-primary-600 hover:bg-primary-50"
              }`}
            >
              <RiShoppingCartFill size={14} /> Cart
            </button>
          </div>
        </div>
      </div>

      {open &&
        createPortal(
          <ProductDetailsCard setOpen={setOpen} data={data} />,
          document.body
        )}
    </>
  );
};

export default ProductCard;
