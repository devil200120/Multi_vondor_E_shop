import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminCurrencySettings from "../components/Admin/AdminCurrencySettings";

const AdminCurrencySettingsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader activeMenuItem={25} />
      <div className="flex">
        {/* Sidebar */}
        <div className="w-[280px] min-h-screen bg-white shadow-sm border-r border-gray-200 hidden 800px:block sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto">
          <AdminSideBar active={25} />
        </div>
        {/* Main Content */}
        <div className="flex-1 p-6">
          <AdminCurrencySettings />
        </div>
      </div>
    </div>
  );
};

export default AdminCurrencySettingsPage;
