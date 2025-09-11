import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import styles from "../../styles/styles";
import EventCard from "./EventCard";
import { HiOutlineCalendar, HiOutlineClock } from "react-icons/hi";

const Events = () => {
  const { allEvents, isLoading } = useSelector((state) => state.events);

  if (isLoading) {
    return (
      <div className={`${styles.section_padding}`}>
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.section_padding} bg-white`}>
      <div className={`${styles.section}`}>
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-full">
              <HiOutlineCalendar className="w-5 h-5" />
              <span className="text-sm font-semibold">SPECIAL EVENTS</span>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Popular Events
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Don't miss out on our exclusive events with special discounts and
            limited-time offers.
          </p>
        </div>

        {/* Events Content */}
        {allEvents && allEvents.length > 0 ? (
          <div className="space-y-8">
            {/* Featured Event */}
            <div className="mb-12">
              <EventCard data={allEvents[0]} />
            </div>

            {/* Multiple Events Grid */}
            {allEvents.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allEvents.slice(1, 4).map((event, index) => (
                  <div
                    key={index}
                    className="transform hover:scale-105 transition-all duration-300"
                  >
                    <EventCard data={event} compact={true} />
                  </div>
                ))}
              </div>
            )}

            {/* View All Events Button */}
            <div className="text-center mt-12">
              <Link to="/events">
                <button className="inline-flex items-center px-8 py-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-200 shadow-unacademy hover:shadow-unacademy-md hover:transform hover:scale-105">
                  View All Events
                  <svg
                    className="ml-2 w-5 h-5"
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
        ) : (
          // Empty State
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-secondary-100 rounded-full flex items-center justify-center">
              <HiOutlineClock className="w-12 h-12 text-secondary-400" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              No events available right now
            </h3>
            <p className="text-text-secondary mb-6">
              Stay tuned for exciting events and special offers coming soon!
            </p>
            <Link to="/products">
              <button className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors duration-200">
                Browse Products Instead
              </button>
            </Link>
          </div>
        )}

        {/* Newsletter Signup for Events */}
        {allEvents && allEvents.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-secondary-50 to-primary-50 rounded-2xl p-8 text-center border border-secondary-200">
            <h3 className="text-2xl font-bold text-text-primary mb-2">
              Never Miss an Event
            </h3>
            <p className="text-text-secondary mb-6">
              Subscribe to get notified about upcoming events and exclusive
              deals
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-secondary-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
              <button className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
