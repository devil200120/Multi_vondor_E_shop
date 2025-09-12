import React from "react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import TrackOrder from "../components/Profile/TrackOrder";

const TrackOrderPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <TrackOrder />
      <Footer />
    </div>
  );
};

export default TrackOrderPage;
