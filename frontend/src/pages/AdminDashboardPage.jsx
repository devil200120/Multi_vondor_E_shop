import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar.jsx";
import AdminDashboardMain from "../components/Admin/AdminDashboardMain.jsx";

const AdminDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSideBar active={1} />
        <AdminDashboardMain />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
