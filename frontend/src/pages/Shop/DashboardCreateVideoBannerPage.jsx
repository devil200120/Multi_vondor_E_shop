import React from "react";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";
import CreateVideoBanner from "../../components/Shop/CreateVideoBanner";

const DashboardCreateVideoBannerPage = () => {
  return (
    <div>
      <DashboardHeader />
      <div className="flex items-start justify-between w-full">
        <div className="">
          <DashboardSideBar active={10} />
        </div>
        <CreateVideoBanner />
      </div>
    </div>
  );
};

export default DashboardCreateVideoBannerPage;
