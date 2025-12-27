import React from "react";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";
import EditProduct from "../../components/Shop/EditProduct";

const ShopEditProductPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex items-center justify-between w-full">
        <div className="">
          <DashboardSideBar active={4} />
        </div>
        <div className="w-full justify-center flex mobile-content-padding">
          <EditProduct />
        </div>
      </div>
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <DashboardSideBar active={4} />
      </div>
    </div>
  );
};

export default ShopEditProductPage;

