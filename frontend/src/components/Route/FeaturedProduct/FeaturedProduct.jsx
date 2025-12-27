import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ProductCard from "../ProductCard/ProductCard";
import {
  HiStar,
  HiTrendingUp,
  HiSparkles,
  HiLightningBolt,
} from "react-icons/hi";

const FeaturedProduct = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { allProducts } = useSelector((state) => state.products);

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Hide scrollbar for mobile horizontal scroll */
      .scrollbar-hide {
        -ms-overflow-style: none;  /* Internet Explorer 10+ */
        scrollbar-width: none;  /* Firefox */
      }
      .scrollbar-hide::-webkit-scrollbar { 
        display: none;  /* Safari and Chrome */
      }

      /* Smooth scrolling for mobile */
      .scrollbar-hide {
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const allProductsData = allProducts ? [...allProducts] : [];
    // Get featured products (you can modify this logic based on your criteria)
    const featuredProducts = allProductsData?.slice(0, 8);
    setData(featuredProducts);
    setLoading(false);
  }, [allProducts]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-100 border-t-purple-600 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <HiSparkles className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="mt-6 text-lg text-slate-600 font-medium">
              Loading featured products...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Modern Header Section */}
        <div className="text-center mb-6">
          {/* Badge */}
          <div className="inline-flex items-center mb-4">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-md">
              <HiSparkles className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-bold tracking-wide">
                FEATURED COLLECTION
              </span>
              <HiLightningBolt className="w-3 h-3" />
            </div>
          </div>

          {/* Main Title */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 leading-tight">
            Featured
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {" "}
              Products
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover our carefully curated selection of premium products that
            stand out from the crowd.
          </p>

          {/* Stats Row */}
          <div className="flex justify-center items-center space-x-6 mt-6">
            <div className="flex items-center space-x-1 text-slate-700">
              <HiStar className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Premium Quality</span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="flex items-center space-x-1 text-slate-700">
              <HiTrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Top Rated</span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="flex items-center space-x-1 text-slate-700">
              <HiSparkles className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Curated</span>
            </div>
          </div>
        </div>

        {data && data.length !== 0 ? (
          <>
            {/* Products Grid */}
            <div className="mb-6">
              {/* Mobile View - Horizontal Scroll */}
              <div className="block md:hidden">
                <div className="flex space-x-3 overflow-x-auto pb-4 px-3 scrollbar-hide">
                  {data.map((product, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-[180px]"
                      style={{
                        animationDelay: `${index * 150}ms`,
                        animation: "fadeInUp 0.6s ease-out forwards",
                      }}
                    >
                      <ProductCard data={product} isCompact={true} />
                    </div>
                  ))}
                </div>
                {/* Mobile Scroll Indicator */}
                <div className="flex justify-center mt-3">
                  <div className="flex items-center space-x-1 bg-white bg-opacity-80 px-3 py-1.5 rounded-full shadow-md">
                    <span className="text-xs font-medium text-gray-600">
                      Swipe to see more
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-400 animate-pulse"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Desktop/Tablet View - Grid Layout */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((product, index) => (
                  <div key={index} className="h-full w-full">
                    <ProductCard data={product} />
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            {/* <div className="text-center">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Explore More Amazing Products
                </h3>
                <p className="text-slate-600 mb-4 text-base">
                  Browse our complete collection for the best deals and quality
                </p>
                <Link to="/products">
                  <button className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 transform">
                    <span>View All Products</span>
                    <svg
                      className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </button>
                </Link>
              </div>
            </div> */}
          </>
        ) : (
          // Enhanced Empty State
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-md">
                <HiSparkles className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                No Featured Products Yet
              </h3>
              <p className="text-base text-slate-600 mb-6 leading-relaxed">
                We're working on curating amazing products for you. Check back
                soon for our featured collection!
              </p>
              <Link to="/products">
                <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 transform">
                  <span>Browse All Products</span>
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProduct;
