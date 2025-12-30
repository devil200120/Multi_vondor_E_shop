import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { server, backend_url } from "../../../server";
import { getBannerImageUrl } from "../../../utils/mediaUtils";
import SlidingBanner from "./SlidingBanner";

const Hero = () => {
  const [banner, setBanner] = useState({
    title: "Best Collection for",
    subtitle: "Home Decoration",
    description:
      "Discover our curated collection of premium home decor items that transform your space into a beautiful sanctuary.",
    image: "https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg",
    buttonText: "Shop Now",
    secondaryButtonText: "View Collections",
    stats: {
      customers: { count: "10K+", label: "Happy Customers" },
      products: { count: "5K+", label: "Products" },
      satisfaction: { count: "99%", label: "Satisfaction" },
    },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBannerData();
  }, []);

  // Also refresh banner data when component becomes visible (e.g., user navigates back to home)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Page became visible, refreshing banner data");
        fetchBannerData();
      }
    };

    const handleBannerUpdate = (event) => {
      console.log("Received banner update event:", event.detail);
      setBanner(event.detail);
      // Force image reload by updating the state
      setTimeout(() => {
        setBanner((prev) => ({ ...prev, _imageRefresh: Date.now() }));
      }, 100);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("bannerUpdated", handleBannerUpdate);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("bannerUpdated", handleBannerUpdate);
    };
  }, []);

  const fetchBannerData = async () => {
    try {
      setLoading(true);
      // Add cache-busting parameter to force fresh data
      const { data } = await axios.get(
        `${server}/banner/get-banner?t=${Date.now()}`
      );
      console.log("Banner data received:", data);
      console.log("Banner display mode:", data.banner?.displayMode);
      console.log("Banner images count:", data.banner?.images?.length || 0);
      console.log("Banner images array:", data.banner?.images);
      if (data.success && data.banner) {
        console.log("Setting banner data:", data.banner);
        setBanner(data.banner);
      }
    } catch (error) {
      console.error("Error fetching banner data:", error);
      // Keep default values if API fails
    } finally {
      setLoading(false);
    }
  };

  // Get image URL using utility function
  const getImageUrl = (image) => {
    return getBannerImageUrl(image, backend_url);
  };
  return (
    <div className="relative w-full bg-gradient-to-br from-white via-blue-50 to-primary-50 rounded-2xl shadow-lg border border-blue-200 border-t-4 border-t-red-500 overflow-hidden">
      <div className="p-6 md:p-8 lg:p-10">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          {/* Left Content */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {banner.title}
              <span className="block text-primary-500 mt-1 md:mt-2">
                {banner.subtitle}
              </span>
            </h1>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-xl">
              {banner.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
              <Link to="/products">
                <button className="px-6 py-2.5 md:px-8 md:py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-300 text-sm md:text-base shadow-md hover:shadow-lg hover:scale-105">
                  {banner.buttonText || "Shop Now"}
                </button>
              </Link>
              <Link to="/best-selling">
                <button className="px-6 py-2.5 md:px-8 md:py-3 border-2 border-primary-500 text-primary-500 font-semibold rounded-lg hover:bg-primary-50 transition-all duration-300 text-sm md:text-base hover:scale-105">
                  {banner.secondaryButtonText || "View Collections"}
                </button>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="flex justify-center md:justify-start gap-6 md:gap-10 pt-4 border-t border-gray-200 mt-4">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary-500">
                  {banner.stats?.customers?.count || "10K+"}
                </div>
                <div className="text-xs md:text-sm text-gray-500">
                  {banner.stats?.customers?.label || "Happy Customers"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary-500">
                  {banner.stats?.products?.count || "5K+"}
                </div>
                <div className="text-xs md:text-sm text-gray-500">
                  {banner.stats?.products?.label || "Products"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-primary-500">
                  {banner.stats?.satisfaction?.count || "99%"}
                </div>
                <div className="text-xs md:text-sm text-gray-500">
                  {banner.stats?.satisfaction?.label || "Satisfaction"}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="flex-shrink-0">
            {loading ? (
              <div className="w-[280px] h-[200px] md:w-[350px] md:h-[250px] lg:w-[400px] lg:h-[280px] bg-blue-100 rounded-xl flex items-center justify-center shadow-inner">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : banner.displayMode === "sliding" &&
              banner.images &&
              banner.images.length > 0 ? (
              <div className="w-[280px] h-[200px] md:w-[350px] md:h-[250px] lg:w-[400px] lg:h-[280px] rounded-xl overflow-hidden shadow-xl">
                <SlidingBanner banner={banner} />
              </div>
            ) : (
              <div className="relative w-[280px] h-[200px] md:w-[350px] md:h-[250px] lg:w-[400px] lg:h-[280px] rounded-xl overflow-hidden bg-gradient-to-br from-primary-100 to-blue-100 shadow-xl">
                <img
                  src={getImageUrl(banner.image)}
                  alt="Banner"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  key={`banner-image-${banner._imageRefresh || Date.now()}`}
                  onError={(e) => {
                    e.target.src =
                      "https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg";
                  }}
                />
                {/* Overlay Badge */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4 md:p-5">
                  <span className="text-white text-base md:text-lg font-bold">
                    Coming Soon
                  </span>
                  <span className="text-white/80 text-xs md:text-sm">
                    Site under Construction
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
