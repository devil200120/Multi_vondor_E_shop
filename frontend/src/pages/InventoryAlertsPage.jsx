import React from "react";
import DashboardHeader from "../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../components/Shop/Layout/DashboardSideBar";
import InventoryAlerts from "../components/Shop/InventoryAlerts";

const InventoryAlertsPage = () => {
  return (
    <div>
      <DashboardHeader />
      <DashboardSideBar active={19} />
      <div className="w-full lg:ml-64 p-4">
        <InventoryAlerts />
      </div>
    </div>
  );
};

export default InventoryAlertsPage;
