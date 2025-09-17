import React from "react";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";
import DashboardHero from "../../components/Shop/DashboardHero";

const ShopDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex">
        {/* Sidebar - Fixed positioning for better responsiveness */}
        <div className="hidden lg:block w-56 fixed left-0 top-16 h-[calc(100vh-4rem)] z-10">
          <DashboardSideBar active={1} />
        </div>

        {/* Main Content - Add mobile content padding */}
        <div className="flex-1 lg:ml-56 mobile-content-padding">
          <DashboardHero />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <DashboardSideBar active={1} />
      </div>
    </div>
  );
};

export default ShopDashboardPage;
