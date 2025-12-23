import React from "react";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminHeader from "../components/Layout/AdminHeader";
import LegalPagesManager from "../components/Admin/LegalPagesManager";

const AdminDashboardLegalPages = () => {
  return (
    <div>
      <AdminHeader />
      <div className="w-full flex">
        <div className="flex items-start justify-between w-full">
          <div className="w-[80px] 800px:w-[330px]">
            <AdminSideBar active={12} />
          </div>
          <div className="w-full justify-center flex">
            <div className="w-[95%] flex-1">
              <LegalPagesManager />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardLegalPages;
