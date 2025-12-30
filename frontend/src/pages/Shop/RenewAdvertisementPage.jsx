import React from "react";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";
import RenewAdvertisement from "../../components/Shop/RenewAdvertisement";

const RenewAdvertisementPage = () => {
  return (
    <div>
      <DashboardHeader />
      <div className="flex items-start justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <DashboardSideBar active={17} />
        </div>
        <RenewAdvertisement />
      </div>
    </div>
  );
};

export default RenewAdvertisementPage;
