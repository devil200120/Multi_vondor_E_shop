import React from "react";
import DashboardHeader from "../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../components/Shop/Layout/DashboardSideBar";
import CommissionDashboard from "../components/Shop/CommissionDashboard";

const CommissionDashboardPage = () => {
  return (
    <div>
      <DashboardHeader />
      <DashboardSideBar active={12} />
      <div className="w-full lg:ml-64 p-4">
        <CommissionDashboard />
      </div>
    </div>
  );
};

export default CommissionDashboardPage;
