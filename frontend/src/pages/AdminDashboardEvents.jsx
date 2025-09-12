import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AllEvents from "../components/Admin/AllEvents";

const AdminDashboardEvents = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <div className="w-[80px] 800px:w-[330px] flex-shrink-0">
          <AdminSideBar active={6} />
        </div>
        <div className="flex-1 ml-0 800px:ml-[330px] w-[80px]:ml-[80px]">
          <AllEvents />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardEvents;
