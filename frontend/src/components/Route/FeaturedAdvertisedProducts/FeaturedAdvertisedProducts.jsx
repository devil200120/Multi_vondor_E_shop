import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { server } from "../../../server";
import {
  AiOutlineStar,
  AiOutlineShoppingCart,
  AiOutlineHeart,
} from "react-icons/ai";
import { MdLocalOffer } from "react-icons/md";

const FeaturedAdvertisedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data } = await axios.get(
        `${server}/advertisement/active/featured_product`
      );

      if (data.success && data.advertisements?.length > 0) {
        setFeaturedProducts(data.advertisements);
      }
    } catch (error) {
      console.error("Error fetching featured products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = async (ad) => {
    // Track click
    try {
      await axios.post(`${server}/advertisement/track-click/${ad._id}`);
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-gray-200 h-64 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm p-5 border-l-4 border-l-red-500 border border-blue-200 mb-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-500 rounded-lg">
            <MdLocalOffer className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Featured Products
            </h2>
            <p className="text-xs text-gray-500">
              Handpicked deals just for you
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
          SPONSORED
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {featuredProducts.map((ad) => {
          const product = ad.productId;
          if (!product) return null;

          return (
            <Link
              key={ad._id}
              to={`/product/${product._id}`}
              onClick={() => handleProductClick(ad)}
              className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-red-500"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img
                  src={product.images?.[0]?.url || "/placeholder-product.jpg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />

                {/* Featured Badge */}
                <div className="absolute top-2 left-2">
                  <span className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-md">
                    <MdLocalOffer className="w-3 h-3" />
                    FEATURED
                  </span>
                </div>

                {/* Discount Badge */}
                {product.originalPrice &&
                  product.discountPrice < product.originalPrice && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded-full shadow-md">
                        {Math.round(
                          ((product.originalPrice - product.discountPrice) /
                            product.originalPrice) *
                            100
                        )}
                        % OFF
                      </span>
                    </div>
                  )}

                {/* Quick Actions */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50">
                    <AiOutlineHeart className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-red-600 transition-colors min-h-[40px]">
                  {product.name}
                </h3>

                {/* Ratings */}
                {product.ratings > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <AiOutlineStar
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(product.ratings)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      ({product.numOfReviews || 0})
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-lg font-bold text-red-600">
                    ${product.discountPrice}
                  </span>
                  {product.originalPrice &&
                    product.discountPrice < product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                </div>

                {/* Shop Name */}
                <div className="text-xs text-gray-500 mb-2 truncate">
                  by {ad.shopId?.name || "Unknown Shop"}
                </div>

                {/* Add to Cart Button */}
                <button className="w-full py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-lg group-hover:from-red-600 group-hover:to-red-700 transition-all flex items-center justify-center gap-2">
                  <AiOutlineShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedAdvertisedProducts;
