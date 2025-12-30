import React from "react";
import Header from "../components/Layout/Header";
import Hero from "../components/Route/Hero/Hero";
import VideoBanners from "../components/Route/VideoBanners/VideoBanners";
import CategoriesSidebar from "../components/CategoriesSidebar/CategoriesSidebar";
import BestDeals from "../components/Route/BestDeals/BestDeals";
import Events from "../components/Events/Events";
import FeaturedProduct from "../components/Route/FeaturedProduct/FeaturedProduct";
import Footer from "../components/Layout/Footer";
import MallMap from "../components/MallMap/MallMap";
import FeaturedStores from "../components/FeaturedStores/FeaturedStores";
import AdvertisementBanners from "../components/AdBanners/AdvertisementBanners";
import FeaturedAdvertisedStores from "../components/Route/FeaturedAdvertisedStores/FeaturedAdvertisedStores";
import FeaturedAdvertisedProducts from "../components/Route/FeaturedAdvertisedProducts/FeaturedAdvertisedProducts";

const HomePage = () => {
  return (
    <div className="bg-gradient-to-b from-blue-100 to-blue-50 min-h-screen">
      <Header activeHeading={1} />

      {/* Leaderboard Ad Banner - Full Width, Responsive */}
      <div className="w-full bg-blue-50/80 border-b-2 border-red-500 py-2 sm:py-4">
        <div className="max-w-full sm:max-w-[728px] mx-auto px-2 sm:px-4">
          <AdvertisementBanners adType="leaderboard" />
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_300px] gap-5">
          {/* Left Sidebar - Departments */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <CategoriesSidebar />
            </div>
          </aside>

          {/* Center Content Area */}
          <main className="space-y-5 min-w-0">
            {/* Hero Section */}
            <Hero />

            {/* Mobile Ad Banner 1 - After Hero (Most visible position) */}
            <div className="xl:hidden">
              <div className="flex justify-center">
                <AdvertisementBanners adType="top_sidebar" />
              </div>
            </div>

            {/* Video Banners */}
            <VideoBanners />

            {/* Mobile Ad Banner 2 - After Video Banners */}
            <div className="xl:hidden">
              <div className="flex justify-center">
                <AdvertisementBanners adType="right_sidebar_top" />
              </div>
            </div>

            {/* Mall Map */}
            <MallMap />

            {/* Featured Advertised Stores (Paid) */}
            <FeaturedAdvertisedStores />

            {/* Featured Advertised Products (Paid) */}
            <FeaturedAdvertisedProducts />

            {/* Mobile Ad Banner 3 - After Featured Products (Mid-page visibility) */}
            <div className="xl:hidden">
              <div className="flex justify-center">
                <AdvertisementBanners adType="right_sidebar_middle" />
              </div>
            </div>

            {/* Featured Stores */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm p-5 border-l-4 border-l-red-500 border border-blue-200">
              <FeaturedStores />
            </div>

            {/* Seller Subscription CTA */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 border border-primary-700">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-white">
                  <h2 className="text-2xl font-bold mb-2">
                    Start Selling on Mall of Cayman
                  </h2>
                  <p className="text-primary-100 text-sm">
                    Choose from our flexible subscription plans and reach
                    thousands of customers
                  </p>
                  <div className="flex flex-wrap gap-3 mt-3 text-xs">
                    <span className="bg-white/20 px-3 py-1 rounded-full">
                      💎 3 Subscription Plans
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full">
                      📦 Inventory Alerts
                    </span>
                  </div>
                </div>
                <a
                  href="/shop/subscriptions"
                  className="bg-accent-500 hover:bg-accent-600 text-white font-bold px-8 py-3 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg whitespace-nowrap"
                >
                  View Plans →
                </a>
              </div>
            </div>

            {/* Best Deals */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm p-5 border-l-4 border-l-primary-500 border border-blue-200">
              <BestDeals />
            </div>

            {/* Mobile Ad Banner 4 - After Best Deals */}
            <div className="xl:hidden">
              <div className="flex justify-center">
                <AdvertisementBanners adType="right_sidebar_bottom" />
              </div>
            </div>

            {/* Featured Products */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm p-5 border-l-4 border-l-red-500 border border-blue-200">
              <FeaturedProduct />
            </div>

            {/* Events */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm p-5 border-l-4 border-l-primary-500 border border-blue-200">
              <Events />
            </div>
          </main>

          {/* Right Sidebar - Ads (Desktop Only) */}
          <aside className="hidden xl:block">
            <div className="sticky top-24 space-y-4">
              {/* Top Sidebar Ad - 200x120 */}
              <AdvertisementBanners adType="top_sidebar" />

              {/* Right Sidebar Top - 300x200 */}
              <AdvertisementBanners adType="right_sidebar_top" />

              {/* Right Sidebar Middle - 300x200 */}
              <AdvertisementBanners adType="right_sidebar_middle" />

              {/* Right Sidebar Bottom - 300x200 */}
              <AdvertisementBanners adType="right_sidebar_bottom" />

              {/* Quick Links */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm p-4 border border-blue-200 border-t-4 border-t-red-500">
                <h3 className="font-bold text-sm text-gray-800 mb-3 flex items-center">
                  <span className="w-1 h-4 bg-red-500 rounded-full mr-2"></span>
                  Quick Links
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="/shop/subscriptions"
                      className="text-gray-500 hover:text-primary-500 transition-colors font-semibold"
                    >
                      → Seller Plans & Pricing
                    </a>
                  </li>
                  <li>
                    <a
                      href="/faq"
                      className="text-gray-500 hover:text-primary-500 transition-colors"
                    >
                      → FAQ
                    </a>
                  </li>
                  <li>
                    <a
                      href="/shop-create"
                      className="text-gray-500 hover:text-primary-500 transition-colors"
                    >
                      → Become a Seller
                    </a>
                  </li>
                  <li>
                    <a
                      href="/about"
                      className="text-gray-500 hover:text-primary-500 transition-colors"
                    >
                      → About Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="/inbox"
                      className="text-gray-500 hover:text-primary-500 transition-colors"
                    >
                      → Contact Support
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
