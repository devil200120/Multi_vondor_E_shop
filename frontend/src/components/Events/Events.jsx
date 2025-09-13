import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import EventCard from "./EventCard";
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiStar,
  HiTrendingUp,
  HiLightningBolt,
  HiFire,
} from "react-icons/hi";

const Events = () => {
  const { allEvents, isLoading } = useSelector((state) => state.events);

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
    <section className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modern Header Section */}
        <div className="text-center mb-6">
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

        {/* Events Content */}
        {allEvents && allEvents.length > 0 ? (
          <div className="space-y-4">
            {/* Featured Event */}
            <div className="relative">
              <div className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                FEATURED EVENT
              </div>
              <EventCard data={allEvents[0]} />
            </div>

            {/* Multiple Events Grid */}
            {allEvents.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2.5 rounded-lg border-0 text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-white focus:ring-opacity-30 transition-all duration-200 text-sm"
                />
                <button className="px-4 py-2.5 bg-white text-red-600 font-bold rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm">
                  Subscribe
                </button>
              </div>
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
