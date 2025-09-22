import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "../../../styles/styles";
import { server, backend_url } from "../../../server";
import { getBannerImageUrl } from "../../../utils/mediaUtils";

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
    <div className="relative min-h-[70vh] 800px:min-h-[85vh] w-full bg-gradient-to-br from-primary-50 to-secondary-100 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-accent-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-primary-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
      </div>

      <div
        className={`${styles.section} relative z-10 ${styles.centerFlex} min-h-[70vh] 800px:min-h-[85vh]`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-Inter text-text-primary leading-tight">
                {banner.title}
                <span className="block text-primary-500">
                  {banner.subtitle}
                </span>
              </h1>
              <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-lg mx-auto lg:mx-0">
                {banner.description}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/products">
                <button className={`${styles.button} px-8 py-4 text-lg`}>
                  {banner.buttonText || "Shop Now"}
                </button>
              </Link>
              <Link to="/best-selling">
                <button
                  className={`${styles.button_secondary} px-8 py-4 text-lg`}
                >
                  {banner.secondaryButtonText || "View Collections"}
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex justify-center lg:justify-start space-x-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-500">
                  {banner.stats?.customers?.count || "10K+"}
                </div>
                <div className="text-sm text-text-muted">
                  {banner.stats?.customers?.label || "Happy Customers"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-500">
                  {banner.stats?.products?.count || "5K+"}
                </div>
                <div className="text-sm text-text-muted">
                  {banner.stats?.products?.label || "Products"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-500">
                  {banner.stats?.satisfaction?.count || "99%"}
                </div>
                <div className="text-sm text-text-muted">
                  {banner.stats?.satisfaction?.label || "Satisfaction"}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              {loading ? (
                <div className="w-full h-96 bg-gray-200 rounded-2xl flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : (
                <img
                  src={getImageUrl(banner.image)}
                  alt="Home Decoration"
                  className="w-full h-auto rounded-2xl shadow-unacademy-xl hover:shadow-unacademy-xl transition-all duration-300 hover:transform hover:scale-105"
                  key={`banner-image-${banner._imageRefresh || Date.now()}`} // Force re-render when banner updates
                  onError={(e) => {
                    console.log("Image failed to load, trying fallback");
                    e.target.src =
                      "https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg";
                  }}
                  onLoad={() => {
                    console.log("Banner image loaded successfully");
                  }}
                />
              )}
            </div>

            {/* Floating Elements */}
            <div className="absolute top-8 right-8 bg-white p-4 rounded-xl shadow-unacademy hover:shadow-unacademy-md transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <div className="text-lg font-bold text-primary-500">
                  50% OFF
                </div>
                <div className="text-xs text-text-muted">Flash Sale</div>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 bg-white p-4 rounded-xl shadow-unacademy hover:shadow-unacademy-md transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <div className="text-lg font-bold text-primary-500">Free</div>
                <div className="text-xs text-text-muted">Shipping</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg
          className="relative block w-full h-20"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="#ffffff"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
