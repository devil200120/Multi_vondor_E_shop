import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { brandingData } from "../../../static/data";
import { getRootCategoriesPublic } from "../../../redux/actions/category";
import { backend_url } from "../../../server";
import { getCategoryImageUrl } from "../../../utils/mediaUtils";
import { HiStar, HiCollection, HiArrowRight, HiSparkles } from "react-icons/hi";

const Categories = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categories, isLoading } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(getRootCategoriesPublic());
  }, [dispatch]);

  // Use API categories directly - already filtered to root categories
  const categoriesData = categories || [];

  return (
    <section className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Indicators */}
        <div className="hidden sm:block mb-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {brandingData &&
                brandingData.map((item, index) => (
                  <div
                    className="flex items-center space-x-3 group hover:scale-105 transition-all duration-300"
                    key={index}
                  >
                    <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300 shadow-md">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-base mb-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-normal">
                        {item.Description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-12">
          {/* Modern Section Header */}
          <div className="text-center mb-10">
            {/* Badge */}
            <div className="inline-flex items-center mb-3">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-2 rounded-full shadow-lg">
                <HiCollection className="w-4 h-4" />
                <span className="text-xs font-semibold tracking-wide">
                  SHOP BY CATEGORY
                </span>
                <HiSparkles className="w-3 h-3" />
              </div>
            </div>

            {/* Main Title */}
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">
              Explore Our
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}
                Categories
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-normal">
              Discover amazing products across different categories. Find
              exactly what you're looking for with our curated collections.
            </p>

            {/* Stats */}
            <div className="flex justify-center items-center space-x-4 mt-4">
              <div className="flex items-center space-x-1 text-gray-700">
                <HiStar className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Top Quality</span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center space-x-1 text-gray-700">
                <HiCollection className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">
                  {categoriesData?.length}+ Categories
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-10">
            {categoriesData &&
              categoriesData.map((category, index) => {
                const handleSubmit = (cat) => {
                  navigate(`/products?category=${cat.name || cat.title}`);
                };

                return (
                  <div
                    key={category._id || category.id || index}
                    className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 hover:border-blue-200 transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2 hover:scale-105"
                    onClick={() => handleSubmit(category)}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Category Image Container */}
                    <div className="aspect-square p-4 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
                      <img
                        src={getCategoryImageUrl(
                          category.image || category.image_Url,
                          backend_url
                        )}
                        alt={category.name || category.title}
                        className="w-full h-full object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                      />

                      {/* Floating Elements */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                          <HiArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    </div>

                    {/* Category Info */}
                    <div className="p-3 text-center bg-white">
                      <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors duration-300 leading-tight mb-1">
                        {category.name || category.title}
                      </h3>
                      <p className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                        Explore Collection
                      </p>
                    </div>

                    {/* Animated Border */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500 rounded-3xl transition-all duration-300"></div>

                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                  </div>
                );
              })}
          </div>

          {/* Enhanced CTA Section */}
          <div className="text-center">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can't Find What You're Looking For?
              </h3>
              <p className="text-gray-600 mb-4 text-sm max-w-md mx-auto">
                Browse our complete product collection to discover thousands of
                amazing items across all categories.
              </p>
              <button
                onClick={() => navigate("/products")}
                className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-blue-700 hover:to-indigo-700"
              >
                <span>View All Products</span>
                <svg
                  className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;
