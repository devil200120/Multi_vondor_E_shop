import React, { useEffect, useState } from "react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import ProductDetails from "../components/Products/ProductDetails";
import FloatingVideoBanner from "../components/Products/FloatingVideoBanner";
import { useParams, useSearchParams } from "react-router-dom";
import SuggestedProduct from "../components/Products/SuggestedProduct";
import { useSelector, useDispatch } from "react-redux";
import { getSingleProduct } from "../redux/actions/product";

const ProductDetailsPage = () => {
  const dispatch = useDispatch();
  const { allProducts, product, productLoading } = useSelector(
    (state) => state.products
  );
  const { allEvents } = useSelector((state) => state.events);
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [searchParams] = useSearchParams();
  const eventData = searchParams.get("isEvent");

  // Video banner states
  const [showFloatingBanner, setShowFloatingBanner] = useState(false);
  const [bannerData, setBannerData] = useState(null);

  useEffect(() => {
    if (eventData !== null) {
      // Handle event data
      const eventProduct = allEvents && allEvents.find((i) => i._id === id);
      setData(eventProduct);
    } else {
      // First try to find product in the store
      const storeProduct = allProducts && allProducts.find((i) => i._id === id);
      if (storeProduct) {
        setData(storeProduct);
      } else {
        // If not found in store, fetch individual product
        dispatch(getSingleProduct(id));
      }
    }
    window.scrollTo(0, 0);
  }, [allProducts, allEvents, id, eventData, dispatch]);

  // Check if user came from video banner
  useEffect(() => {
    const fromVideoBanner = searchParams.get("fromVideoBanner");
    const bannerTitle = searchParams.get("bannerTitle");
    const bannerVideo = searchParams.get("bannerVideo");
    const bannerThumbnail = searchParams.get("bannerThumbnail");

    if (fromVideoBanner && bannerTitle && bannerVideo) {
      setBannerData({
        bannerId: fromVideoBanner,
        bannerTitle: decodeURIComponent(bannerTitle),
        videoUrl: decodeURIComponent(bannerVideo),
        thumbnailUrl: bannerThumbnail
          ? decodeURIComponent(bannerThumbnail)
          : null,
      });
      setShowFloatingBanner(true);
    }
  }, [searchParams]);

  // Update data when single product is fetched
  useEffect(() => {
    if (product && !eventData) {
      setData(product);
    }
  }, [product, eventData]);

  const handleCloseBanner = () => {
    setShowFloatingBanner(false);
    setBannerData(null);
  };

  return (
    <div>
      <Header />
      {productLoading && !eventData ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">
              Loading Product...
            </h2>
          </div>
        </div>
      ) : (
        <>
          <ProductDetails data={data} />
          {!eventData && <>{data && <SuggestedProduct data={data} />}</>}
        </>
      )}

      {/* Floating Video Banner */}
      {showFloatingBanner && bannerData && (
        <FloatingVideoBanner
          bannerId={bannerData.bannerId}
          bannerTitle={bannerData.bannerTitle}
          videoUrl={bannerData.videoUrl}
          thumbnailUrl={bannerData.thumbnailUrl}
          onClose={handleCloseBanner}
        />
      )}

      <Footer />
    </div>
  );
};

export default ProductDetailsPage;
