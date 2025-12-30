import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminAdPlanManagement from "../components/Admin/AdminAdPlanManagement";

const AdminAdPlanManagementPage = () => {
  return (
    <div>
      <AdminHeader />
      <div className="w-full flex">
        <div className="flex items-start justify-between w-full">
          <div className="w-[80px] 800px:w-[330px]">
            <AdminSideBar active={23} />
          </div>
          <div className="w-full justify-center flex">
            <AdminAdPlanManagement />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAdPlanManagementPage;
