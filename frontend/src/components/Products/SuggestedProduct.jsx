import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ProductCard from "../Route/ProductCard/ProductCard";

const SuggestedProduct = ({ data }) => {
  const { allProducts } = useSelector((state) => state.products);
  const [productData, setProductData] = useState();

  // Product is filtered when the category is same as the current product when page is loaded
  useEffect(() => {
    const d =
      allProducts &&
      allProducts.filter((product) => {
        // Handle both old string format and new ObjectId format
        if (
          typeof product.category === "string" &&
          typeof data.category === "string"
        ) {
          return product.category === data.category;
        } else if (product.category && data.category) {
          // Compare ObjectIds or names
          const productCategoryId = product.category._id || product.category;
          const dataCategoryId = data.category._id || data.category;
          return productCategoryId === dataCategoryId;
        }
        return false;
      });
    setProductData(d);
  }, [allProducts, data.category]);

  return (
    <div>
      {data ? (
        <div className="px-4 py-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {productData &&
                productData
                  .slice(0, 6)
                  .map((i, index) => (
                    <ProductCard data={i} key={index} isCompact={true} />
                  ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SuggestedProduct;
