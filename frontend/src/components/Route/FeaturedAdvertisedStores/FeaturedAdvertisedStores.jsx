import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { server } from "../../../server";
import { AiOutlineStar, AiOutlineShop } from "react-icons/ai";
import { MdVerified } from "react-icons/md";

const FeaturedAdvertisedStores = () => {
  const [featuredStores, setFeaturedStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedStores();
  }, []);

  const fetchFeaturedStores = async () => {
    try {
      const { data } = await axios.get(
        `${server}/advertisement/active/featured_store`
      );

      if (data.success && data.advertisements?.length > 0) {
        setFeaturedStores(data.advertisements);
      }
    } catch (error) {
      console.error("Error fetching featured stores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStoreClick = async (ad) => {
    // Track click
    try {
      await axios.post(`${server}/advertisement/track-click/${ad._id}`);
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-gray-200 h-48 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (featuredStores.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm p-5 border-l-4 border-l-accent-500 border border-blue-200 mb-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-accent-500 rounded-lg">
            <AiOutlineShop className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Featured Stores</h2>
            <p className="text-xs text-gray-500">Premium vendor spotlight</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-accent-500 text-white text-xs font-bold rounded-full">
          SPONSORED
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {featuredStores.map((ad) => (
          <Link
            key={ad._id}
            to={ad.linkUrl}
            onClick={() => handleStoreClick(ad)}
            className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-accent-500"
          >
            {/* Store Avatar/Logo */}
            <div className="relative h-32 bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              {ad.shopId?.avatar?.url ? (
                <img
                  src={ad.shopId.avatar.url}
                  alt={ad.shopId.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg">
                  <AiOutlineShop className="w-10 h-10 text-primary-500" />
                </div>
              )}

              {/* Featured Badge */}
              <div className="absolute top-2 right-2">
                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded-full shadow-md">
                  <AiOutlineStar className="w-3 h-3" />
                  FEATURED
                </span>
              </div>
            </div>

            {/* Store Info */}
            <div className="p-3">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-accent-600 transition-colors">
                  {ad.shopId?.name || ad.title}
                </h3>
                {ad.shopId?.verified && (
                  <MdVerified className="w-4 h-4 text-blue-500 flex-shrink-0 ml-1" />
                )}
              </div>

              {ad.description && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                  {ad.description}
                </p>
              )}

              {/* Store Stats */}
              {ad.shopId && (
                <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                  {ad.shopId.ratings && (
                    <div className="flex items-center gap-1">
                      <AiOutlineStar className="w-3 h-3 text-yellow-500" />
                      <span className="font-semibold">
                        {ad.shopId.ratings.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {ad.shopId.productsCount && (
                    <span>{ad.shopId.productsCount} products</span>
                  )}
                </div>
              )}

              {/* Visit Button */}
              <button className="w-full py-2 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-xs font-bold rounded-lg group-hover:from-accent-600 group-hover:to-accent-700 transition-all">
                Visit Store →
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FeaturedAdvertisedStores;
