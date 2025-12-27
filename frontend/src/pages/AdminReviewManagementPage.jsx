import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminReviewManagement from "../components/Admin/AdminReviewManagement";

const AdminReviewManagementPage = () => {
  return (
    <div>
      <AdminHeader />
      <div className="w-full flex">
        <div className="flex items-start justify-between w-full">
          <div className="">
            <AdminSideBar active={16} />
          </div>
          <div className="w-full justify-center flex p-4">
            <AdminReviewManagement />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReviewManagementPage;

