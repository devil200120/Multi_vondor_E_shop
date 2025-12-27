import React from "react";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";
import EditVideoBanner from "../../components/Shop/EditVideoBanner";

const DashboardEditVideoBannerPage = () => {
  return (
    <div>
      <DashboardHeader />
      <div className="flex items-start justify-between w-full">
        <div className="">
          <DashboardSideBar active={12} />
        </div>
        <EditVideoBanner />
      </div>
    </div>
  );
};

export default DashboardEditVideoBannerPage;

