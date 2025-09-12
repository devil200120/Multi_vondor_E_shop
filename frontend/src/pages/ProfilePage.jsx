import React, { useState } from "react";
import Header from "../components/Layout/Header";
import styles from "../styles/styles";
import ProfileSideBar from "../components/Profile/ProfileSidebar";
import ProfileContent from "../components/Profile/ProfileContent";

const ProfilePage = () => {
  const [active, setActive] = useState(1);
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="sticky top-8">
              <ProfileSideBar active={active} setActive={setActive} />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 mt-8 lg:mt-0">
            <ProfileContent active={active} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
