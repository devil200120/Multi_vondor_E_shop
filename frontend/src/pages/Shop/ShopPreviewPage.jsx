import React from "react";
import ShopInfo from "../../components/Shop/ShopInfo";
import ShopProfileData from "../../components/Shop/ShopProfileData";
import ShopVideoBanners from "../../components/Shop/ShopVideoBanners";
import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";

const ShopPreviewPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Shop Info Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-8">
              <ShopInfo isOwner={false} />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Shop Video Banners */}
            <ShopVideoBanners />

            {/* Shop Profile Data */}
            <ShopProfileData isOwner={false} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShopPreviewPage;
