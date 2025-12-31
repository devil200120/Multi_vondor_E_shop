import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { server } from "../../../server";
import { AiOutlineStar, AiOutlineShop } from "react-icons/ai";
import { MdVerified } from "react-icons/md";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

const FeaturedAdvertisedStores = () => {
  const [featuredStores, setFeaturedStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Number of items to show at a time based on screen size
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 640) return 2;
    if (window.innerWidth < 768) return 2;
    if (window.innerWidth < 1024) return 3;
    return 4;
  };
  
  const [itemsPerView, setItemsPerView] = useState(getItemsPerView());
  
  // Update items per view on resize
  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchFeaturedStores();
  }, []);

  const fetchFeaturedStores = async () => {
    try {
      const { data } = await axios.get(
        `${server}/advertisement/active/featured_store`
      );

      if (data.success && data.advertisements?.length > 0) {
        setFeaturedStores(data.advertisements);
      }
    } catch (error) {
      console.error("Error fetching featured stores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStoreClick = async (ad) => {
    // Track click
    try {
      await axios.post(`${server}/advertisement/track-click/${ad._id}`);
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };
  
  // Navigate to next set
  const goToNext = useCallback(() => {
    if (featuredStores.length <= itemsPerView) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => {
      const nextIndex = prev + itemsPerView;
      return nextIndex >= featuredStores.length ? 0 : nextIndex;
    });
    setTimeout(() => setIsTransitioning(false), 500);
  }, [featuredStores.length, itemsPerView]);
  
  // Navigate to previous set
  const goToPrevious = useCallback(() => {
    if (featuredStores.length <= itemsPerView) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => {
      const prevIndex = prev - itemsPerView;
      return prevIndex < 0 ? Math.max(0, featuredStores.length - itemsPerView) : prevIndex;
    });
    setTimeout(() => setIsTransitioning(false), 500);
  }, [featuredStores.length, itemsPerView]);
  
  // Auto-scroll every 10 seconds
  useEffect(() => {
    if (featuredStores.length <= itemsPerView || isPaused) return;
    
    const interval = setInterval(() => {
      goToNext();
    }, 10000); // 10 seconds
    
    return () => clearInterval(interval);
  }, [featuredStores.length, itemsPerView, isPaused, goToNext]);
  
  // Get visible stores
  const visibleStores = featuredStores.slice(currentIndex, currentIndex + itemsPerView);
  // If we don't have enough stores at the end, wrap around
  const displayStores = visibleStores.length < itemsPerView && featuredStores.length > itemsPerView
    ? [...visibleStores, ...featuredStores.slice(0, itemsPerView - visibleStores.length)]
    : visibleStores;

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-gray-200 h-48 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (featuredStores.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm p-5 border-l-4 border-l-accent-500 border border-blue-200 mb-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-accent-500 rounded-lg">
            <AiOutlineShop className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Featured Stores</h2>
            <p className="text-xs text-gray-500">Premium vendor spotlight</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-accent-500 text-white text-xs font-bold rounded-full">
          SPONSORED
        </span>
      </div>

      <div 
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Navigation Arrows */}
        {featuredStores.length > itemsPerView && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors border border-gray-200"
              aria-label="Previous stores"
            >
              <HiChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors border border-gray-200"
              aria-label="Next stores"
            >
              <HiChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}

        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 transition-opacity duration-500 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
          {displayStores.map((ad) => (
          <Link
            key={ad._id}
            to={ad.linkUrl}
            onClick={() => handleStoreClick(ad)}
            className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-accent-500"
          >
            {/* Store Avatar/Logo */}
            <div className="relative h-32 bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              {ad.shopId?.avatar?.url ? (
                <img
                  src={ad.shopId.avatar.url}
                  alt={ad.shopId.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg">
                  <AiOutlineShop className="w-10 h-10 text-primary-500" />
                </div>
              )}

              {/* Featured Badge */}
              <div className="absolute top-2 right-2">
                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded-full shadow-md">
                  <AiOutlineStar className="w-3 h-3" />
                  FEATURED
                </span>
              </div>
            </div>

            {/* Store Info */}
            <div className="p-3">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-accent-600 transition-colors">
                  {ad.shopId?.name || ad.title}
                </h3>
                {ad.shopId?.verified && (
                  <MdVerified className="w-4 h-4 text-blue-500 flex-shrink-0 ml-1" />
                )}
              </div>

              {ad.description && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                  {ad.description}
                </p>
              )}

              {/* Store Stats */}
              {ad.shopId && (
                <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                  {ad.shopId.ratings && (
                    <div className="flex items-center gap-1">
                      <AiOutlineStar className="w-3 h-3 text-yellow-500" />
                      <span className="font-semibold">
                        {ad.shopId.ratings.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {ad.shopId.productsCount && (
                    <span>{ad.shopId.productsCount} products</span>
                  )}
                </div>
              )}

              {/* Visit Button */}
              <button className="w-full py-2 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-xs font-bold rounded-lg group-hover:from-accent-600 group-hover:to-accent-700 transition-all">
                Visit Store →
              </button>
            </div>
          </Link>
        ))}
        </div>
        
        {/* Pagination Dots */}
        {featuredStores.length > itemsPerView && (
          <div className="flex justify-center items-center mt-4 gap-2">
            {Array.from({ length: Math.ceil(featuredStores.length / itemsPerView) }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsTransitioning(true);
                  setCurrentIndex(idx * itemsPerView);
                  setTimeout(() => setIsTransitioning(false), 500);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / itemsPerView) === idx 
                    ? 'bg-accent-500 w-4' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to page ${idx + 1}`}
              />
            ))}
            <span className="ml-2 text-xs text-gray-400">Auto-scrolls every 10s</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedAdvertisedStores;
