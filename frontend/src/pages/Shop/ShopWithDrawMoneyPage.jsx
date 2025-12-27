import React from "react";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import WithdrawMoney from "../../components/Shop/WithdrawMoney";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";

const ShopWithDrawMoneyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex items-start justify-between w-full">
        <div className="">
          <DashboardSideBar active={10} />
        </div>
        <div className="flex-1 mobile-content-padding">
          <WithdrawMoney />
        </div>
      </div>
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <DashboardSideBar active={10} />
      </div>
    </div>
  );
};

export default ShopWithDrawMoneyPage;

