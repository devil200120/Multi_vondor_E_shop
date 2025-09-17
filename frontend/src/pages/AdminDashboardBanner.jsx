import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminBannerEditor from "../components/Admin/AdminBannerEditor";

const AdminDashboardBanner = () => {
  return (
    <div>
      <AdminHeader activeMenuItem={8} />
      <div className="w-full flex">
        <div className="flex items-start justify-between w-full">
          <AdminBannerEditor />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardBanner;
