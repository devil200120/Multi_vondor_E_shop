import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import PendingProducts from "../components/Admin/PendingProducts";

const AdminDashboardPendingProducts = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader activeMenuItem={20} />
      <div className="flex">
        {/* Sidebar - Fixed positioning for better responsiveness */}
        <div className="hidden 800px:block w-64 fixed left-0 top-20 h-full z-10">
          <AdminSideBar active={20} />
        </div>

        {/* Main Content */}
        <div className="flex-1 800px:ml-64">
          <PendingProducts />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPendingProducts;
