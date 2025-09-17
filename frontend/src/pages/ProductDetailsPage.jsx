import React, { useEffect, useState } from "react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import ProductDetails from "../components/Products/ProductDetails";
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

  // Update data when single product is fetched
  useEffect(() => {
    if (product && !eventData) {
      setData(product);
    }
  }, [product, eventData]);

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
      <Footer />
    </div>
  );
};

export default ProductDetailsPage;
