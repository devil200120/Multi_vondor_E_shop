import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminPlanManagement from "../components/Admin/AdminPlanManagement";

const AdminPlanManagementPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader activeMenuItem={18} />
      <div className="flex">
        {/* Sidebar - Fixed positioning for better responsiveness */}
        <div className="hidden 800px:block w-64 fixed left-0 top-20 h-full z-10">
          <AdminSideBar active={18} />
        </div>

        {/* Main Content */}
        <div className="flex-1 800px:ml-64">
          <AdminPlanManagement />
        </div>
      </div>
    </div>
  );
};

export default AdminPlanManagementPage;
