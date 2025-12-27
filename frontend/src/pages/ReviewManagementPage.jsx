import React from "react";
import DashboardHeader from "../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../components/Shop/Layout/DashboardSideBar";
import ReviewManagement from "../components/Shop/ReviewManagement";

const ReviewManagementPage = () => {
  return (
    <div className="overflow-x-hidden">
      <DashboardHeader />
      <DashboardSideBar active={18} />
      <div className="w-full lg:ml-64 overflow-x-hidden">
        <ReviewManagement />
      </div>
    </div>
  );
};

export default ReviewManagementPage;
