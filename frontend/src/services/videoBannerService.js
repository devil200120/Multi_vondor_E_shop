import { server } from "../server";

// Get video banners for a specific shop
export const getShopVideoBanners = async (shopId) => {
  try {
    const response = await fetch(`${server}/video-banner/shop/${shopId}/video-banners`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching shop video banners:", error);
    throw error;
  }
};

// Record a view for a video banner
export const recordVideoBannerView = async (bannerId) => {
  try {
    const response = await fetch(`${server}/video-banner/record-view/${bannerId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error recording video banner view:", error);
    throw error;
  }
};

// Record a click for a video banner
export const recordVideoBannerClick = async (bannerId) => {
  try {
    const response = await fetch(`${server}/video-banner/record-click/${bannerId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error recording video banner click:", error);
    throw error;
  }
};