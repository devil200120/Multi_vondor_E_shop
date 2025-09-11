import React from "react";
import { useNavigate } from "react-router-dom";
import { brandingData, categoriesData } from "../../../static/data";
import styles from "../../../styles/styles";

const Categories = () => {
  const navigate = useNavigate();

  return (
    <div className={`${styles.section_padding}`}>
      {/* Trust Indicators */}
      <div className="hidden sm:block mb-16">
        <div className="bg-white rounded-2xl shadow-unacademy border border-secondary-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {brandingData &&
              brandingData.map((item, index) => (
                <div className="flex items-center space-x-4 group" key={index}>
                  <div className="flex-shrink-0 p-3 bg-primary-50 rounded-xl group-hover:bg-primary-100 transition-colors duration-200">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary text-lg mb-1">
                      {item.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {item.Description}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="mb-16">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Discover amazing products across different categories. Find exactly
            what you're looking for.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {categoriesData &&
            categoriesData.map((category) => {
              const handleSubmit = (cat) => {
                navigate(`/products?category=${cat.title}`);
              };

              return (
                <div
                  key={category.id}
                  className="group relative bg-white rounded-2xl shadow-unacademy hover:shadow-unacademy-lg border border-secondary-100 hover:border-primary-200 transition-all duration-300 cursor-pointer overflow-hidden hover:transform hover:scale-105"
                  onClick={() => handleSubmit(category)}
                >
                  {/* Category Image */}
                  <div className="aspect-square p-6 bg-gradient-to-br from-primary-50 to-secondary-50 relative overflow-hidden">
                    <img
                      src={category.image_Url}
                      alt={category.title}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                  </div>

                  {/* Category Info */}
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-text-primary text-sm md:text-base group-hover:text-primary-500 transition-colors duration-200 leading-tight">
                      {category.title}
                    </h3>
                  </div>

                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-500 rounded-2xl transition-all duration-300"></div>
                </div>
              );
            })}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/products")}
            className="inline-flex items-center px-8 py-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-200 shadow-unacademy hover:shadow-unacademy-md hover:transform hover:scale-105"
          >
            View All Products
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
        </div>
      </div>
    </div>
  );
};

export default Categories;
