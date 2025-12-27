import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { server, backend_url } from "../../server";
import { HiSpeakerphone } from "react-icons/hi";
import {
  BsPlayFill,
  BsPauseFill,
  BsVolumeUp,
  BsVolumeMute,
} from "react-icons/bs";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

/**
 * AdBanners Component
 * Displays advertisements based on position
 * Now supports video banners for header position
 *
 * Positions:
 * - header: 728x120 (Header Banner) - Shows video banners if available
 * - sidebar-header: 220x120 (Sidebar Header)
 * - sidebar-top: 300x200 (Sidebar Top)
 * - sidebar-middle: 300x200 (Sidebar Middle)
 * - sidebar-bottom: 300x200 (Sidebar Bottom)
 */

const AdBanners = ({ position = "header" }) => {
  const [banners, setBanners] = useState([]);
  const [videoBanners, setVideoBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [mutedStates, setMutedStates] = useState({});

  const scrollContainerRef = useRef(null);
  const videoRefs = useRef([]);
  const navigate = useNavigate();

  // Banner dimensions based on position
  const dimensions = {
    header: { width: 728, height: 120, className: "w-full h-[120px]" },
    "sidebar-header": {
      width: 220,
      height: 120,
      className: "w-full h-[120px]",
    },
    "sidebar-top": { width: 300, height: 200, className: "w-full h-[200px]" },
    "sidebar-middle": {
      width: 300,
      height: 200,
      className: "w-full h-[200px]",
    },
    "sidebar-bottom": {
      width: 300,
      height: 200,
      className: "w-full h-[200px]",
    },
  };

  const currentDimension = dimensions[position] || dimensions.header;

  // Fetch video banners for header position
  useEffect(() => {
    const fetchVideoBanners = async () => {
      if (position !== "header") return;

      try {
        const response = await axios.get(
          `${server}/video-banner/active-video-banners`
        );
        if (response.data.success && response.data.videoBanners.length > 0) {
          setVideoBanners(response.data.videoBanners);
          // Initialize muted states
          const initialMutedStates = {};
          response.data.videoBanners.forEach((_, index) => {
            initialMutedStates[index] = true; // Start muted for autoplay
          });
          setMutedStates(initialMutedStates);
        }
      } catch (err) {
        console.error("Error fetching video banners:", err);
      }
    };

    fetchVideoBanners();
  }, [position]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        // Try to fetch banners - adapt to your backend API
        const { data } = await axios.get(`${server}/banner/get-all-banners`);
        if (data.success && data.banners?.length > 0) {
          // Filter by position if your backend supports it, or use all
          const positionBanners = data.banners.filter(
            (b) => b.position === position || !b.position
          );
          setBanners(
            positionBanners.length > 0
              ? positionBanners
              : data.banners.slice(0, 6)
          );
        }
      } catch (error) {
        console.log("Error fetching banners:", error);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [position]);

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // Track video view
  const trackVideoView = async (bannerId) => {
    try {
      await axios.post(`${server}/video-banner/record-view/${bannerId}`);
    } catch (err) {
      console.error("Error tracking view:", err);
    }
  };

  // Handle video click - navigate to product
  const handleVideoClick = async (banner) => {
    try {
      await axios.post(`${server}/video-banner/record-click/${banner._id}`);
      navigate(
        `/product/${banner.productId._id}?fromVideoBanner=${
          banner._id
        }&bannerTitle=${encodeURIComponent(
          banner.title
        )}&bannerVideo=${encodeURIComponent(
          banner.videoUrl
        )}&bannerThumbnail=${encodeURIComponent(banner.thumbnailUrl)}`
      );
    } catch (err) {
      console.error("Error tracking click:", err);
      navigate(`/product/${banner.productId._id}`);
    }
  };

  // Toggle play/pause
  const togglePlayPause = (index, e) => {
    e.stopPropagation();
    const video = videoRefs.current[index];
    if (!video) return;

    if (playingIndex === index) {
      video.pause();
      setPlayingIndex(null);
    } else {
      if (playingIndex !== null && videoRefs.current[playingIndex]) {
        videoRefs.current[playingIndex].pause();
      }
      video.muted = mutedStates[index] || false;
      video
        .play()
        .then(() => {
          setPlayingIndex(index);
          trackVideoView(videoBanners[index]._id);
        })
        .catch((err) => console.log("Play failed:", err));
    }
  };

  // Toggle mute
  const toggleMute = (index, e) => {
    e.stopPropagation();
    const video = videoRefs.current[index];
    if (!video) return;

    const newMutedState = !video.muted;
    video.muted = newMutedState;
    setMutedStates((prev) => ({ ...prev, [index]: newMutedState }));
  };

  // Scroll handlers
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  // Loading State
  if (loading) {
    return (
      <div
        className={`${currentDimension.className} bg-gradient-to-r from-blue-50 to-blue-100 animate-pulse rounded-lg`}
      ></div>
    );
  }

  // For header position - show video banners if available
  if (position === "header" && videoBanners.length > 0) {
    return (
      <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg overflow-hidden border-2 border-red-500">
        {/* Navigation Buttons */}
        {videoBanners.length > 3 && (
          <>
            <button
              onClick={scrollLeft}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/90 shadow-md hover:bg-white transition-colors"
            >
              <IoChevronBack className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={scrollRight}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/90 shadow-md hover:bg-white transition-colors"
            >
              <IoChevronForward className="w-4 h-4 text-gray-700" />
            </button>
          </>
        )}

        {/* Video Banners Horizontal Scroll */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide space-x-2 p-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {videoBanners.map((banner, index) => (
            <div
              key={banner._id}
              className="flex-shrink-0 w-20 h-[100px] sm:w-24 sm:h-[100px] relative bg-black rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => handleVideoClick(banner)}
            >
              {/* Video */}
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                className="w-full h-full object-cover"
                src={banner.videoUrl}
                poster={banner.thumbnailUrl}
                loop
                playsInline
                muted
                autoPlay
                preload="metadata"
                onPlay={() => setPlayingIndex(index)}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* Play/Pause Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => togglePlayPause(index, e)}
                  className="bg-black/50 text-white p-1.5 rounded-full"
                >
                  {playingIndex === index ? (
                    <BsPauseFill className="w-4 h-4" />
                  ) : (
                    <BsPlayFill className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Mute Button */}
              <button
                onClick={(e) => toggleMute(index, e)}
                className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {mutedStates[index] ? (
                  <BsVolumeMute className="w-3 h-3" />
                ) : (
                  <BsVolumeUp className="w-3 h-3" />
                )}
              </button>

              {/* Product Info */}
              <div className="absolute bottom-0 left-0 right-0 p-1.5 text-white">
                <h3 className="text-[10px] font-semibold line-clamp-1">
                  {banner.title}
                </h3>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] bg-green-600/80 px-1 rounded">
                    ₹{banner.productId?.discountPrice}
                  </span>
                </div>
              </div>

              {/* Shop Badge */}
              <div className="absolute top-1 left-1">
                <span className="text-[8px] bg-red-500 text-white px-1 py-0.5 rounded">
                  Shop →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Video Banner Label */}
        <div className="absolute bottom-1 right-2 text-[9px] text-white/70">
          Video Ads • Click to Shop
        </div>

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .line-clamp-1 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
          }
        `}</style>
      </div>
    );
  }

  // Placeholder when no banners
  if (banners.length === 0) {
    return (
      <div
        className={`${currentDimension.className} bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg overflow-hidden relative border-2 border-red-500`}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-3">
          {position === "header" ? (
            <>
              <div className="flex items-center space-x-2 mb-1">
                <HiSpeakerphone className="w-6 h-6" />
                <span className="text-lg font-bold">ADVERTISE HERE</span>
              </div>
              <p className="text-xs text-blue-100 text-center">
                Promote your business to thousands of customers
              </p>
              <Link
                to="/contact"
                className="mt-2 px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-semibold hover:bg-red-600 transition-colors"
              >
                Contact Us
              </Link>
            </>
          ) : (
            <>
              <HiSpeakerphone className="w-8 h-8 mb-1" />
              <span className="text-xs font-bold text-center">AD SPACE</span>
              <span className="text-[10px] text-blue-200 mt-0.5">
                {currentDimension.width}×{currentDimension.height}
              </span>
            </>
          )}
        </div>

        {/* Decorative */}
        <div className="absolute top-2 right-2 w-6 h-6 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 bg-white/10 rounded"></div>
      </div>
    );
  }

  const currentBanner = banners[currentBannerIndex];

  return (
    <div
      className={`${currentDimension.className} relative rounded-lg overflow-hidden shadow-sm group`}
    >
      {/* Banner Image */}
      {currentBanner.link ? (
        <a
          href={currentBanner.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          <img
            src={
              currentBanner.image?.url
                ? currentBanner.image.url.startsWith("http")
                  ? currentBanner.image.url
                  : `${backend_url}${currentBanner.image.url}`
                : currentBanner.image
            }
            alt={currentBanner.title || "Advertisement"}
            className="w-full h-full object-cover"
          />
        </a>
      ) : (
        <img
          src={
            currentBanner.image?.url
              ? currentBanner.image.url.startsWith("http")
                ? currentBanner.image.url
                : `${backend_url}${currentBanner.image.url}`
              : currentBanner.image
          }
          alt={currentBanner.title || "Advertisement"}
          className="w-full h-full object-cover"
        />
      )}

      {/* Banner Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBannerIndex(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentBannerIndex ? "bg-white w-3" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Ad Label */}
      <div className="absolute top-1 left-1 px-1 py-0.5 bg-black/40 text-white text-[8px] font-medium rounded">
        AD
      </div>
    </div>
  );
};

export default AdBanners;
