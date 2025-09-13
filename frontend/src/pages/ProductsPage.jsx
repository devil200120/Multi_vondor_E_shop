import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import Loader from "../components/Layout/Loader";
import ProductCard from "../components/Route/ProductCard/ProductCard";
import { categoriesData } from "../static/data";
import {
  HiAdjustments,
  HiX,
  HiFilter,
  HiViewGrid,
  HiViewList,
} from "react-icons/hi";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryData = searchParams.get("category");
  const { allProducts, isLoading } = useSelector((state) => state.products);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(categoryData || "");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (categoryData === null) {
      const d = allProducts;
      setData(d);
    } else {
      const d =
        allProducts && allProducts.filter((i) => i.category === categoryData);
      setData(d);
    }
    setSelectedCategory(categoryData || "");
  }, [allProducts, categoryData]);

  // Apply filters
  useEffect(() => {
    let filtered = [...data];

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    filtered = filtered.filter((product) => {
      const price = product.discountPrice || product.originalPrice;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort(
          (a, b) =>
            (a.discountPrice || a.originalPrice) -
            (b.discountPrice || b.originalPrice)
        );
        break;
      case "price-high":
        filtered.sort(
          (a, b) =>
            (b.discountPrice || b.originalPrice) -
            (a.discountPrice || a.originalPrice)
        );
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        filtered.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
        break;
      default:
        break;
    }

    setFilteredData(filtered);
  }, [data, selectedCategory, priceRange, sortBy, searchTerm]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setPriceRange([0, 10000]);
    setSortBy("default");
    setSearchTerm("");
    setSearchParams({});
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <Header activeHeading={3} />

          {/* Main Content */}
          <div className="bg-gray-50 min-h-screen pt-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Page Header */}
              <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {selectedCategory ? selectedCategory : "All Products"}
                </h1>
                <p className="text-gray-600">
                  {filteredData.length} products found
                </p>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Filters */}
                <div
                  className={`lg:w-72 flex-shrink-0 ${
                    showFilters ? "block" : "hidden lg:block"
                  }`}
                >
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-24">
                    {/* Filter Header */}
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-base font-semibold text-gray-900 flex items-center">
                        <HiFilter className="w-4 h-4 mr-2" />
                        Filters
                      </h3>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={clearFilters}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Clear All
                        </button>
                        {/* Mobile Close Button */}
                        <button
                          onClick={() => setShowFilters(false)}
                          className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label="Close filters"
                        >
                          <HiX className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Search */}
                    <div className="mb-5">
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Search Products
                      </label>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name or description..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Category Filter */}
                    <div className="mb-5">
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Categories
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        <label className="flex items-center py-1">
                          <input
                            type="radio"
                            name="category"
                            checked={selectedCategory === ""}
                            onChange={() => handleCategoryChange("")}
                            className="w-3 h-3 text-blue-600"
                          />
                          <span className="ml-2 text-xs text-gray-700">
                            All Categories
                          </span>
                        </label>
                        {categoriesData.map((category) => (
                          <label
                            key={category.id}
                            className="flex items-center py-1"
                          >
                            <input
                              type="radio"
                              name="category"
                              checked={selectedCategory === category.title}
                              onChange={() =>
                                handleCategoryChange(category.title)
                              }
                              className="w-3 h-3 text-blue-600"
                            />
                            <span className="ml-2 text-xs text-gray-700">
                              {category.title}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Price Range Filter */}
                    <div className="mb-5">
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Price Range
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) =>
                              setPriceRange([
                                parseInt(e.target.value) || 0,
                                priceRange[1],
                              ])
                            }
                            placeholder="Min"
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
                          />
                          <span className="text-gray-500 text-xs">-</span>
                          <input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) =>
                              setPriceRange([
                                priceRange[0],
                                parseInt(e.target.value) || 10000,
                              ])
                            }
                            placeholder="Max"
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          ₹{priceRange[0]} - ₹{priceRange[1]}
                        </div>
                      </div>
                    </div>

                    {/* Sort Filter */}
                    <div className="mb-5">
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                      >
                        <option value="default">Default</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name">Name: A to Z</option>
                        <option value="rating">Highest Rated</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Main Product Area */}
                <div className="flex-1">
                  {/* Mobile Filter Toggle & View Controls */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm"
                    >
                      <HiAdjustments className="w-4 h-4 mr-2" />
                      Filters
                    </button>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600 hidden sm:block">
                        View:
                      </span>
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-colors ${
                          viewMode === "grid"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <HiViewGrid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-colors ${
                          viewMode === "list"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <HiViewList className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Products Grid */}
                  {filteredData && filteredData.length > 0 ? (
                    <div
                      className={`${
                        viewMode === "grid"
                          ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 auto-rows-fr"
                          : "space-y-4"
                      }`}
                    >
                      {filteredData.map((product, index) => (
                        <div key={index} className="h-full">
                          <ProductCard data={product} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                        <HiX className="w-6 h-6 text-gray-400" />
                      </div>
                      <h3 className="text-base font-medium text-gray-900 mb-2">
                        No products found
                      </h3>
                      <p className="text-gray-500 mb-4 text-sm">
                        Try adjusting your filters or search terms
                      </p>
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      )}
    </>
  );
};

export default ProductsPage;
