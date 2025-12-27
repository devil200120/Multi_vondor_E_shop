import React from "react";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";
import DashboardMessages from "../../components/Shop/DashboardMessages";

const ShopInboxPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex items-start justify-between w-full">
        <div className="">
          <DashboardSideBar active={8} />
        </div>
        <div className="flex-1 mobile-content-padding">
          <DashboardMessages />
        </div>
      </div>
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <DashboardSideBar active={8} />
      </div>
    </div>
  );
};

export default ShopInboxPage;

