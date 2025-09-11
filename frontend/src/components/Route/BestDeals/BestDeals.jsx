import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import styles from "../../../styles/styles";
import ProductCard from "../ProductCard/ProductCard";
import { HiOutlineFire } from "react-icons/hi";

const BestDeals = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { allProducts } = useSelector((state) => state.products);

  useEffect(() => {
    const allProductsData = allProducts ? [...allProducts] : [];
    const sortedData = allProductsData?.sort((a, b) => b.sold_out - a.sold_out);
    const firstFive = sortedData && sortedData.slice(0, 5);
    setData(firstFive);
    setLoading(false);
  }, [allProducts]);

  if (loading) {
    return (
      <div className={`${styles.section_padding}`}>
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading best deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.section_padding} bg-secondary-50`}>
      <div className={`${styles.section}`}>
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2 bg-accent-500 text-white px-4 py-2 rounded-full">
              <HiOutlineFire className="w-5 h-5" />
              <span className="text-sm font-semibold">HOT DEALS</span>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Best Deals of the Day
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Don't miss out on these amazing deals! Limited time offers on our
            most popular products.
          </p>
        </div>

        {/* Products Grid */}
        {data && data.length !== 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mb-12">
              {data.map((product, index) => (
                <div key={index} className="group">
                  <ProductCard data={product} />
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Link to="/best-selling">
                <button className="inline-flex items-center px-8 py-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-200 shadow-unacademy hover:shadow-unacademy-md hover:transform hover:scale-105">
                  View All Best Sellers
                  <svg
                    className="ml-2 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </Link>
            </div>
          </>
        ) : (
          // Empty State
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-secondary-100 rounded-full flex items-center justify-center">
              <HiOutlineFire className="w-12 h-12 text-secondary-400" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              No deals available right now
            </h3>
            <p className="text-text-secondary mb-6">
              Check back later for amazing deals on your favorite products.
            </p>
            <Link to="/products">
              <button className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors duration-200">
                Browse All Products
              </button>
            </Link>
          </div>
        )}

        {/* Deal Timer Section */}
        {data && data.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-2">Flash Sale Ends Soon!</h3>
            <p className="text-primary-100 mb-4">
              Don't miss these incredible deals
            </p>
            <div className="flex justify-center space-x-4">
              <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                <div className="text-2xl font-bold">23</div>
                <div className="text-sm">Hours</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                <div className="text-2xl font-bold">59</div>
                <div className="text-sm">Minutes</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                <div className="text-2xl font-bold">45</div>
                <div className="text-sm">Seconds</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BestDeals;
