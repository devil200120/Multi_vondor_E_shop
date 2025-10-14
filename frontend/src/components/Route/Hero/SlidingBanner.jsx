import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { getBannerImageUrl } from "../../../utils/mediaUtils";
import { backend_url } from "../../../server";

const SlidingBanner = ({ banner }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const images = banner.images || [];
  
  const {
    autoSlideInterval = 7,
    transitionEffect = 'slide'
  } = banner;
  
  const autoSlide = true;
  const slideDuration = (autoSlideInterval || 7) * 1000; // Convert seconds to milliseconds
  const showDots = true;
  const showArrows = true;

  // Auto slide functionality
  useEffect(() => {
    if (!autoSlide || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, slideDuration);

    return () => clearInterval(interval);
  }, [autoSlide, slideDuration, images.length]);

  const handleNextSlide = () => {
    if (isAnimating || images.length <= 1) return;
    
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % images.length);
    
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePrevSlide = () => {
    if (isAnimating || images.length <= 1) return;
    
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
    
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleDotClick = (index) => {
    if (isAnimating || index === currentSlide) return;
    
    setIsAnimating(true);
    setCurrentSlide(index);
    
    setTimeout(() => setIsAnimating(false), 500);
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-2xl flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  const getTransitionClass = () => {
    switch (transitionEffect) {
      case 'slide':
        return 'transform transition-transform duration-500 ease-in-out';
      case 'zoom':
        return 'transform transition-all duration-500 ease-in-out';
      case 'fade':
      default:
        return 'transition-opacity duration-500 ease-in-out';
    }
  };

  return (
    <div className="relative w-full h-auto overflow-hidden rounded-2xl group">
      {/* Images Container */}
      <div className="relative w-full">
        {transitionEffect === 'slide' ? (
          // Slide transition
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {images.map((image, index) => (
              <div key={index} className="w-full flex-shrink-0">
                <img
                  src={getBannerImageUrl(image, backend_url)}
                  alt={image.title || `Slide ${index + 1}`}
                  className="w-full h-auto object-cover"
                  style={{ minHeight: '400px', maxHeight: '600px' }}
                />
                {/* Image overlay text */}
                {(image.title || image.description) && (
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end p-6">
                    <div className="text-white">
                      {image.title && (
                        <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                      )}
                      {image.description && (
                        <p className="text-sm opacity-90">{image.description}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Fade or Zoom transition
          <div className="relative">
            {images.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 ${getTransitionClass()} ${
                  index === currentSlide 
                    ? 'opacity-100 scale-100' 
                    : 'opacity-0 scale-95'
                }`}
                style={{
                  display: index === currentSlide || Math.abs(index - currentSlide) <= 1 ? 'block' : 'none'
                }}
              >
                <img
                  src={getBannerImageUrl(image, backend_url)}
                  alt={image.title || `Slide ${index + 1}`}
                  className="w-full h-auto object-cover rounded-2xl shadow-unacademy-xl"
                  style={{ minHeight: '400px', maxHeight: '600px' }}
                />
                {/* Image overlay text */}
                {(image.title || image.description) && (
                  <div className="absolute inset-0 bg-black bg-opacity-30 rounded-2xl flex items-end p-6">
                    <div className="text-white">
                      {image.title && (
                        <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                      )}
                      {image.description && (
                        <p className="text-sm opacity-90">{image.description}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* Placeholder for sizing */}
            <img
              src={getBannerImageUrl(images[0], backend_url)}
              alt="Sizing placeholder"
              className="w-full h-auto object-cover rounded-2xl opacity-0"
              style={{ minHeight: '400px', maxHeight: '600px' }}
            />
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      {showArrows && images.length > 1 && (
        <>
          <button
            onClick={handlePrevSlide}
            disabled={isAnimating}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
          >
            <FiChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <button
            onClick={handleNextSlide}
            disabled={isAnimating}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
          >
            <FiChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              disabled={isAnimating}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? 'bg-white shadow-lg'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              } disabled:opacity-50`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-medium">
          {currentSlide + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

export default SlidingBanner;