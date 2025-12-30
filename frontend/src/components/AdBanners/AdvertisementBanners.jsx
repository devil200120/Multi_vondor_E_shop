import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { HiSpeakerphone } from "react-icons/hi";
import { AiOutlineEye } from "react-icons/ai";

/**
 * AdvertisementBanners Component
 * Displays advertisements with 10-second rotation based on ad type
 *
 * Ad Types:
 * - leaderboard: 728x120 (Header position)
 * - top_sidebar: 200x120
 * - right_sidebar_top: 300x200
 * - right_sidebar_middle: 300x200
 * - right_sidebar_bottom: 300x200
 */

const AdvertisementBanners = ({ adType = "leaderboard" }) => {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(true);
  const navigate = useNavigate();
  const viewTrackedRef = useRef(new Set());

  // Ad dimensions based on type - Now mobile responsive
  const adDimensions = {
    leaderboard: {
      width: "728px",
      height: "120px",
      className: "w-full max-w-[728px] h-[80px] sm:h-[100px] md:h-[120px]",
    },
    top_sidebar: {
      width: "200px",
      height: "120px",
      className:
        "w-[160px] sm:w-[180px] md:w-[200px] h-[100px] sm:h-[110px] md:h-[120px]",
    },
    right_sidebar_top: {
      width: "300px",
      height: "200px",
      className:
        "w-[240px] sm:w-[270px] md:w-[300px] h-[160px] sm:h-[180px] md:h-[200px]",
    },
    right_sidebar_middle: {
      width: "300px",
      height: "200px",
      className:
        "w-[240px] sm:w-[270px] md:w-[300px] h-[160px] sm:h-[180px] md:h-[200px]",
    },
    right_sidebar_bottom: {
      width: "300px",
      height: "200px",
      className:
        "w-[240px] sm:w-[270px] md:w-[300px] h-[160px] sm:h-[180px] md:h-[200px]",
    },
  };

  const currentDimension = adDimensions[adType] || adDimensions.leaderboard;

  // Fetch active ads for this type
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${server}/advertisement/active/${adType}`
        );

        if (data.success && data.advertisements?.length > 0) {
          setAds(data.advertisements);
          // Track view for first ad
          if (
            data.advertisements[0]?._id &&
            !viewTrackedRef.current.has(data.advertisements[0]._id)
          ) {
            trackView(data.advertisements[0]._id);
            viewTrackedRef.current.add(data.advertisements[0]._id);
          }
        } else {
          setAds([]);
        }
      } catch (error) {
        console.error("Error fetching advertisements:", error);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();

    // Refresh ads every 5 minutes
    const refreshInterval = setInterval(fetchAds, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [adType]);

  // Auto-rotate ads every 10 seconds
  useEffect(() => {
    if (ads.length <= 1) return;

    const rotationInterval = setInterval(() => {
      // Fade out effect
      setFadeIn(false);

      setTimeout(() => {
        setCurrentAdIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % ads.length;

          // Track view for new ad
          const nextAd = ads[nextIndex];
          if (nextAd?._id && !viewTrackedRef.current.has(nextAd._id)) {
            trackView(nextAd._id);
            viewTrackedRef.current.add(nextAd._id);
          }

          return nextIndex;
        });

        // Fade in effect
        setFadeIn(true);
      }, 300);
    }, 10000); // 10 seconds

    return () => clearInterval(rotationInterval);
  }, [ads]);

  // Track ad view
  const trackView = async (adId) => {
    try {
      await axios.post(`${server}/advertisement/track-view/${adId}`);
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  // Track ad click
  const trackClick = async (adId) => {
    try {
      await axios.post(`${server}/advertisement/track-click/${adId}`);
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };

  // Handle ad click
  const handleAdClick = async (ad) => {
    await trackClick(ad._id);

    // Navigate to the link (vendor store)
    if (ad.linkUrl) {
      if (ad.linkUrl.startsWith("http")) {
        window.open(ad.linkUrl, "_blank");
      } else {
        navigate(ad.linkUrl);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div
        className={`${currentDimension.className} bg-gradient-to-r from-blue-50 to-blue-100 animate-pulse rounded-lg`}
      ></div>
    );
  }

  // No ads available - show placeholder
  if (ads.length === 0) {
    return (
      <div
        className={`${currentDimension.className} bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg overflow-hidden relative border-2 border-primary-300 shadow-sm`}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-3">
          {adType === "leaderboard" ? (
            <>
              <div className="flex items-center space-x-2 mb-1">
                <HiSpeakerphone className="w-6 h-6" />
                <span className="text-lg font-bold">ADVERTISE HERE</span>
              </div>
              <p className="text-xs text-blue-100 text-center">
                Promote your store to thousands of customers
              </p>
              <button
                onClick={() =>
                  navigate(`/dashboard-create-advertisement?type=${adType}`)
                }
                className="mt-2 px-3 py-1.5 bg-accent-500 text-white rounded-full text-xs font-semibold hover:bg-accent-600 transition-colors"
              >
                Start Advertising
              </button>
            </>
          ) : (
            <>
              <HiSpeakerphone className="w-8 h-8 mb-1" />
              <span className="text-xs font-bold text-center">AD SPACE</span>
              <span className="text-[10px] text-blue-200 mt-0.5">
                {currentDimension.width} × {currentDimension.height}
              </span>
              <button
                onClick={() =>
                  navigate(`/dashboard-create-advertisement?type=${adType}`)
                }
                className="mt-2 px-2 py-1 bg-white/20 text-white rounded text-[10px] font-semibold hover:bg-white/30 transition-colors"
              >
                Advertise
              </button>
            </>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute top-2 right-2 w-6 h-6 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 bg-white/10 rounded"></div>
      </div>
    );
  }

  const currentAd = ads[currentAdIndex];

  // Check if current ad is a video
  const isVideoAd = currentAd?.mediaType === "video" && currentAd?.video?.url;

  return (
    <div
      className={`${currentDimension.className} relative rounded-lg overflow-hidden shadow-md group cursor-pointer bg-gray-100`}
    >
      {/* Ad Media (Image or Video) with fade transition */}
      <div
        onClick={() => handleAdClick(currentAd)}
        className={`w-full h-full transition-opacity duration-300 ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
      >
        {isVideoAd ? (
          <video
            src={currentAd.video.url}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={currentAd.image?.url || "/placeholder-ad.jpg"}
            alt={currentAd.title || "Advertisement"}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
      </div>

      {/* Ad label with video indicator */}
      <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] font-medium rounded flex items-center gap-1">
        <AiOutlineEye className="w-2.5 h-2.5" />
        <span>{isVideoAd ? "VIDEO AD" : "AD"}</span>
      </div>

      {/* Shop name badge */}
      {currentAd.shopId?.name && (
        <div className="absolute top-1 right-1 px-2 py-0.5 bg-primary-500/90 text-white text-[9px] font-semibold rounded-full">
          {currentAd.shopId.name}
        </div>
      )}

      {/* Rotation indicators (dots) */}
      {ads.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1.5">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setFadeIn(false);
                setTimeout(() => {
                  setCurrentAdIndex(index);
                  setFadeIn(true);
                  if (
                    ads[index]?._id &&
                    !viewTrackedRef.current.has(ads[index]._id)
                  ) {
                    trackView(ads[index]._id);
                    viewTrackedRef.current.add(ads[index]._id);
                  }
                }, 300);
              }}
              className={`rounded-full transition-all duration-300 ${
                index === currentAdIndex
                  ? "w-4 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`View ad ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Ad counter */}
      {ads.length > 1 && (
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 text-white text-[8px] font-medium rounded">
          {currentAdIndex + 1}/{ads.length}
        </div>
      )}

      {/* Click instruction on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-primary-500/90 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
          Click to visit store →
        </div>
      </div>
    </div>
  );
};

export default AdvertisementBanners;
