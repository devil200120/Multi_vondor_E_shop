import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminAnalytics from "../components/Admin/AdminAnalytics";

const AdminAnalyticsPage = () => {
  return (
    <div>
      <AdminHeader />
      <div className="w-full flex">
        <div className="flex items-start justify-between w-full">
          <div className="">
            <AdminSideBar active={8} />
          </div>
          <div className="w-full justify-center flex">
            <AdminAnalytics />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;

