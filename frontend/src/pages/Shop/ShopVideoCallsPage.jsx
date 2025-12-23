import React from "react";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";
import VideoCallManager from "../../components/Shop/VideoCall/VideoCallManager";

const ShopVideoCallsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:block w-56 fixed left-0 top-16 h-[calc(100vh-4rem)] z-10">
          <DashboardSideBar active={8} />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-56">
          <VideoCallManager />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <DashboardSideBar active={8} />
      </div>
    </div>
  );
};

export default ShopVideoCallsPage;
