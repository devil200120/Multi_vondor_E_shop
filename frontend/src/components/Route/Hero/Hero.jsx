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
    <div className="relative w-full bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm border border-blue-200 border-t-4 border-t-red-500 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-5">
          {/* Left Content */}
          <div className="flex-1 space-y-3">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
              {banner.title}
              <span className="block text-primary-500 mt-1">
                {banner.subtitle}
              </span>
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
              {banner.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <Link to="/products">
                <button className="px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors text-sm">
                  {banner.buttonText || "Shop Now"}
                </button>
              </Link>
              <Link to="/best-selling">
                <button className="px-4 py-2 border-2 border-primary-500 text-primary-500 font-semibold rounded-lg hover:bg-primary-50 transition-colors text-sm">
                  {banner.secondaryButtonText || "View Collections"}
                </button>
              </Link>
            </div>
          </div>

          {/* Right Content - Hero Image (Fixed aspect ratio) */}
          <div className="hidden sm:block flex-shrink-0">
            {loading ? (
              <div className="w-[200px] h-[120px] bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
              </div>
            ) : banner.displayMode === "sliding" &&
              banner.images &&
              banner.images.length > 0 ? (
              <div className="w-[200px] h-[120px] rounded-lg overflow-hidden">
                <SlidingBanner banner={banner} />
              </div>
            ) : (
              <div className="relative w-[200px] h-[120px] rounded-lg overflow-hidden bg-gradient-to-br from-primary-100 to-blue-100">
                <img
                  src={getImageUrl(banner.image)}
                  alt="Banner"
                  className="w-full h-full object-cover"
                  key={`banner-image-${banner._imageRefresh || Date.now()}`}
                  onError={(e) => {
                    e.target.src =
                      "https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg";
                  }}
                />
                {/* Overlay Badge */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
                  <span className="text-white text-sm font-bold">
                    Coming Soon
                  </span>
                  <span className="text-white/80 text-xs">
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
