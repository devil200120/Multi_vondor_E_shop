import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getShopVideoBanners,
  recordVideoBannerView,
} from "../../services/videoBannerService";
import FloatingVideoBanner from "../Products/FloatingVideoBanner";
import { toast } from "react-toastify";

const ShopVideoBanners = () => {
  const [videoBanners, setVideoBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const { id: shopId } = useParams();

  const fetchShopVideoBanners = async () => {
    try {
      setLoading(true);
      const response = await getShopVideoBanners(shopId);

      if (response.success) {
        const banners = response.videoBanners || [];
        setVideoBanners(banners);

        // Record views for all banners when they load
        banners.forEach(async (banner) => {
          try {
            await recordVideoBannerView(banner._id);
          } catch (error) {
            console.error("Error recording banner view:", error);
          }
        });
      } else {
        console.error("Failed to fetch video banners:", response.message);
      }
    } catch (error) {
      console.error("Error fetching shop video banners:", error);
      toast.error("Failed to load video banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) {
      fetchShopVideoBanners();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId]);

  const handleCloseBanner = (bannerId) => {
    setVideoBanners((prevBanners) =>
      prevBanners.filter((banner) => banner._id !== bannerId)
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading video banners...</p>
        </div>
      </div>
    );
  }

  if (!videoBanners || videoBanners.length === 0) {
    return null; // Don't show anything if no videos
  }

  return (
    <div>
      {/* Show all video banners as floating videos by default */}
      {videoBanners.map((banner, index) => (
        <FloatingVideoBanner
          key={banner._id}
          bannerId={banner._id}
          bannerTitle={banner.title}
          videoUrl={banner.videoUrl}
          thumbnailUrl={banner.thumbnailUrl}
          onClose={() => handleCloseBanner(banner._id)}
          initialPosition={{
            x: 50 + index * 20, // Stagger horizontally
            y: 50 + index * 20, // Stagger vertically
          }}
        />
      ))}
    </div>
  );
};

export default ShopVideoBanners;
