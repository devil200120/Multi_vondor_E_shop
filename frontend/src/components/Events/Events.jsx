import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../server";
import EventCard from "./EventCard";
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiStar,
  HiTrendingUp,
  HiLightningBolt,
  HiFire,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";

const Events = () => {
  const { allEvents, isLoading } = useSelector((state) => state.events);
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sliderRef = useRef(null);
  const autoPlayRef = useRef(null);

  // Auto-play functionality
  useEffect(() => {
    if (allEvents && allEvents.length > 1 && isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % allEvents.length);
      }, 4000); // Auto-slide every 4 seconds like Flipkart
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [allEvents, isAutoPlaying]);

  // Touch/swipe functionality for mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && allEvents) {
      setCurrentSlide((prev) => (prev + 1) % allEvents.length);
    }
    if (isRightSwipe && allEvents) {
      setCurrentSlide(
        (prev) => (prev - 1 + allEvents.length) % allEvents.length
      );
    }
  };

  // Navigation functions
  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10 seconds
  };

  const nextSlide = () => {
    if (allEvents) {
      setCurrentSlide((prev) => (prev + 1) % allEvents.length);
    }
  };

  const prevSlide = () => {
    if (allEvents) {
      setCurrentSlide(
        (prev) => (prev - 1 + allEvents.length) % allEvents.length
      );
    }
  };

  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubscribing(true);

    try {
      const response = await axios.post(`${server}/newsletter/subscribe`, {
        email: email,
      });

      if (response.data.success) {
        setIsSubscribed(true);
        setEmail("");
        toast.success(
          response.data.message ||
            "Successfully subscribed to our newsletter! 🎉"
        );

        // Reset success state after 3 seconds
        setTimeout(() => setIsSubscribed(false), 3000);
      }
    } catch (error) {
      console.error("Subscription error:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to subscribe. Please try again later.");
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-100 border-t-red-600 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <HiFire className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="mt-6 text-lg text-slate-600 font-medium">
              Loading exciting events...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-4 sm:py-6">
      <div className="max-w-4xl sm:max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Modern Header Section */}
        <div className="text-center mb-4 sm:mb-6">
          {/* Badge */}
          <div className="inline-flex items-center mb-3">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-full shadow-md">
              <HiFire className="w-3 h-3 animate-pulse" />
              <span className="text-xs font-bold tracking-wide">
                HOT EVENTS
              </span>
              <HiLightningBolt className="w-3 h-3" />
            </div>
          </div>

          {/* Main Title */}
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-2 leading-tight">
            Popular
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              {" "}
              Events
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Don't miss out on our exclusive events with special discounts and
            limited-time offers.
          </p>

          {/* Stats Row */}
          <div className="flex justify-center items-center space-x-4 mt-4">
            <div className="flex items-center space-x-1 text-slate-700">
              <HiStar className="w-3 h-3 text-yellow-500" />
              <span className="text-xs font-medium">Exclusive Deals</span>
            </div>
            <div className="w-px h-3 bg-slate-300"></div>
            <div className="flex items-center space-x-1 text-slate-700">
              <HiOutlineClock className="w-3 h-3 text-red-500" />
              <span className="text-xs font-medium">Limited Time</span>
            </div>
            <div className="w-px h-3 bg-slate-300"></div>
            <div className="flex items-center space-x-1 text-slate-700">
              <HiTrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs font-medium">Trending</span>
            </div>
          </div>
        </div>

        {/* Events Content - Enhanced Mobile Slider */}
        {allEvents && allEvents.length > 0 ? (
          <div className="space-y-4">
            {/* Mobile Auto-Slider (visible on mobile only) */}
            <div className="block sm:hidden">
              <div className="relative overflow-hidden rounded-2xl shadow-lg events-slider">
                {/* Slider Container */}
                <div
                  ref={sliderRef}
                  className="flex events-slide-transition events-slider-container"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  {allEvents.map((event, index) => (
                    <div
                      key={index}
                      className="w-full flex-shrink-0 relative events-touch-feedback"
                    >
                      <div className="relative">
                        {index === 0 && (
                          <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                            ⭐ FEATURED
                          </div>
                        )}
                        {index === 1 && (
                          <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            🔥 HOT
                          </div>
                        )}
                        <EventCard data={event} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-full shadow-lg events-nav-arrow z-10"
                  aria-label="Previous event"
                >
                  <HiChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-full shadow-lg events-nav-arrow z-10"
                  aria-label="Next event"
                >
                  <HiChevronRight className="w-5 h-5" />
                </button>

                {/* Enhanced Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                  {allEvents.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`events-dot rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? "w-6 h-2 bg-white shadow-lg active"
                          : "w-2 h-2 bg-white/60 hover:bg-white/80"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Auto-play indicator with progress */}
                <div className="absolute top-3 left-3 z-10">
                  <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full">
                    <div
                      className={`w-2 h-2 rounded-full events-autoplay-indicator ${
                        isAutoPlaying ? "bg-green-400" : "bg-gray-400"
                      }`}
                    ></div>
                    <span className="text-xs font-medium">
                      {isAutoPlaying ? "AUTO" : "MANUAL"}
                    </span>
                    <span className="text-xs opacity-75">
                      {currentSlide + 1}/{allEvents.length}
                    </span>
                  </div>
                </div>

                {/* Progress bar for auto-play */}
                {isAutoPlaying && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 z-10">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 events-progress-bar"></div>
                  </div>
                )}
              </div>

              {/* Mobile Slider Info */}
              <div className="text-center mt-3">
                <div className="inline-flex items-center space-x-4 text-xs text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                  <span className="flex items-center space-x-1">
                    <span>👈👉</span>
                    <span>Swipe to browse</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <span>⏱️</span>
                    <span>Auto-slides every 4s</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Grid Layout (hidden on mobile) */}
            <div className="hidden sm:block space-y-4">
              {/* Featured Event */}
              <div className="relative">
                <div className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  FEATURED EVENT
                </div>
                <EventCard data={allEvents[0]} />
              </div>

              {/* Multiple Events Grid */}
              {allEvents.length > 1 && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {allEvents.slice(1, 4).map((event, index) => (
                    <div
                      key={index}
                      className="transform hover:scale-105 transition-all duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative">
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                            HOT
                          </div>
                        )}
                        <EventCard data={event} compact={true} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* View All Events Button */}
            <div className="text-center">
              <div className="bg-white rounded-xl p-5 shadow-lg border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  More Amazing Events Await
                </h3>
                <p className="text-slate-600 mb-3 text-sm">
                  Discover all our exclusive events and never miss a deal
                </p>
                <Link to="/events">
                  <button className="group inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 transform">
                    <span>View All Events</span>
                    <svg
                      className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>

            {/* Enhanced Newsletter Signup */}
            <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-2xl p-5 text-white shadow-2xl">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <HiOutlineCalendar className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-1">Never Miss an Event</h3>
                <p className="text-orange-100 text-sm">
                  Be the first to know about exclusive events and special deals
                </p>
              </div>
              <form
                onSubmit={handleNewsletterSubscribe}
                className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubscribing}
                  className="flex-1 px-3 py-2.5 rounded-lg border-0 text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-white focus:ring-opacity-30 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={isSubscribing || !email}
                  className="px-4 py-2.5 bg-white text-red-600 font-bold rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubscribing ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>...</span>
                    </div>
                  ) : isSubscribed ? (
                    <div className="flex items-center justify-center">
                      <span className="text-green-600">✓ Subscribed!</span>
                    </div>
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </form>
              {isSubscribed && (
                <div className="text-center mt-2">
                  <span className="text-orange-100 text-xs">
                    ✨ Welcome to our newsletter!
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Enhanced Empty State
          <div className="text-center py-12">
            <div className="max-w-sm mx-auto">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center shadow-md">
                <HiOutlineClock className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                No Events Available Right Now
              </h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Stay tuned for exciting events and special offers coming soon!
                We're preparing something amazing for you.
              </p>
              <Link to="/products">
                <button className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 transform">
                  <span>Browse Products Instead</span>
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Events;
