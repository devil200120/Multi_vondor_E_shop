import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { server, backend_url } from "../../server";
import { getAvatarUrl } from "../../utils/mediaUtils";
import {
  HiStar,
  HiShoppingBag,
  HiArrowRight,
  HiSparkles,
} from "react-icons/hi";

const FeaturedStores = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        // Try to fetch approved shops
        const { data } = await axios.get(`${server}/shop/get-all-shops`);
        if (data.success) {
          // Get first 15 shops for 5x3 grid
          setShops(data.shops?.slice(0, 15) || []);
        }
      } catch (error) {
        console.log("Error fetching shops:", error);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  if (loading) {
    return (
      <section className="py-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-primary-600 mx-auto"></div>
          <p className="mt-3 text-primary-600 text-sm">Loading stores...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full shadow-sm">
            <HiShoppingBag className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wide">
              FEATURED STORES
            </span>
            <HiSparkles className="w-3 h-3" />
          </div>
        </div>
        <Link
          to="/products"
          className="flex items-center space-x-1 text-red-600 hover:text-red-700 font-medium text-sm transition-colors duration-200"
        >
          <span>Show All</span>
          <HiArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stores Grid - Responsive */}
      {shops.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {shops.map((shop, index) => (
            <Link
              key={shop._id || index}
              to={`/shop/preview/${shop._id}`}
              className="group bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm hover:shadow-md border border-blue-200 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-red-400"
            >
              {/* Store Image/Avatar */}
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-primary-100 flex items-center justify-center p-3">
                <img
                  src={getAvatarUrl(shop.avatar, backend_url)}
                  alt={shop.name}
                  className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      shop.name
                    )}&background=003DA5&color=fff&size=200`;
                  }}
                />
              </div>

              {/* Store Info */}
              <div className="p-2.5 text-center">
                <h3 className="font-semibold text-gray-800 text-xs truncate group-hover:text-primary-600 transition-colors">
                  {shop.name}
                </h3>
                {shop.ratings !== undefined && (
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    <HiStar className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-gray-500">
                      {shop.ratings?.toFixed(1) || "New"}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        // Empty State - Placeholder Grid
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm border border-blue-200 overflow-hidden"
            >
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-150 flex items-center justify-center">
                <HiShoppingBag className="w-10 h-10 text-gray-300" />
              </div>
              <div className="p-2.5 text-center">
                <div className="h-3 bg-blue-100 rounded w-3/4 mx-auto"></div>
                <div className="h-2 bg-blue-100 rounded w-1/2 mx-auto mt-1.5"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA for Vendors */}
      <div className="mt-6 text-center">
        <div className="inline-block bg-gradient-to-r from-blue-100 to-red-100 rounded-lg p-4 border border-blue-200">
          <h3 className="text-base font-bold text-primary-700 mb-1">
            Want to open your store?
          </h3>
          <p className="text-gray-500 text-sm mb-3">
            Join Mall of Cayman and reach thousands of customers
          </p>
          <Link
            to="/shop-create"
            className="inline-flex items-center px-5 py-2.5 bg-accent-500 text-white font-semibold text-sm rounded-lg hover:bg-accent-600 transition-colors duration-200"
          >
            <span>Become a Seller</span>
            <HiArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedStores;
