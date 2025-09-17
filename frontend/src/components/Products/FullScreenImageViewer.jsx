import React, { useState, useEffect, useCallback } from "react";
import {
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineZoomIn,
  HiOutlineZoomOut,
  HiOutlineHome,
  HiOutlinePlay,
  HiOutlinePause,
  HiOutlineVolumeUp,
  HiOutlineVolumeOff,
} from "react-icons/hi";

const FullScreenMediaViewer = ({
  media,
  currentIndex,
  isOpen,
  onClose,
  productName,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(currentIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  // Helper function to determine if media item is a video
  const isVideo = (url) => {
    return /\.(mp4|webm|ogg)$/i.test(url);
  };

  // Get current media item
  const currentMedia = media[selectedIndex];

  useEffect(() => {
    setSelectedIndex(currentIndex);
    setIsZoomed(false);
    setImagePosition({ x: 0, y: 0 });
    setMediaLoaded(false);
    setIsVideoPlaying(false);
  }, [currentIndex, isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1);
            resetMediaView();
          }
          break;
        case "ArrowRight":
          if (selectedIndex < media.length - 1) {
            setSelectedIndex(selectedIndex + 1);
            resetMediaView();
          }
          break;
        case "+":
        case "=":
          if (!isVideo(currentMedia)) {
            setIsZoomed(true);
          }
          break;
        case "-":
          setIsZoomed(false);
          setImagePosition({ x: 0, y: 0 });
          break;
        default:
          break;
      }
    },
    [isOpen, selectedIndex, media.length, currentMedia, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      resetMediaView();
    }
  };

  const handleNext = () => {
    if (selectedIndex < media.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      resetMediaView();
    }
  };

  const handleZoomIn = () => {
    if (!isVideo(currentMedia)) {
      setIsZoomed(true);
    }
  };

  const handleZoomOut = () => {
    setIsZoomed(false);
    setImagePosition({ x: 0, y: 0 });
  };

  const resetMediaView = () => {
    setIsZoomed(false);
    setImagePosition({ x: 0, y: 0 });
    setMediaLoaded(false);
    setIsVideoPlaying(false);
  };

  const handleVideoPlay = () => {
    const videoElement = document.getElementById("fullscreen-video");
    if (videoElement) {
      if (isVideoPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const handleVideoMute = () => {
    const videoElement = document.getElementById("fullscreen-video");
    if (videoElement) {
      videoElement.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const handleMouseDown = (e) => {
    if (!isZoomed) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !isZoomed) return;
    setImagePosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleImageClick = (e) => {
    if (!isVideo(currentMedia)) {
      if (isZoomed) {
        handleZoomOut();
      } else {
        handleZoomIn();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-95 flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between p-4 text-white">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold truncate max-w-md">
              {productName}
            </h2>
            <span className="text-sm text-gray-300">
              {selectedIndex + 1} of {media.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
          >
            <HiOutlineX className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Media Container */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-pointer"
        onMouseDown={!isVideo(currentMedia) ? handleMouseDown : undefined}
        onMouseMove={!isVideo(currentMedia) ? handleMouseMove : undefined}
        onMouseUp={!isVideo(currentMedia) ? handleMouseUp : undefined}
        onMouseLeave={!isVideo(currentMedia) ? handleMouseUp : undefined}
      >
        {!mediaLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        {isVideo(currentMedia) ? (
          <video
            id="fullscreen-video"
            src={`${
              process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"
            }${currentMedia}`}
            className="max-w-full max-h-full object-contain"
            controls
            muted={isVideoMuted}
            onLoadedData={() => setMediaLoaded(true)}
            onPlay={() => setIsVideoPlaying(true)}
            onPause={() => setIsVideoPlaying(false)}
          />
        ) : (
          <img
            src={`${
              process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"
            }${currentMedia}`}
            alt={`${productName} ${selectedIndex + 1}`}
            className={`max-w-full max-h-full object-contain transition-all duration-300 ${
              isZoomed ? "scale-150 cursor-move" : "cursor-zoom-in"
            } ${isDragging ? "cursor-grabbing" : ""}`}
            style={{
              transform: isZoomed
                ? `scale(1.5) translate(${imagePosition.x * 0.67}px, ${
                    imagePosition.y * 0.67
                  }px)`
                : "scale(1)",
              userSelect: "none",
            }}
            onClick={handleImageClick}
            onLoad={() => setMediaLoaded(true)}
            draggable={false}
          />
        )}
      </div>

      {/* Navigation Controls */}
      {media.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={selectedIndex === 0}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full transition-all duration-200 ${
              selectedIndex === 0
                ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                : "bg-black/50 text-white hover:bg-black/70 hover:scale-110"
            }`}
          >
            <HiOutlineChevronLeft className="h-6 w-6" />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={selectedIndex === media.length - 1}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full transition-all duration-200 ${
              selectedIndex === media.length - 1
                ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                : "bg-black/50 text-white hover:bg-black/70 hover:scale-110"
            }`}
          >
            <HiOutlineChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between p-4">
          {/* Thumbnail Navigation */}
          <div className="flex items-center space-x-2 overflow-x-auto max-w-md">
            {media.map((mediaItem, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedIndex(index);
                  resetMediaView();
                }}
                className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 relative ${
                  selectedIndex === index
                    ? "border-blue-400 ring-2 ring-blue-400/50"
                    : "border-gray-400 hover:border-gray-300"
                }`}
              >
                {isVideo(mediaItem) ? (
                  <>
                    <video
                      src={`${
                        process.env.REACT_APP_BACKEND_URL ||
                        "http://localhost:8000"
                      }${mediaItem}`}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <HiOutlinePlay className="h-4 w-4 text-white" />
                    </div>
                  </>
                ) : (
                  <img
                    src={`${
                      process.env.REACT_APP_BACKEND_URL ||
                      "http://localhost:8000"
                    }${mediaItem}`}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Zoom and Video Controls */}
          <div className="flex items-center space-x-2">
            {isVideo(currentMedia) ? (
              <>
                <button
                  onClick={handleVideoPlay}
                  className="p-2 text-white hover:bg-white/10 rounded-full transition-colors duration-200"
                >
                  {isVideoPlaying ? (
                    <HiOutlinePause className="h-5 w-5" />
                  ) : (
                    <HiOutlinePlay className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={handleVideoMute}
                  className="p-2 text-white hover:bg-white/10 rounded-full transition-colors duration-200"
                >
                  {isVideoMuted ? (
                    <HiOutlineVolumeOff className="h-5 w-5" />
                  ) : (
                    <HiOutlineVolumeUp className="h-5 w-5" />
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleZoomOut}
                  disabled={!isZoomed}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    !isZoomed
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <HiOutlineZoomOut className="h-5 w-5" />
                </button>
                <button
                  onClick={handleZoomIn}
                  disabled={isZoomed}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    isZoomed
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <HiOutlineZoomIn className="h-5 w-5" />
                </button>
              </>
            )}
            <button
              onClick={resetMediaView}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors duration-200"
            >
              <HiOutlineHome className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="absolute top-20 right-4 text-white text-sm bg-black/50 rounded-lg p-3 space-y-1">
        {isVideo(currentMedia) ? (
          <>
            <div>Use built-in video controls</div>
            <div>Use arrow keys to navigate</div>
            <div>Press ESC to close</div>
          </>
        ) : (
          <>
            <div>Click image to zoom</div>
            <div>Use arrow keys to navigate</div>
            <div>Press ESC to close</div>
            <div>Drag to pan when zoomed</div>
          </>
        )}
      </div>
    </div>
  );
};

export default FullScreenMediaViewer;
