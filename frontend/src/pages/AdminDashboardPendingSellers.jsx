import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import PendingSellers from "../components/Admin/PendingSellers";

const AdminDashboardPendingSellers = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader activeMenuItem={11} />
      <div className="flex">
        {/* Sidebar - Fixed positioning for better responsiveness */}
        <div className="hidden 800px:block w-64 fixed left-0 top-20 h-full z-10">
          <AdminSideBar active={11} />
        </div>

        {/* Main Content */}
        <div className="flex-1 800px:ml-64">
          <PendingSellers />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPendingSellers;
