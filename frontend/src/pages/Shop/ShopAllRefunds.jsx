import React from "react";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";
import AllRefundOrders from "../../components/Shop/AllRefundOrders";

const ShopAllRefunds = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex justify-between w-full">
        <div className="">
          <DashboardSideBar active={9} />
        </div>
        <div className="w-full justify-center flex mobile-content-padding">
          <AllRefundOrders />
        </div>
      </div>
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <DashboardSideBar active={9} />
      </div>
    </div>
  );
};

export default ShopAllRefunds;

