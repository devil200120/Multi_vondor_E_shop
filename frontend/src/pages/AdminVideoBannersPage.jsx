import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar.jsx";
import AdminVideoBanners from "../components/Admin/AdminVideoBanners.jsx";

const AdminVideoBannersPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader activeMenuItem={16} />
      <div className="flex">
        {/* Sidebar - Fixed positioning for better responsiveness */}
        <div className="hidden 800px:block w-64 fixed left-0 top-20 h-full z-10">
          <AdminSideBar active={16} />
        </div>

        {/* Main Content */}
        <div className="flex-1 800px:ml-64">
          <AdminVideoBanners />
        </div>
      </div>
    </div>
  );
};

export default AdminVideoBannersPage;
