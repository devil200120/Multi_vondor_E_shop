import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AllProducts from "../components/Admin/AllProducts";

const AdminDashboardProducts = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader activeMenuItem={5} />
      <div className="flex">
        {/* Sidebar - Fixed positioning for better responsiveness */}
        <div className="hidden 800px:block w-64 fixed left-0 top-20 h-full z-10">
          <AdminSideBar active={5} />
        </div>

        {/* Main Content */}
        <div className="flex-1 800px:ml-64 p-4 800px:p-6">
          <div className="max-w-full">
            <div className="mb-6">
              <h1 className="text-2xl 800px:text-3xl font-bold text-gray-900 mb-2">
                All Products
              </h1>
              <p className="text-gray-600">
                Manage and monitor all products in your platform
              </p>
            </div>
            <AllProducts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardProducts;
