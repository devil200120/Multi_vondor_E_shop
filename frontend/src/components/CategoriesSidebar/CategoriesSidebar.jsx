import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getRootCategoriesPublic } from "../../redux/actions/category";
import { backend_url } from "../../server";
import { getCategoryImageUrl } from "../../utils/mediaUtils";
import { HiViewGrid, HiChevronRight, HiSparkles } from "react-icons/hi";

/**
 * CategoriesSidebar Component
 * A compact sidebar version of categories for the Mall of Cayman layout
 * Displays as a legend/department list on the left side
 */
const CategoriesSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categories, isLoading } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(getRootCategoriesPublic());
  }, [dispatch]);

  const categoriesData = categories || [];

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${category.name || category.title}`);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-moc border border-secondary-100 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-secondary-100 rounded w-3/4"></div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 bg-secondary-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm border border-blue-200 overflow-hidden w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 border-b-2 border-red-500">
        <div className="flex items-center space-x-2 text-white">
          <HiViewGrid className="w-5 h-5" />
          <span className="font-bold text-sm tracking-wide">DEPARTMENTS</span>
          <HiSparkles className="w-4 h-4 ml-auto" />
        </div>
      </div>

      {/* Categories List */}
      <div className="divide-y divide-blue-50 max-h-[400px] overflow-y-auto custom-scrollbar">
        {categoriesData.length > 0 ? (
          categoriesData.map((category, index) => (
            <button
              key={category._id || category.id || index}
              onClick={() => handleCategoryClick(category)}
              className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-primary-50 group transition-all duration-200"
            >
              {/* Category Icon/Image */}
              <div className="w-8 h-8 flex-shrink-0 bg-secondary-50 rounded-lg overflow-hidden border border-secondary-100 group-hover:border-primary-200 transition-colors">
                <img
                  src={getCategoryImageUrl(
                    category.image || category.image_Url,
                    backend_url
                  )}
                  alt={category.name || category.title}
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      (category.name || category.title || "C")[0]
                    )}&background=003DA5&color=fff&size=32`;
                  }}
                />
              </div>

              {/* Category Name */}
              <span className="flex-1 text-left text-sm text-text-primary group-hover:text-primary-600 font-medium transition-colors truncate">
                {category.name || category.title}
              </span>

              {/* Arrow */}
              <HiChevronRight className="w-4 h-4 text-secondary-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))
        ) : (
          // Placeholder categories
          <div className="py-4 px-3 text-center text-text-muted text-sm">
            <p>No categories available</p>
          </div>
        )}
      </div>

      {/* View All Button */}
      <div className="p-3 bg-red-50 border-t border-red-200">
        <button
          onClick={() => navigate("/products")}
          className="w-full flex items-center justify-center space-x-2 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-sm"
        >
          <span>View All Categories</span>
          <HiChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CategoriesSidebar;
