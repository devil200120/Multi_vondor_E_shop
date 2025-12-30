import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../../server";
import { toast } from "react-toastify";
import {
  BsPlayFill,
  BsPauseFill,
  BsVolumeUp,
  BsVolumeMute,
} from "react-icons/bs";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useCurrency } from "../../../context/CurrencyContext";

const VideoBanners = () => {
  const [videoBanners, setVideoBanners] = useState([]);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [mutedStates, setMutedStates] = useState({}); // Track mute state for each video
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  const scrollContainerRef = useRef(null);
  const videoRefs = useRef([]);
  const navigate = useNavigate();

  // Fetch active video banners
  useEffect(() => {
    const fetchVideoBanners = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${server}/video-banner/active-video-banners`
        );
        if (response.data.success && response.data.videoBanners.length > 0) {
          setVideoBanners(response.data.videoBanners);
        }
      } catch (err) {
        console.error("Error fetching video banners:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoBanners();
  }, []);

  // Auto-play first video when videos are loaded
  useEffect(() => {
    if (videoBanners.length > 0 && videoRefs.current[0]) {
      const firstVideo = videoRefs.current[0];

      // Initialize muted states - first video starts muted for autoplay compliance
      const initialMutedStates = {};
      videoBanners.forEach((_, index) => {
        initialMutedStates[index] = index === 0; // Only first video is muted initially
      });
      setMutedStates(initialMutedStates);

      // Small delay to ensure video is properly loaded
      setTimeout(() => {
        firstVideo.muted = true; // Required for autoplay
        firstVideo
          .play()
          .then(() => {
            setPlayingIndex(0);
            trackVideoView(videoBanners[0]._id);
          })
          .catch((err) => {
            console.log("First video auto-play failed:", err);
          });
      }, 500);
    }
  }, [videoBanners]);

  const trackVideoView = async (bannerId) => {
    try {
      await axios.post(`${server}/video-banner/record-view/${bannerId}`);
    } catch (err) {
      console.error("Error tracking view:", err);
    }
  };

  const handleVideoClick = async (banner) => {
    try {
      await axios.post(`${server}/video-banner/record-click/${banner._id}`);

      // Navigate with banner data for floating display
      navigate(
        `/product/${banner.productId._id}?fromVideoBanner=${
          banner._id
        }&bannerTitle=${encodeURIComponent(
          banner.title
        )}&bannerVideo=${encodeURIComponent(
          banner.videoUrl
        )}&bannerThumbnail=${encodeURIComponent(banner.thumbnailUrl)}`
      );
      toast.success("Redirecting to product...");
    } catch (err) {
      console.error("Error tracking click:", err);
      // Still redirect even if tracking fails
      navigate(
        `/product/${banner.productId._id}?fromVideoBanner=${
          banner._id
        }&bannerTitle=${encodeURIComponent(
          banner.title
        )}&bannerVideo=${encodeURIComponent(
          banner.videoUrl
        )}&bannerThumbnail=${encodeURIComponent(banner.thumbnailUrl)}`
      );
    }
  };

  const togglePlayPause = (index, e) => {
    e.stopPropagation();
    const video = videoRefs.current[index];
    if (!video) return;

    if (playingIndex === index) {
      video.pause();
      setPlayingIndex(null);
    } else {
      // Pause any currently playing video
      if (playingIndex !== null && videoRefs.current[playingIndex]) {
        videoRefs.current[playingIndex].pause();
      }

      // Use the stored muted state for this video
      video.muted = mutedStates[index] || false;
      video
        .play()
        .then(() => {
          setPlayingIndex(index);
          trackVideoView(videoBanners[index]._id);
        })
        .catch((err) => {
          console.log("Play failed:", err);
        });
    }
  };

  // Toggle mute/unmute for a specific video
  const toggleMute = (index, e) => {
    e.stopPropagation();
    const video = videoRefs.current[index];
    if (!video) return;

    const newMutedState = !video.muted;
    video.muted = newMutedState;

    setMutedStates((prev) => ({
      ...prev,
      [index]: newMutedState,
    }));
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth < 640 ? 150 : 300; // Smaller scroll on mobile
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth < 640 ? 150 : 300; // Smaller scroll on mobile
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Handle video intersection for autoplay
  useEffect(() => {
    const observers = [];

    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting && playingIndex === index) {
              video.pause();
              setPlayingIndex(null);
            }
          });
        },
        { threshold: 0.3 }
      );

      observer.observe(video);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [videoBanners, playingIndex]);

  // Enhanced mobile touch handling
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let isScrolling = false;
    let scrollTimer = null;

    const handleTouchStart = () => {
      isScrolling = true;
      clearTimeout(scrollTimer);
    };

    const handleTouchEnd = () => {
      scrollTimer = setTimeout(() => {
        isScrolling = false;
      }, 150);
    };

    const handleScroll = () => {
      if (!isScrolling) return;

      // Pause all videos when scrolling
      if (playingIndex !== null && videoRefs.current[playingIndex]) {
        videoRefs.current[playingIndex].pause();
        setPlayingIndex(null);
      }
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimer);
    };
  }, [playingIndex]);
  if (loading || videoBanners.length === 0) {
    return null;
  }

  return (
    <section className="py-4 sm:py-6 bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Video Banners
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Discover trending products
            </p>
          </div>

          {/* Navigation Buttons - Mobile & Desktop */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={scrollLeft}
              className="p-1.5 sm:p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow border border-gray-200 touch-manipulation"
            >
              <IoChevronBack className="w-3 h-3 sm:w-4 sm:h-4 xl:w-5 xl:h-5 text-gray-600" />
            </button>
            <button
              onClick={scrollRight}
              className="p-1.5 sm:p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow border border-gray-200 touch-manipulation"
            >
              <IoChevronForward className="w-3 h-3 sm:w-4 sm:h-4 xl:w-5 xl:h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Video Banners Container */}
        <div className="relative">
          {/* Mobile Scroll Hint */}
          <div className="lg:hidden text-center mb-2">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <span>Swipe to explore</span>
              <IoChevronForward className="w-3 h-3" />
            </p>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide space-x-2 sm:space-x-3 md:space-x-4 pb-2 snap-x snap-mandatory touch-pan-x"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitScrollbar: { display: "none" },
            }}
          >
            {videoBanners.map((banner, index) => (
              <div
                key={banner._id}
                className="flex-shrink-0 w-28 h-40 xs:w-32 xs:h-44 sm:w-36 sm:h-48 md:w-40 md:h-56 lg:w-48 lg:h-64 relative bg-black rounded-lg sm:rounded-xl overflow-hidden shadow-lg cursor-pointer group snap-start"
                onClick={() => handleVideoClick(banner)}
              >
                {/* Video */}
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  className="w-full h-full object-cover"
                  src={banner.videoUrl}
                  poster={banner.thumbnailUrl}
                  autoPlay
                  loop
                  playsInline
                  preload="auto"
                  onPlay={() => setPlayingIndex(index)}
                  onPause={() => setPlayingIndex(null)}
                  onLoadedData={() => {
                    // Auto-play when video data is loaded
                    const video = videoRefs.current[index];
                    if (video && playingIndex !== index) {
                      // Use stored muted state or default to unmuted (except first video)
                      video.muted =
                        mutedStates[index] !== undefined
                          ? mutedStates[index]
                          : index === 0;
                      video
                        .play()
                        .then(() => {
                          setPlayingIndex(index);
                          trackVideoView(videoBanners[index]._id);
                        })
                        .catch((err) => {
                          console.log("Auto-play failed:", err);
                        });
                    }
                  }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

                {/* Play/Pause Button - Only show when paused or on hover */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Play button - show when video is paused */}
                  {playingIndex !== index && (
                    <button
                      onClick={(e) => togglePlayPause(index, e)}
                      className="bg-black/50 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-black/70 transition-colors touch-manipulation"
                    >
                      <BsPlayFill className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  )}

                  {/* Pause button - show when playing and on hover/touch */}
                  {playingIndex === index && (
                    <button
                      onClick={(e) => togglePlayPause(index, e)}
                      className="bg-black/50 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100 active:opacity-100 touch-manipulation"
                    >
                      <BsPauseFill className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  )}
                </div>

                {/* Mute/Unmute Button - Top right corner */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => toggleMute(index, e)}
                    className="bg-black/50 backdrop-blur-sm text-white p-1.5 sm:p-2 rounded-full hover:bg-black/70 transition-colors touch-manipulation"
                    title={mutedStates[index] ? "Unmute" : "Mute"}
                  >
                    {mutedStates[index] ? (
                      <BsVolumeMute className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <BsVolumeUp className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </button>
                </div>

                {/* Live/Promoted Badge */}

                {/* Product Info */}
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 text-white">
                  <h3 className="text-xs sm:text-sm font-bold drop-shadow-lg line-clamp-2 mb-1">
                    {banner.title}
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-xs sm:text-sm bg-green-600/80 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                        {formatPrice(banner.productId.discountPrice)}
                      </span>
                      {banner.productId.originalPrice >
                        banner.productId.discountPrice && (
                        <span className="text-xs text-gray-300 line-through">
                          {formatPrice(banner.productId.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs opacity-90 line-clamp-1 mt-1 hidden sm:block">
                    {banner.productId.name}
                  </p>
                </div>

                {/* Progress Indicator */}
                {playingIndex === index && (
                  <div className="absolute top-1 left-2 right-2">
                    <div className="w-full bg-white/30 rounded-full h-1">
                      <div className="bg-white h-1 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                )}

                {/* Tap to Shop Indicator */}
                <div className="absolute bottom-2 right-2">
                  <div className="text-white text-xs bg-blue-600/80 backdrop-blur-sm px-2 py-1 rounded">
                    Shop →
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Navigation Dots */}
          <div className="flex justify-center mt-4 md:hidden">
            <div className="flex space-x-2">
              {videoBanners.slice(0, 5).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    playingIndex === index ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </section>
  );
};

export default VideoBanners;
