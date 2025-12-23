import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { AiOutlineClose } from "react-icons/ai";
import { BsPlayFill, BsPauseFill } from "react-icons/bs";

const FloatingVideoWidget = () => {
  const [videoBanners, setVideoBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);

  const videoRef = useRef(null);
  const navigate = useNavigate();

  // Clear the closed state on page reload so widget always shows on refresh
  useEffect(() => {
    localStorage.removeItem("videoWidgetClosed");
  }, []);

  // Enable autoplay after first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      setUserInteracted(true);
      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.play().catch((err) => {
          console.log("Play after interaction failed:", err);
        });
      }
    };

    // Listen for any user interaction
    const events = ["click", "touchstart", "keydown"];
    events.forEach((event) => {
      document.addEventListener(event, handleFirstInteraction, { once: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleFirstInteraction);
      });
    };
  }, []);

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
        } else {
          setIsVisible(false); // Hide if no videos
        }
      } catch (err) {
        console.error("Error fetching video banners:", err);
        setIsVisible(false);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoBanners();

    // Add function to window for testing - to reset the closed state
    window.resetVideoWidget = () => {
      localStorage.removeItem("videoWidgetClosed");
      setIsVisible(true);
      console.log("Video widget reset - reload page to see it again");
    };
  }, []);

  // Auto-play and track view when video loads
  useEffect(() => {
    if (videoBanners.length > 0 && videoRef.current && isVisible) {
      const currentBanner = videoBanners[currentIndex];
      trackVideoView(currentBanner._id);

      // Ensure video is muted for autoplay compliance
      const video = videoRef.current;
      video.muted = true;
      video.autoplay = true;

      // Try multiple autoplay strategies
      const attemptAutoplay = async () => {
        try {
          // Force load the video first
          video.load();

          // Wait a bit for the video to be ready
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Attempt to play (enhanced for user interaction)
          if (userInteracted) {
            await video.play();
            setIsPlaying(true);
            console.log("Video autoplay successful after user interaction");
          } else {
            await video.play();
            setIsPlaying(true);
            console.log("Video autoplay successful");
          }
        } catch (err) {
          console.log("Auto-play prevented by browser:", err);
          setIsPlaying(false);

          // If autoplay fails, we can show a play button or use poster
          video.setAttribute("controls", "false");
        }
      };

      attemptAutoplay();
    }
  }, [currentIndex, videoBanners, isVisible, userInteracted]);

  // Auto-advance to next video
  useEffect(() => {
    if (videoBanners.length > 1 && isVisible) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % videoBanners.length);
      }, 20000); // Change video every 20 seconds

      return () => clearInterval(interval);
    }
  }, [videoBanners.length, isVisible]);

  // Intersection Observer for better autoplay compliance
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && isVisible) {
            // Video is visible, try to play
            video.muted = true;
            video.play().catch((err) => {
              console.log("Intersection play failed:", err);
            });
          } else {
            // Video is not visible, pause to save resources
            video.pause();
          }
        });
      },
      { threshold: 0.5 } // Play when 50% visible
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [isVisible, currentIndex]);

  const trackVideoView = async (bannerId) => {
    try {
      await axios.post(`${server}/video-banner/record-view/${bannerId}`);
      console.log("View tracked successfully");
    } catch (err) {
      console.error("Error tracking view:", err);
    }
  };

  const handleVideoClick = async () => {
    if (videoBanners.length === 0) return;

    const currentBanner = videoBanners[currentIndex];

    try {
      // Track click (use the correct endpoint)
      await axios.post(
        `${server}/video-banner/record-click/${currentBanner._id}`
      );
      console.log("Click tracked successfully");
    } catch (err) {
      console.error("Error tracking click:", err);
    }

    // Always redirect to product page, even if tracking fails
    try {
      navigate(`/product/${currentBanner.productId._id}`);
      setIsVisible(false); // Hide widget after click
      toast.success("Redirecting to product...");
    } catch (redirectErr) {
      console.error("Error redirecting:", redirectErr);
      toast.error("Failed to redirect to product");
    }
  };

  const togglePlayPause = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((err) => {
          console.log("Play failed:", err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const closeWidget = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Close widget clicked"); // Debug log
    setIsVisible(false);
    // Store in localStorage to remember user preference
    localStorage.setItem("videoWidgetClosed", "true");
  };

  const minimizeWidget = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Minimize widget clicked"); // Debug log
    setIsMinimized(!isMinimized);
  };

  // Don't render if loading, no videos, or hidden
  if (loading || !isVisible || videoBanners.length === 0) {
    return null;
  }

  const currentBanner = videoBanners[currentIndex];

  return (
    <div
      className={`fixed z-50 bg-black rounded-lg shadow-2xl overflow-hidden transition-all duration-300 cursor-pointer group ${
        isMinimized
          ? "bottom-2 right-2 w-16 h-12 sm:bottom-4 sm:right-4 sm:w-20 sm:h-16"
          : "bottom-2 right-2 left-2 h-40 sm:bottom-4 sm:right-4 sm:left-auto sm:w-72 sm:h-48 md:w-80 md:h-52 lg:w-96 lg:h-60"
      }`}
      onClick={handleVideoClick}
    >
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={currentBanner.videoUrl}
        poster={currentBanner.thumbnailUrl}
        autoPlay
        loop
        playsInline
        muted
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => console.error("Video playback error")}
        onLoadedData={() => {
          // Try to play when data is loaded
          if (videoRef.current) {
            videoRef.current.play().catch((err) => {
              console.log("Autoplay failed on load:", err);
            });
          }
        }}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

      {/* Top controls */}
      <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex gap-1 z-50">
        {!isMinimized && (
          <button
            onClick={minimizeWidget}
            className="bg-black/50 backdrop-blur-sm text-white p-1 sm:p-1.5 rounded-full hover:bg-black/70 transition-colors text-xs z-50"
            title="Minimize"
          >
            −
          </button>
        )}
        <button
          onClick={closeWidget}
          className="bg-red-500/80 backdrop-blur-sm text-white p-1 sm:p-1.5 rounded-full hover:bg-red-600/90 transition-colors z-50 cursor-pointer"
          title="Close"
          type="button"
        >
          <AiOutlineClose size={10} className="sm:w-3 sm:h-3" />
        </button>
      </div>

      {/* Play/Pause button - center */}
      {!isMinimized && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={togglePlayPause}
            className="bg-black/40 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-black/60 transition-colors"
          >
            {isPlaying ? (
              <BsPauseFill size={20} className="sm:w-6 sm:h-6" />
            ) : (
              <BsPlayFill size={20} className="sm:w-6 sm:h-6" />
            )}
          </button>
        </div>
      )}

      {/* Product info overlay */}
      {!isMinimized && (
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 text-white">
          <div className="space-y-1">
            <h3 className="text-xs sm:text-sm font-bold drop-shadow-lg line-clamp-1">
              {currentBanner.title}
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs bg-green-600/80 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 rounded">
                  ₹{currentBanner.productId.discountPrice}
                </span>
                {currentBanner.productId.originalPrice >
                  currentBanner.productId.discountPrice && (
                  <span className="text-xs text-gray-300 line-through">
                    ₹{currentBanner.productId.originalPrice}
                  </span>
                )}
              </div>

              <div className="text-xs bg-blue-600/80 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 rounded">
                <span className="hidden sm:inline">Tap to shop →</span>
                <span className="sm:hidden">Shop →</span>
              </div>
            </div>

            <p className="text-xs opacity-90 line-clamp-1 hidden sm:block">
              {currentBanner.productId.name}
            </p>
          </div>
        </div>
      )}

      {/* Live/Promoted indicator */}
      <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
        <div className="bg-red-600/90 text-white px-1 py-0.5 sm:px-1.5 rounded text-xs font-bold flex items-center gap-1">
          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-300 rounded-full animate-pulse"></div>
          {isMinimized ? "AD" : "PROMOTED"}
        </div>
      </div>

      {/* Video indicators for multiple videos */}
      {!isMinimized && videoBanners.length > 1 && (
        <div className="absolute bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2 flex gap-1">
          {videoBanners.map((_, index) => (
            <div
              key={index}
              className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* Expand button when minimized */}
      {isMinimized && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={minimizeWidget}
            className="text-white text-xs font-bold"
          >
            📺
          </button>
        </div>
      )}

      {/* Mobile touch indicator */}
      <div className="absolute bottom-1 right-1 md:hidden">
        <div className="text-white text-xs opacity-75">👆</div>
      </div>
    </div>
  );
};

export default FloatingVideoWidget;
