import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminSubscriptions from "../components/Admin/AdminSubscriptions";

const AdminSubscriptionsPage = () => {
  return (
    <div>
      <AdminHeader />
      <div className="w-full flex">
        <div className="flex items-start justify-between w-full">
          <div className="">
            <AdminSideBar active={15} />
          </div>
          <div className="w-full justify-center flex p-4">
            <AdminSubscriptions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptionsPage;

