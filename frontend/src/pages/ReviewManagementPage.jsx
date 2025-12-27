import React from "react";
import DashboardHeader from "../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../components/Shop/Layout/DashboardSideBar";
import ReviewManagement from "../components/Shop/ReviewManagement";

const ReviewManagementPage = () => {
  return (
    <div>
      <DashboardHeader />
      <div className="flex">
        <DashboardSideBar active={18} />
        <div className="w-full lg:w-[calc(100%-256px)] lg:ml-64">
          <ReviewManagement />
        </div>
      </div>
    </div>
  );
};

export default ReviewManagementPage;
