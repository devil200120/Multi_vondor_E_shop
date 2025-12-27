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
import AdBanners from "../components/AdBanners/AdBanners";

const HomePage = () => {
  return (
    <div className="bg-gradient-to-b from-blue-100 to-blue-50 min-h-screen">
      <Header activeHeading={1} />

      {/* Header Banner Area - Full Width Centered */}
      <div className="w-full bg-blue-50/80 border-b-2 border-red-500 py-4">
        <div className="max-w-[728px] mx-auto px-4">
          <AdBanners position="header" />
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

            {/* Video Banners */}
            <VideoBanners />

            {/* Mall Map */}
            <MallMap />

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
                      💎 4 Subscription Plans
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full">
                      💰 90% Commission for Sellers
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

            {/* Featured Products */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm p-5 border-l-4 border-l-red-500 border border-blue-200">
              <FeaturedProduct />
            </div>

            {/* Events */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm p-5 border-l-4 border-l-primary-500 border border-blue-200">
              <Events />
            </div>
          </main>

          {/* Right Sidebar - Ads */}
          <aside className="hidden xl:block">
            <div className="sticky top-24 space-y-4">
              {/* Sidebar Header Ad */}
              <AdBanners position="sidebar-header" />

              {/* Sidebar Ads */}
              <AdBanners position="sidebar-top" />
              <AdBanners position="sidebar-middle" />
              <AdBanners position="sidebar-bottom" />

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
