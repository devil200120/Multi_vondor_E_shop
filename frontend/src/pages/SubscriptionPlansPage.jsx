import React from "react";
import { useSelector } from "react-redux";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import DashboardHeader from "../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../components/Shop/Layout/DashboardSideBar";
import SubscriptionPlans from "../components/Shop/SubscriptionPlans";

const SubscriptionPlansPage = () => {
  const { isSeller } = useSelector((state) => state.seller);

  // If seller is logged in, show dashboard layout
  if (isSeller) {
    return (
      <div>
        <DashboardHeader />
        <div className="flex items-start justify-between w-full">
          <div className="w-[80px] 800px:w-[330px]">
            <DashboardSideBar active={11} />
          </div>
          <div className="w-full justify-center flex">
            <SubscriptionPlans />
          </div>
        </div>
      </div>
    );
  }

  // Public view - show normal header/footer layout
  return (
    <div>
      <Header activeHeading={4} />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <SubscriptionPlans isPublic={true} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SubscriptionPlansPage;
