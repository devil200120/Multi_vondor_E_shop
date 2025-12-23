import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import Loader from "../components/Layout/Loader";
import ProductCard from "../components/Route/ProductCard/ProductCard";
import {
  getAllCategoriesPublic,
  getSubcategoriesPublic,
} from "../redux/actions/category";
import {
  HiAdjustments,
  HiX,
  HiFilter,
  HiViewGrid,
  HiViewList,
} from "react-icons/hi";

const ProductsPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryData = searchParams.get("category");
  const { allProducts, isLoading } = useSelector((state) => state.products);
  const { categories, subcategories, subcategoriesLoading, parentCategory } =
    useSelector((state) => state.categories);

  // Debug: Log the products when they change
  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      console.log("Products loaded from Redux:", allProducts.length);
      console.log(
        "First product from Redux:",
        JSON.stringify(allProducts[0], null, 2)
      );
    }
  }, [allProducts]);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(categoryData || "");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedParentCategory, setSelectedParentCategory] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(getAllCategoriesPublic());
  }, [dispatch]);

  // Use API categories - all categories including subcategories
  const allCategoriesData = useMemo(() => categories || [], [categories]);
  const rootCategories = useMemo(
    () => allCategoriesData.filter((cat) => !cat.parent),
    [allCategoriesData]
  );

  // Helper function to get all subcategory IDs for a given category
  const getAllSubcategoryIds = useCallback(
    (categoryName) => {
      console.log("Getting subcategory IDs for:", categoryName);
      console.log("Available categories:", allCategoriesData);

      const category = allCategoriesData.find(
        (cat) => cat.name === categoryName
      );
      console.log("Found category:", category);

      if (!category) return [];

      const subcategoryIds = [category._id];
      const subcategories = allCategoriesData.filter(
        (cat) => cat.parent === category._id
      );
      console.log("Found subcategories:", subcategories);

      subcategories.forEach((subcat) => {
        subcategoryIds.push(subcat._id);
        // Also get sub-subcategories if any
        const subSubcategories = allCategoriesData.filter(
          (cat) => cat.parent === subcat._id
        );
        subSubcategories.forEach((subSubcat) => {
          subcategoryIds.push(subSubcat._id);
        });
      });

      console.log("Final subcategory IDs:", subcategoryIds);
      return subcategoryIds;
    },
    [allCategoriesData]
  );

  useEffect(() => {
    if (categoryData === null) {
      const d = allProducts || [];
      console.log("No category filter, loading all products:", d.length);
      setData(d);
      setFilteredData(d); // Also set filteredData for all products
    } else {
      console.log("=== FILTERING BY CATEGORY ===");
      console.log("Category to filter:", categoryData);
      console.log(
        "Total products available:",
        allProducts ? allProducts.length : 0
      );

      if (!allProducts || allProducts.length === 0) {
        console.log("❌ No products available to filter");
        setData([]);
        setFilteredData([]); // Clear filteredData when no products available
        return;
      }

      // Get all category and subcategory IDs that should be included
      const allowedCategoryIds = getAllSubcategoryIds(categoryData);
      console.log("Allowed category IDs for filtering:", allowedCategoryIds);

      const d =
        allProducts &&
        allProducts.filter((product, index) => {
          console.log(`--- Product ${index + 1}: ${product.name} ---`);
          console.log("Product category:", product.category);

          // Handle different category formats
          if (typeof product.category === "string") {
            // Old format: category is stored as string name
            // Check if it matches the selected category directly
            if (product.category === categoryData) {
              console.log("✅ Direct string match found");
              return true;
            }

            // Check if this product's category is a subcategory of the selected category
            const productCategoryObj = allCategoriesData.find(
              (cat) => cat.name === product.category
            );
            if (
              productCategoryObj &&
              allowedCategoryIds.includes(productCategoryObj._id)
            ) {
              console.log(
                "✅ String category is subcategory of selected:",
                product.category
              );
              return true;
            }

            console.log("❌ String category doesn't match");
            return false;
          } else if (product.category && product.category._id) {
            // New format: category is populated object
            // Check if product's category ID matches directly
            if (allowedCategoryIds.includes(product.category._id)) {
              console.log("Direct ObjectId match found");
              return true;
            }

            // Check if product's category name matches
            if (product.category.name === categoryData) {
              console.log("Category name matches selected");
              return true;
            }

            // Check if product's category is a subcategory and its parent matches
            if (
              product.category.parent &&
              allowedCategoryIds.includes(product.category.parent)
            ) {
              console.log(
                "✅ Product category parent matches selected category"
              );
              console.log("Product category parent:", product.category.parent);
              console.log("Allowed category IDs:", allowedCategoryIds);
              console.log(
                "Parent in allowed list:",
                allowedCategoryIds.includes(product.category.parent)
              );
              return true;
            }

            // Add detailed debugging for why it's not matching
            console.log("❌ No match found for product:");
            console.log("  Product category ID:", product.category._id);
            console.log("  Product category name:", product.category.name);
            console.log("  Product category parent:", product.category.parent);
            console.log("  Selected category:", categoryData);
            console.log("  Allowed category IDs:", allowedCategoryIds);
            console.log(
              "  Direct ID match:",
              allowedCategoryIds.includes(product.category._id)
            );
            console.log(
              "  Name match:",
              product.category.name === categoryData
            );
            console.log(
              "  Parent match:",
              product.category.parent &&
                allowedCategoryIds.includes(product.category.parent)
            );

            return false;
          } else if (product.category && product.category.name) {
            // Partial object format
            const result = product.category.name === categoryData;
            console.log("Name comparison result:", result);
            return result;
          }

          console.log("❌ Product has undefined/invalid category");
          return false;
        });

      console.log("=== FILTERING COMPLETE ===");
      console.log("Filtered products count:", d ? d.length : 0);
      if (d && d.length > 0) {
        console.log(
          "Found products:",
          d.map((p) => p.name)
        );
      } else {
        console.log("No products found for this category");
      }
      console.log(
        "About to set data state with:",
        d ? d.length : 0,
        "products"
      );
      setData(d || []);

      // ALWAYS set filteredData regardless of whether products were found or not
      console.log(
        "Setting filteredData to URL filtering results:",
        d ? d.length : 0
      );
      setFilteredData(d || []);
    }
    // Don't set selectedCategory here to avoid double filtering with sidebar
    // setSelectedCategory(categoryData || "");
  }, [allProducts, categoryData, getAllSubcategoryIds, allCategoriesData]);

  // Apply filters
  useEffect(() => {
    // Don't run sidebar filtering if we have a URL category parameter
    // The URL filtering already handles this correctly
    if (categoryData) {
      console.log("=== SIDEBAR FILTERING SKIPPED ===");
      console.log("Reason: URL category parameter exists:", categoryData);
      console.log("Using URL filtering results instead");
      return;
    }

    // Don't run sidebar filtering if data is empty or not yet loaded
    if (!data || data.length === 0) {
      console.log("=== SIDEBAR FILTERING SKIPPED ===");
      console.log("Reason: data is empty or not loaded yet");
      console.log("Data length:", data ? data.length : "undefined");
      setFilteredData([]);
      return;
    }

    console.log("=== SIDEBAR FILTERING ===");
    console.log("Input data for sidebar filtering:", data ? data.length : 0);
    console.log("selectedCategory:", selectedCategory);
    console.log("selectedSubcategory:", selectedSubcategory);

    let filtered = [...(data || [])];
    console.log("Starting with filtered array:", filtered.length);

    // Category filter (including subcategory)
    const categoryToFilter = selectedSubcategory || selectedCategory;
    if (categoryToFilter) {
      console.log("Filtering by category:", categoryToFilter);
      // If it's a subcategory, filter exactly by that subcategory
      if (selectedSubcategory) {
        console.log("Filtering by subcategory");
        filtered = filtered.filter((product) => {
          if (typeof product.category === "string") {
            return product.category === categoryToFilter;
          } else if (product.category && product.category._id) {
            return product.category._id === categoryToFilter;
          } else if (product.category && product.category.name) {
            return product.category.name === categoryToFilter;
          }
          return false;
        });
      } else {
        // If it's a parent category, include all its subcategories
        const allowedCategoryIds = getAllSubcategoryIds(categoryToFilter);
        filtered = filtered.filter((product) => {
          if (typeof product.category === "string") {
            return product.category === categoryToFilter;
          } else if (product.category && product.category._id) {
            return allowedCategoryIds.includes(product.category._id);
          } else if (product.category && product.category.name) {
            return product.category.name === categoryToFilter;
          }
          return false;
        });
      }
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          (product.name &&
            product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (product.description &&
            product.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
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

    console.log("=== SIDEBAR FILTERING COMPLETE ===");
    console.log("Final filtered data:", filtered.length);
    if (filtered.length > 0) {
      console.log(
        "Final filtered products:",
        filtered.map((p) => p.name)
      );
    }
    setFilteredData(filtered);
  }, [
    data,
    selectedCategory,
    selectedSubcategory,
    priceRange,
    sortBy,
    searchTerm,
    getAllSubcategoryIds,
  ]);

  const handleCategoryChange = (category, categoryObj = null) => {
    setSelectedCategory(category);
    setSelectedSubcategory(""); // Reset subcategory when parent changes

    if (category && categoryObj) {
      // Set parent category and fetch subcategories
      setSelectedParentCategory(categoryObj);
      dispatch(getSubcategoriesPublic(categoryObj._id));
    } else {
      // Clear parent category and subcategories
      setSelectedParentCategory(null);
    }

    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setSelectedCategory(subcategory); // Use subcategory as the main filter
    if (subcategory) {
      setSearchParams({ category: subcategory });
    } else if (selectedParentCategory) {
      setSearchParams({ category: selectedParentCategory.name });
    } else {
      setSearchParams({});
    }
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedParentCategory(null);
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
          <Header activeHeading={2} />

          {/* Main Content */}
          <div className="bg-gray-50 min-h-screen pt-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Page Header */}
              <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {selectedCategory ? selectedCategory : "All Products"}
                </h1>
                <p className="text-gray-600">
                  {filteredData?.length || 0} products found
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
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        <label className="flex items-center py-1">
                          <input
                            type="radio"
                            name="category"
                            checked={
                              selectedCategory === "" &&
                              selectedSubcategory === ""
                            }
                            onChange={() => {
                              handleCategoryChange("");
                              setSelectedSubcategory("");
                              setSelectedParentCategory(null);
                            }}
                            className="w-3 h-3 text-blue-600"
                          />
                          <span className="ml-2 text-xs text-gray-700">
                            All Categories
                          </span>
                        </label>

                        {/* Root Categories */}
                        {rootCategories.map((category) => (
                          <div key={category._id || category.id}>
                            <label className="flex items-center py-1">
                              <input
                                type="radio"
                                name="category"
                                checked={
                                  selectedCategory ===
                                    (category.name || category.title) &&
                                  selectedSubcategory === ""
                                }
                                onChange={() =>
                                  handleCategoryChange(
                                    category.name || category.title,
                                    category
                                  )
                                }
                                className="w-3 h-3 text-blue-600"
                              />
                              <span className="ml-2 text-xs text-gray-700 font-medium">
                                {category.name || category.title}
                              </span>
                            </label>

                            {/* Show subcategories if this category is selected */}
                            {selectedParentCategory &&
                              selectedParentCategory._id === category._id && (
                                <div className="ml-4 mt-1 space-y-1">
                                  {subcategoriesLoading ? (
                                    <div className="text-xs text-gray-500 py-1">
                                      Loading subcategories...
                                    </div>
                                  ) : subcategories &&
                                    subcategories.length > 0 ? (
                                    <>
                                      <label className="flex items-center py-1">
                                        <input
                                          type="radio"
                                          name="subcategory"
                                          checked={
                                            selectedCategory ===
                                              (category.name ||
                                                category.title) &&
                                            selectedSubcategory === ""
                                          }
                                          onChange={() =>
                                            handleCategoryChange(
                                              category.name || category.title,
                                              category
                                            )
                                          }
                                          className="w-3 h-3 text-gray-400"
                                        />
                                        <span className="ml-2 text-xs text-gray-500 italic">
                                          All in{" "}
                                          {category.name || category.title}
                                        </span>
                                      </label>
                                      {subcategories.map((subcategory) => (
                                        <label
                                          key={subcategory._id}
                                          className="flex items-center py-1"
                                        >
                                          <input
                                            type="radio"
                                            name="subcategory"
                                            checked={
                                              selectedSubcategory ===
                                              (subcategory.name ||
                                                subcategory.title)
                                            }
                                            onChange={() =>
                                              handleSubcategoryChange(
                                                subcategory.name ||
                                                  subcategory.title
                                              )
                                            }
                                            className="w-3 h-3 text-blue-500"
                                          />
                                          <span className="ml-2 text-xs text-gray-600">
                                            {subcategory.name ||
                                              subcategory.title}
                                          </span>
                                        </label>
                                      ))}
                                    </>
                                  ) : selectedParentCategory._id ===
                                    category._id ? (
                                    <div className="text-xs text-gray-500 py-1 italic">
                                      No subcategories found
                                    </div>
                                  ) : null}
                                </div>
                              )}
                          </div>
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
