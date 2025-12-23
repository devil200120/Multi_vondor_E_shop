import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminFAQManagement from "../components/Admin/AdminFAQManagement";

const AdminFAQPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader activeMenuItem={15} />
      <div className="flex">
        {/* Sidebar - Fixed positioning for better responsiveness */}
        <div className="hidden 800px:block w-64 fixed left-0 top-20 h-full z-10">
          <AdminSideBar active={15} />
        </div>

        {/* Main Content */}
        <div className="flex-1 800px:ml-64">
          <div className="p-6">
            <AdminFAQManagement />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFAQPage;
