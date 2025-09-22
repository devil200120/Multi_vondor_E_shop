import React from "react";
import { useNavigate } from "react-router-dom";
import { getCategoryImageUrl } from "../../utils/mediaUtils";
import { backend_url } from "../../server";

const DropDown = ({ categoriesData, setDropDown }) => {
  const navigate = useNavigate();
  const submitHandle = (i) => {
    navigate(`/products?category=${i.name || i.title}`);
    setDropDown(false);
    // Remove window.location.reload() as it causes issues
  };

  return (
    <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-secondary-200 rounded-lg shadow-unacademy-lg z-50 py-2 animate-slideInDown backdrop-blur-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-secondary-100">
        <h3 className="text-sm font-semibold text-text-primary">
          Browse Categories
        </h3>
      </div>

      {/* Categories List */}
      <div className="max-h-80 overflow-y-auto">
        {categoriesData &&
          Array.isArray(categoriesData) &&
          categoriesData.map((i, index) => (
            <div
              key={i._id || i.id || index}
              className="flex items-center px-4 py-3 hover:bg-secondary-50 cursor-pointer transition-colors duration-200 group"
              onClick={() => submitHandle(i)}
            >
              <div className="flex-shrink-0 w-8 h-8 mr-3">
                <img
                  src={getCategoryImageUrl(i.image || i.image_Url, backend_url)}
                  alt={i.name || i.title}
                  className="w-full h-full object-contain select-none"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-text-primary group-hover:text-primary-500 transition-colors duration-200 select-none">
                  {i.name || i.title}
                </h3>
              </div>
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg
                  className="w-4 h-4 text-primary-500"
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
              </div>
            </div>
          ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-secondary-100 bg-secondary-50">
        <div className="text-xs text-text-muted text-center">
          Explore all {categoriesData?.length || 0} categories
        </div>
      </div>
    </div>
  );
};

export default DropDown;
