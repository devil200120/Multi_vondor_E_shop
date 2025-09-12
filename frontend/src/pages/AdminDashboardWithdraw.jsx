import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AllWithdraw from "../components/Admin/AllWithdraw";

const AdminDashboardWithdraw = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <div className="w-[80px] 800px:w-[330px] flex-shrink-0">
          <AdminSideBar active={7} />
        </div>
        <div className="flex-1 ml-0 800px:ml-[330px] w-[80px]:ml-[80px]">
          <AllWithdraw />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardWithdraw;
