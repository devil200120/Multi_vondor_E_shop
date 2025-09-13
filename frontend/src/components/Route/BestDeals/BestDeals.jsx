import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ProductCard from "../ProductCard/ProductCard";
import {
  HiOutlineFire,
  HiTrendingUp,
  HiClock,
  HiStar,
  HiLightningBolt,
  HiSparkles,
  HiGift,
} from "react-icons/hi";

const BestDeals = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 45,
  });
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
      
      @keyframes glow {
        0%, 100% {
          box-shadow: 0 0 20px rgba(249, 115, 22, 0.4);
        }
        50% {
          box-shadow: 0 0 40px rgba(249, 115, 22, 0.8);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const allProductsData = allProducts ? [...allProducts] : [];
    const sortedData = allProductsData?.sort((a, b) => b.sold_out - a.sold_out);
    const firstFive = sortedData && sortedData.slice(0, 5);
    setData(firstFive);
    setLoading(false);
  }, [allProducts]);

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200 to-red-200 rounded-full opacity-20 animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-20 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full opacity-10 animate-spin"
            style={{ animationDuration: "20s" }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-100 border-t-orange-600 mx-auto shadow-lg"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <HiOutlineFire className="w-6 h-6 text-orange-600 animate-pulse" />
              </div>
            </div>
            <div className="mt-6">
              <div className="inline-flex items-center mb-3">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-lg animate-bounce">
                  <HiSparkles className="w-4 h-4 animate-pulse" />
                  <span className="text-xs font-bold tracking-wide">
                    LOADING AMAZING DEALS
                  </span>
                  <HiLightningBolt className="w-3 h-3 animate-pulse" />
                </div>
              </div>
              <p className="mt-4 text-base text-slate-700 font-semibold animate-pulse">
                Preparing today's most incredible offers...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200 to-red-200 rounded-full opacity-20 animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-30 animate-bounce"
          style={{ animationDuration: "3s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-gradient-to-br from-red-200 to-pink-200 rounded-full opacity-30 animate-bounce"
          style={{ animationDuration: "4s", animationDelay: "2s" }}
        ></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Eye-catching Header Section */}
        <div className="text-center mb-8">
          {/* Animated Badge with Glow Effect */}
          <div className="inline-flex items-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
              <div className="relative flex items-center space-x-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-xl">
                <HiOutlineFire className="w-4 h-4 animate-bounce" />
                <span className="text-xs font-bold tracking-wider">
                  🔥 TODAY'S MEGA DEALS 🔥
                </span>
                <HiLightningBolt className="w-3 h-3 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Main Title with Enhanced Animation */}
          <div className="mb-3">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 mb-2 leading-tight">
              <span className="inline-block animate-pulse">💥</span>
              <span className="mx-2">Best Deals of the</span>
              <span className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
                Day
              </span>
              <span className="inline-block animate-pulse">💥</span>
            </h2>
            <div className="flex justify-center mt-2">
              <div className="h-1 w-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Enhanced Subtitle */}
          <p className="text-base text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium mb-4">
            🎯 <strong>Limited Time Only!</strong> Massive discounts on premium
            products.
            <span className="text-red-600 font-bold"> Up to 80% OFF!</span>
          </p>

          {/* Enhanced Stats Row with Icons */}
          <div className="flex justify-center items-center space-x-6 mt-5">
            <div className="flex items-center space-x-2 bg-white bg-opacity-80 px-3 py-1.5 rounded-full shadow-md">
              <HiStar
                className="w-4 h-4 text-yellow-500 animate-spin"
                style={{ animationDuration: "3s" }}
              />
              <span className="text-xs font-bold text-slate-800">
                4.9★ Rating
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-white bg-opacity-80 px-3 py-1.5 rounded-full shadow-md">
              <HiTrendingUp className="w-4 h-4 text-green-500 animate-bounce" />
              <span className="text-xs font-bold text-slate-800">
                10K+ Sold
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-white bg-opacity-80 px-3 py-1.5 rounded-full shadow-md">
              <HiGift className="w-4 h-4 text-purple-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800">
                Free Shipping
              </span>
            </div>
          </div>
        </div>

        {data && data.length !== 0 ? (
          <>
            {/* Enhanced Timer Banner with Glow Effect */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 rounded-2xl blur-xl opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 rounded-2xl p-5 shadow-2xl">
                <div className="text-center text-white">
                  <div className="flex items-center justify-center mb-3">
                    <HiClock className="w-5 h-5 mr-2 animate-pulse" />
                    <h3 className="text-lg font-black">
                      ⏰ DEAL EXPIRES IN ⏰
                    </h3>
                  </div>
                  <div className="flex justify-center space-x-3 md:space-x-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white bg-opacity-30 backdrop-blur-sm rounded-xl animate-pulse"></div>
                      <div className="relative bg-white bg-opacity-20 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[60px] border border-white border-opacity-30">
                        <div className="text-2xl md:text-3xl font-black">
                          {String(timeLeft.hours).padStart(2, "0")}
                        </div>
                        <div className="text-xs font-bold opacity-90">
                          HOURS
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-2xl font-black opacity-75 animate-pulse">
                      :
                    </div>
                    <div className="relative">
                      <div
                        className="absolute inset-0 bg-white bg-opacity-30 backdrop-blur-sm rounded-xl animate-pulse"
                        style={{ animationDelay: "0.5s" }}
                      ></div>
                      <div className="relative bg-white bg-opacity-20 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[60px] border border-white border-opacity-30">
                        <div className="text-2xl md:text-3xl font-black">
                          {String(timeLeft.minutes).padStart(2, "0")}
                        </div>
                        <div className="text-xs font-bold opacity-90">MINS</div>
                      </div>
                    </div>
                    <div className="flex items-center text-2xl font-black opacity-75 animate-pulse">
                      :
                    </div>
                    <div className="relative">
                      <div
                        className="absolute inset-0 bg-white bg-opacity-30 backdrop-blur-sm rounded-xl animate-pulse"
                        style={{ animationDelay: "1s" }}
                      ></div>
                      <div className="relative bg-white bg-opacity-20 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[60px] border border-white border-opacity-30">
                        <div className="text-2xl md:text-3xl font-black">
                          {String(timeLeft.seconds).padStart(2, "0")}
                        </div>
                        <div className="text-xs font-bold opacity-90">SECS</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-center">
                    <p className="text-sm font-bold bg-white bg-opacity-20 px-4 py-1.5 rounded-full">
                      🚨 <strong>HURRY UP!</strong> Don't miss these incredible
                      savings! 🚨
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Products Grid with Special Effects */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mb-8">
              {data.map((product, index) => (
                <div
                  key={index}
                  className="group transform transition-all duration-500 hover:scale-110 hover:z-10"
                  style={{
                    animationDelay: `${index * 150}ms`,
                    animation: "fadeInUp 0.6s ease-out forwards",
                  }}
                >
                  <div className="relative">
                    {/* Enhanced Trending Badge */}
                    {index === 0 && (
                      <div className="absolute -top-3 -right-3 z-20">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-md animate-pulse"></div>
                          <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-black px-3 py-2 rounded-full shadow-xl animate-bounce">
                            🏆 #1 BESTSELLER
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Hot Deal Badge for other products */}
                    {index > 0 && index < 3 && (
                      <div className="absolute -top-2 -right-2 z-20">
                        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                          🔥 HOT
                        </div>
                      </div>
                    )}
                    {/* Limited Stock Badge */}
                    {index >= 3 && (
                      <div className="absolute -top-2 -right-2 z-20">
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                          ⚡ LIMITED
                        </div>
                      </div>
                    )}

                    {/* Glow Effect on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-200 to-red-200 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl"></div>

                    <ProductCard data={product} />
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced CTA Section */}
            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-200 rounded-2xl blur-xl opacity-50"></div>
                <div className="relative bg-white rounded-2xl p-6 shadow-2xl border-2 border-gradient-to-r from-blue-200 to-purple-200">
                  <div className="mb-3">
                    <span className="text-3xl">🎁</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">
                    Want Even More Amazing Deals?
                  </h3>
                  <p className="text-slate-600 mb-4 text-sm">
                    🔥 Explore our complete collection of best-selling products
                    with
                    <span className="text-red-600 font-bold">
                      {" "}
                      exclusive discounts
                    </span>
                  </p>
                  <Link to="/best-selling">
                    <button className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-black text-base rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 transform overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      <span className="relative flex items-center">
                        <HiSparkles className="w-4 h-4 mr-2 animate-spin" />
                        View All Best Sellers
                        <svg
                          className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Enhanced Empty State
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-md">
                <HiOutlineFire className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                No Hot Deals Right Now
              </h3>
              <p className="text-base text-slate-600 mb-6 leading-relaxed">
                Our team is working hard to bring you the next set of amazing
                deals. Check back soon for incredible offers!
              </p>
              <Link to="/products">
                <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 transform">
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

export default BestDeals;
