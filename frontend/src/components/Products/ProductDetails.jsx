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
import { getAllProductsShop } from "../../redux/actions/product";
import { backend_url, server } from "../../server";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../redux/actions/wishlist";
import { addTocart } from "../../redux/actions/cart";
import { toast } from "react-toastify";
import Ratings from "./Ratings";
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
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getAllProductsShop(data && data?.shop._id));
    if (wishlist && wishlist.find((i) => i._id === data?._id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [data, wishlist]);

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
        const cartData = { ...data, qty: count };
        dispatch(addTocart(cartData));
        toast.success("Item added to cart Successfully!");
      }
    }
  };

  const incrementCount = () => {
    setCount(count + 1);
  };
  const decrementCount = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  const totalReviewsLength =
    products &&
    products.reduce((acc, product) => acc + product.reviews.length, 0);

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="relative aspect-square">
                  <img
                    src={`${backend_url}${data && data.images[select]}`}
                    alt={data.name}
                    className="w-full h-full object-cover"
                  />
                  {data.originalPrice && (
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 shadow-sm">
                        {discountPercentage}% OFF
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* Thumbnail Images */}
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {data &&
                  data.images.map((image, index) => (
                    <button
                      key={index}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        select === index
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelect(index)}
                    >
                      <img
                        src={`${backend_url}${image}`}
                        alt={`${data.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
              </div>
            </div>
            {/* Product Information */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  {data.name}
                </h1>
                <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                  {data.description}
                </p>
              </div>
              {/* Price Section */}
              <div className="flex items-center space-x-4">
                <span className="text-3xl lg:text-4xl font-bold text-gray-900">
                  ${data.discountPrice}
                </span>
                {data.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ${data.originalPrice}
                  </span>
                )}
              </div>
              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-200">
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
              {/* Quantity and Actions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-gray-700">
                      Quantity:
                    </span>
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        className="flex items-center justify-center w-10 h-10 text-gray-600 hover:bg-gray-100 transition-colors"
                        onClick={decrementCount}
                        disabled={count <= 1}
                      >
                        <AiOutlineMinus className="w-4 h-4" />
                      </button>
                      <span className="flex items-center justify-center w-12 h-10 bg-gray-50 text-gray-900 font-medium">
                        {count}
                      </span>
                      <button
                        className="flex items-center justify-center w-10 h-10 text-gray-600 hover:bg-gray-100 transition-colors"
                        onClick={incrementCount}
                      >
                        <AiOutlinePlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      click
                        ? removeFromWishlistHandler(data)
                        : addToWishlistHandler(data)
                    }
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                      click
                        ? "border-red-500 bg-red-50 text-red-600 hover:bg-red-100"
                        : "border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-600"
                    }`}
                    title={click ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    {click ? (
                      <AiFillHeart className="w-5 h-5" />
                    ) : (
                      <AiOutlineHeart className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <button
                  onClick={() => addToCartHandler(data._id)}
                  className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  <AiOutlineShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </button>
              </div>
              {/* Seller Information */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/shop/preview/${data?.shop._id}`}
                    className="flex items-center space-x-4 group"
                  >
                    <img
                      src={`${backend_url}${data?.shop?.avatar}`}
                      alt={data?.shop?.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-500 transition-colors"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {data.shop.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <AiFillStar
                              key={star}
                              className={`w-4 h-4 ${
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
                  </Link>
                  <button
                    onClick={handleMessageSubmit}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                  >
                    <AiOutlineMessage className="w-4 h-4 mr-2" />
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Info */}
          <ProductDetailsInfo
            data={data}
            products={products}
            totalReviewsLength={totalReviewsLength}
            averageRating={averageRating}
          />
        </div>
      )}
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
    <div className="mt-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  active === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {active === 1 && (
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Product Description
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {data.description}
              </p>
            </div>
          )}

          {active === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Customer Reviews
              </h3>

              {data && data.reviews.length > 0 ? (
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
                          <Ratings rating={data?.ratings} />
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  About the Seller
                </h3>

                <Link
                  to={`/shop/preview/${data.shop._id}`}
                  className="block group"
                >
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                    <img
                      src={`${backend_url}${data?.shop?.avatar}`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      alt={data.shop.name}
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {data.shop.name}
                      </h3>
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <AiFillStar
                              key={star}
                              className={`w-4 h-4 ${
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

              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Shop Statistics
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">
                          Joined on
                        </p>
                        <p className="text-lg font-semibold text-blue-900">
                          {new Date(data.shop?.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <BiStore className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">
                          Total Products
                        </p>
                        <p className="text-lg font-semibold text-green-900">
                          {products && products.length}
                        </p>
                      </div>
                      <AiOutlineShoppingCart className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">
                          Total Reviews
                        </p>
                        <p className="text-lg font-semibold text-purple-900">
                          {totalReviewsLength}
                        </p>
                      </div>
                      <AiOutlineStar className="w-8 h-8 text-purple-600" />
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
