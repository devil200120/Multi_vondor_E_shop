import React, { useState, useRef, useEffect } from "react";
import { BsPlayFill, BsPauseFill, BsX } from "react-icons/bs";
import { IoExpand, IoContract } from "react-icons/io5";

const FloatingVideoBanner = ({
  bannerId,
  bannerTitle,
  videoUrl,
  thumbnailUrl,
  onClose,
  initialPosition = { x: 20, y: 20 },
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isNearEdge, setIsNearEdge] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState(null);
  const [position, setPosition] = useState(initialPosition);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  const [hasDraggedEnough, setHasDraggedEnough] = useState(false);

  const videoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Auto-play video when component mounts
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.log("Auto-play failed:", err);
        });
    }
  }, []);

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

  const togglePlayPause = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.log("Play failed:", err);
        });
    }
  };

  const showControlsTemporary = () => {
    console.log("Showing controls temporarily");
    setShowControls(true);

    // Clear existing timeout
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }

    // Hide controls after 3 seconds
    const timeout = setTimeout(() => {
      console.log("Hiding controls after timeout");
      setShowControls(false);
    }, 3000);

    setControlsTimeout(timeout);
  };

  const handleVideoTouch = (e) => {
    e.preventDefault();
    e.stopPropagation();
    showControlsTemporary();
  };

  const handleVideoClick = (e) => {
    // Only handle click if we're not in the middle of or just finished dragging
    if (!isDragging && !hasDraggedEnough) {
      showControlsTemporary();
    }
  };

  const handleMouseEnter = () => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
      setControlsTimeout(null);
    }
  };

  const handleMouseLeave = () => {
    setShowControls(false);
  };

  const toggleExpand = (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("Toggle expand clicked, current state:", isExpanded);
    setIsExpanded(!isExpanded);
    if (isExpanded) {
      // Reset position when collapsing
      setPosition({ x: 20, y: 20 });
    }
  };

  const toggleMinimize = (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("Toggle minimize clicked, current state:", isMinimized);
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      // Reset position when minimizing
      setPosition({ x: window.innerWidth - 80, y: 20 });
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("Close button clicked");
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onClose();
  };

  // Enhanced drag functionality
  const handleDragStart = (e) => {
    if (isExpanded) return; // Don't allow dragging when expanded

    // Prevent any other event handlers from firing
    e.preventDefault();
    e.stopPropagation();

    const isTouch = e.type === "touchstart";
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    const rect = containerRef.current.getBoundingClientRect();
    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
    setDragStartPosition({ x: clientX, y: clientY });
    setIsDragging(true);
    setHasDraggedEnough(false);

    // Add visual feedback
    if (containerRef.current) {
      containerRef.current.style.transition = "none";
      containerRef.current.style.transform = "scale(1.05)";
      containerRef.current.style.cursor = "grabbing";
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    let animationId;

    const handleDragMove = (e) => {
      e.preventDefault();

      const isTouch = e.type === "touchmove";
      const clientX = isTouch ? e.touches[0].clientX : e.clientX;
      const clientY = isTouch ? e.touches[0].clientY : e.clientY;

      // Check if we've dragged enough to consider this a drag operation
      const dragDistance = Math.sqrt(
        Math.pow(clientX - dragStartPosition.x, 2) +
          Math.pow(clientY - dragStartPosition.y, 2)
      );

      if (dragDistance > 5 && !hasDraggedEnough) {
        setHasDraggedEnough(true);
      }

      const newX = clientX - dragOffset.x;
      const newY = clientY - dragOffset.y;

      // Get current container dimensions
      const containerWidth = isMinimized ? 60 : 280;
      const containerHeight = isMinimized ? 60 : 180;

      // Enhanced boundary constraints with padding
      const padding = 10;
      const maxX = window.innerWidth - containerWidth - padding;
      const maxY = window.innerHeight - containerHeight - padding;

      // Smooth position update with requestAnimationFrame
      cancelAnimationFrame(animationId);
      animationId = requestAnimationFrame(() => {
        const finalX = Math.max(padding, Math.min(newX, maxX));
        const finalY = Math.max(padding, Math.min(newY, maxY));

        setPosition({ x: finalX, y: finalY });

        // Check if near edges for visual feedback
        const snapDistance = 50;
        const nearLeftEdge = finalX < snapDistance;
        const nearRightEdge =
          finalX > window.innerWidth - containerWidth - snapDistance;
        const nearTopEdge = finalY < snapDistance;
        const nearBottomEdge =
          finalY > window.innerHeight - containerHeight - snapDistance;

        setIsNearEdge(
          nearLeftEdge || nearRightEdge || nearTopEdge || nearBottomEdge
        );
      });
    };

    const handleDragEnd = (e) => {
      e.preventDefault();
      const wasDragging = hasDraggedEnough;

      setIsDragging(false);
      setIsNearEdge(false);
      setHasDraggedEnough(false);

      // Restore visual state
      if (containerRef.current) {
        containerRef.current.style.transition = "all 0.3s ease";
        containerRef.current.style.transform = "scale(1)";
        containerRef.current.style.cursor = "grab";
      }

      // Only snap to edges if we actually dragged
      if (wasDragging) {
        const snapDistance = 50;
        const containerWidth = isMinimized ? 60 : 280;
        const containerHeight = isMinimized ? 60 : 180;

        setPosition((prevPos) => {
          let newX = prevPos.x;
          let newY = prevPos.y;

          // Snap to left edge
          if (newX < snapDistance) {
            newX = 10;
          }
          // Snap to right edge
          else if (newX > window.innerWidth - containerWidth - snapDistance) {
            newX = window.innerWidth - containerWidth - 10;
          }

          // Snap to top edge
          if (newY < snapDistance) {
            newY = 10;
          }
          // Snap to bottom edge
          else if (newY > window.innerHeight - containerHeight - snapDistance) {
            newY = window.innerHeight - containerHeight - 10;
          }

          return { x: newX, y: newY };
        });
      }

      // Clean up animation frame
      cancelAnimationFrame(animationId);
    };

    // Event listeners with better performance
    const options = { passive: false };

    document.addEventListener("mousemove", handleDragMove, options);
    document.addEventListener("mouseup", handleDragEnd, options);
    document.addEventListener("touchmove", handleDragMove, options);
    document.addEventListener("touchend", handleDragEnd, options);

    return () => {
      document.removeEventListener("mousemove", handleDragMove, options);
      document.removeEventListener("mouseup", handleDragEnd, options);
      document.removeEventListener("touchmove", handleDragMove, options);
      document.removeEventListener("touchend", handleDragEnd, options);
      cancelAnimationFrame(animationId);
    };
  }, [
    isDragging,
    dragOffset,
    dragStartPosition,
    hasDraggedEnough,
    isMinimized,
  ]);

  // Enhanced styles for different states
  const getContainerStyles = () => {
    const baseTransition = isDragging
      ? "none"
      : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

    if (isExpanded) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(90vw, 800px)",
        height: "min(60vh, 500px)",
        zIndex: 999,
        transition: baseTransition,
      };
    }

    return {
      position: "fixed",
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: isMinimized ? "60px" : "280px",
      height: isMinimized ? "60px" : "180px",
      zIndex: 999,
      transition: baseTransition,
      transform: isDragging ? "scale(1.02)" : "scale(1)",
    };
  };

  if (isMinimized) {
    return (
      <div
        ref={containerRef}
        style={getContainerStyles()}
        className={`bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl cursor-pointer transition-all duration-300 flex items-center justify-center ${
          isDragging
            ? "cursor-grabbing shadow-3xl ring-4 ring-blue-300 ring-opacity-50"
            : "cursor-grab hover:shadow-3xl hover:scale-110"
        }`}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onClick={(e) => {
          e.stopPropagation();
          if (!isDragging) {
            toggleMinimize(e);
          }
        }}
      >
        <div className="w-full h-full flex items-center justify-center text-white">
          <BsPlayFill className="w-6 h-6" />
        </div>

        {/* Drag hint dots */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5 opacity-60">
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop for expanded view */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[998]"
          onClick={toggleExpand}
        />
      )}

      {/* Floating video banner */}
      <div
        ref={containerRef}
        style={getContainerStyles()}
        className={`bg-black rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ${
          isDragging
            ? `cursor-grabbing shadow-3xl ${
                isNearEdge
                  ? "ring-4 ring-green-400 ring-opacity-60"
                  : "ring-2 ring-blue-400 ring-opacity-50"
              }`
            : isExpanded
            ? "shadow-3xl"
            : "cursor-grab hover:shadow-3xl"
        }`}
        // Remove drag handlers from main container since we have dedicated drag handle
      >
        {/* Drag Handle Bar (only visible when not expanded) */}
        {!isExpanded && (
          <div
            className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-center cursor-grab z-20"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="flex space-x-1 opacity-60 hover:opacity-80 transition-opacity">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            <span className="text-white text-xs ml-2 opacity-70">
              Drag to move
            </span>
          </div>
        )}
        {/* Video */}
        <div
          className="relative w-full h-full group"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleVideoClick}
          onTouchStart={handleVideoTouch}
          // Allow dragging from anywhere on the video as fallback, but with lower priority
          onMouseDown={(e) => {
            // Only start drag if not clicking on a button
            if (!e.target.closest("button") && !isExpanded) {
              handleDragStart(e);
            }
          }}
          style={{ cursor: !isExpanded ? "grab" : "default" }}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src={videoUrl}
            poster={thumbnailUrl}
            autoPlay
            loop
            playsInline
            muted
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

          {/* Mobile Touch Indicator - shown when controls are hidden */}
          {!showControls && (
            <div className="absolute bottom-2 left-2 md:hidden">
              <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1 animate-pulse">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                <span>Tap</span>
              </div>
            </div>
          )}

          {/* Controls Overlay */}
          <div
            className={`absolute inset-0 transition-opacity duration-200 ${
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Top Controls */}
            <div className="absolute top-2 right-2 flex space-x-1 z-20 pointer-events-auto">
              {!isExpanded && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleExpand(e);
                  }}
                  className="bg-black/70 hover:bg-black/90 text-white p-2 md:p-1.5 rounded-full transition-all duration-200 transform hover:scale-110 touch-manipulation min-w-[44px] min-h-[44px] md:min-w-[auto] md:min-h-[auto] flex items-center justify-center pointer-events-auto"
                  title="Expand"
                >
                  <IoExpand className="w-4 h-4" />
                </button>
              )}

              {isExpanded && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleExpand(e);
                  }}
                  className="bg-black/70 hover:bg-black/90 text-white p-2 md:p-1.5 rounded-full transition-all duration-200 transform hover:scale-110 touch-manipulation min-w-[44px] min-h-[44px] md:min-w-[auto] md:min-h-[auto] flex items-center justify-center pointer-events-auto"
                  title="Exit Fullscreen"
                >
                  <IoContract className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  toggleMinimize(e);
                }}
                className="bg-black/70 hover:bg-black/90 text-white p-2 md:p-1.5 rounded-full transition-all duration-200 transform hover:scale-110 touch-manipulation min-w-[44px] min-h-[44px] md:min-w-[auto] md:min-h-[auto] flex items-center justify-center pointer-events-auto"
                title="Minimize"
              >
                <span className="w-4 h-4 flex items-center justify-center text-xs font-bold">
                  −
                </span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleClose(e);
                }}
                className="bg-red-500/80 hover:bg-red-600/90 text-white p-2 md:p-1.5 rounded-full transition-all duration-200 transform hover:scale-110 touch-manipulation min-w-[44px] min-h-[44px] md:min-w-[auto] md:min-h-[auto] flex items-center justify-center pointer-events-auto"
                title="Close"
              >
                <BsX className="w-4 h-4" />
              </button>
            </div>

            {/* Center Play/Pause Button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  togglePlayPause(e);
                }}
                className="bg-black/50 hover:bg-black/70 text-white p-4 md:p-3 rounded-full transition-colors touch-manipulation min-w-[56px] min-h-[56px] md:min-w-[auto] md:min-h-[auto] flex items-center justify-center pointer-events-auto"
              >
                {isPlaying ? (
                  <BsPauseFill className="w-6 h-6" />
                ) : (
                  <BsPlayFill className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Banner Info */}
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <h4 className="text-sm font-bold line-clamp-1 drop-shadow">
                {bannerTitle}
              </h4>
              <p className="text-xs opacity-80 mt-1">Video Banner</p>
            </div>
          )}

          {/* Expanded Info */}
          {isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white bg-gradient-to-t from-black/80 to-transparent">
              <h3 className="text-xl font-bold mb-2 drop-shadow">
                {bannerTitle}
              </h3>
              <p className="text-sm opacity-90">
                Featured Product Video Banner
              </p>
            </div>
          )}

          {/* Drag indicator */}
          {!isExpanded && (
            <div className="absolute top-2 left-2 opacity-50">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </>
  );
};

export default FloatingVideoBanner;
