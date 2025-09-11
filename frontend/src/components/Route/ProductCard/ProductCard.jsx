import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AiFillHeart,
  AiOutlineEye,
  AiOutlineHeart,
  AiOutlineShoppingCart,
} from "react-icons/ai";
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

const ProductCard = ({ data, isEvent }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const [click, setClick] = useState(false);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

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

  return (
    <>
      <div className="group bg-white rounded-xl shadow-unacademy hover:shadow-unacademy-lg transition-all duration-300 overflow-hidden border border-secondary-100 hover:border-primary-200 relative">
        {/* Product Image */}
        <div className="relative overflow-hidden">
          <Link
            to={`${
              isEvent === true
                ? `/product/${data._id}?isEvent=true`
                : `/product/${data._id}`
            }`}
          >
            <div className="aspect-w-16 aspect-h-12 bg-secondary-50">
              <img
                src={`${backend_url}${data.images && data.images[0]}`}
                alt={data.name}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>

          {/* Discount Badge */}
          {data.originalPrice && data.originalPrice > data.discountPrice && (
            <div className="absolute top-3 left-3 bg-accent-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
              {Math.round(
                ((data.originalPrice - data.discountPrice) /
                  data.originalPrice) *
                  100
              )}
              % OFF
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() =>
                click
                  ? removeFromWishlistHandler(data)
                  : addToWishlistHandler(data)
              }
              className="p-2 bg-white rounded-full shadow-unacademy hover:shadow-unacademy-md transition-all duration-200 hover:scale-110"
              title={click ? "Remove from wishlist" : "Add to wishlist"}
            >
              {click ? (
                <AiFillHeart size={18} className="text-red-500" />
              ) : (
                <AiOutlineHeart
                  size={18}
                  className="text-text-muted hover:text-red-500"
                />
              )}
            </button>

            <button
              onClick={() => setOpen(!open)}
              className="p-2 bg-white rounded-full shadow-unacademy hover:shadow-unacademy-md transition-all duration-200 hover:scale-110"
              title="Quick view"
            >
              <AiOutlineEye
                size={18}
                className="text-text-muted hover:text-primary-500"
              />
            </button>

            <button
              onClick={() => addToCartHandler(data._id)}
              className="p-2 bg-white rounded-full shadow-unacademy hover:shadow-unacademy-md transition-all duration-200 hover:scale-110"
              title="Add to cart"
            >
              <AiOutlineShoppingCart
                size={18}
                className="text-text-muted hover:text-primary-500"
              />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          {/* Shop Name */}
          <Link
            to={`${
              isEvent === true
                ? `/product/${data._id}?isEvent=true`
                : `/product/${data._id}`
            }`}
            className="inline-block"
          >
            <p className="text-xs text-primary-500 font-medium hover:text-primary-600 transition-colors duration-200">
              {data.shop.name}
            </p>
          </Link>

          {/* Product Name */}
          <Link to={`/product/${data._id}`}>
            <h3 className="font-semibold text-text-primary hover:text-primary-500 transition-colors duration-200 line-clamp-2 leading-tight">
              {data.name.length > 50
                ? data.name.slice(0, 50) + "..."
                : data.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <Ratings rating={data?.ratings} />
            <span className="text-xs text-text-muted">
              ({data?.numOfReviews || 0})
            </span>
          </div>

          {/* Price and Sales */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-primary-500">
                ₹
                {data.originalPrice === 0
                  ? data.originalPrice
                  : data.discountPrice}
              </span>
              {data.originalPrice &&
                data.originalPrice > data.discountPrice && (
                  <span className="text-sm text-text-muted line-through">
                    ₹{data.originalPrice}
                  </span>
                )}
            </div>

            {data?.sold_out && (
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                {data.sold_out} sold
              </span>
            )}
          </div>

          {/* Add to Cart Button - Visible on Hover */}
          <button
            onClick={() => addToCartHandler(data._id)}
            className="w-full bg-primary-500 text-white py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-all duration-200 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
          >
            Add to Cart
          </button>
        </div>

        {/* Product Details Modal */}
        {open && <ProductDetailsCard setOpen={setOpen} data={data} />}
      </div>
    </>
  );
};

export default ProductCard;
