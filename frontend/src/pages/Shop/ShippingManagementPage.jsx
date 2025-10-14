import React from "react";
import ShippingManagement from "../../components/Shop/ShippingManagement";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";

const ShippingManagementPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex items-start justify-between w-full">
        <div className="w-[80px] 800px:w-[330px] hidden lg:block">
          <DashboardSideBar active={11} />
        </div>
        <div className="flex-1 mobile-content-padding">
          <ShippingManagement />
        </div>
      </div>
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <DashboardSideBar active={11} />
      </div>
    </div>
  );
};

export default ShippingManagementPage;
