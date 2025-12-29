import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminStaffManagement from "../components/Admin/AdminStaffManagement";

const AdminDashboardStaff = () => {
  return (
    <div>
      <AdminHeader />
      <div className="w-full flex">
        <div className="flex items-start justify-between w-full">
          <div className="w-[80px] 800px:w-[330px]">
            <AdminSideBar active={19} />
          </div>
          <div className="w-full justify-center flex">
            <AdminStaffManagement />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardStaff;
