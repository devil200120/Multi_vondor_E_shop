import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllCategories,
  getCategoryStats,
  clearCategoryErrors,
  clearCategoryMessages,
} from "../../redux/actions/category";
import {
  HiOutlineViewGrid,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineCollection,
  HiOutlineRefresh,
} from "react-icons/hi";
import { Button } from "@material-ui/core";
import { toast } from "react-toastify";
import styles from "../../styles/styles";
import Loader from "../Layout/Loader";
import CategoryForm from "./CategoryForm";
import { getCategoryImageUrl } from "../../utils/mediaUtils";
import { backend_url } from "../../server";

const AdminCategoryManager = () => {
  const dispatch = useDispatch();
  const { categories, isLoading, error, message, stats, total } = useSelector(
    (state) => state.categories
  );

  // Local state
  const [view, setView] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [mounted, setMounted] = useState(false);

  // Initial load - simple and safe
  useEffect(() => {
    if (!mounted) {
      const params = {
        page: 1,
        limit: 10,
        includeInactive: true,
      };
      dispatch(getAllCategories(params));
      dispatch(getCategoryStats());
      setMounted(true);
    }
  }, [mounted, dispatch]);

  // Error handling - simple
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearCategoryErrors());
    }
  }, [error, dispatch]);

  // Message handling - simple without setTimeout
  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearCategoryMessages());
      // Simple reload trigger
      setMounted(false);
    }
  }, [message, dispatch]);

  const loadData = (searchTerm = "", pageNum = 1) => {
    const params = {
      page: pageNum,
      limit: pageSize,
      includeInactive: true,
    };
    if (searchTerm && searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    dispatch(getAllCategories(params));
  };

  const handleRefresh = () => {
    setMounted(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
    loadData(query, 1);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadData(searchQuery, newPage);
  };

  if (!mounted) {
    return <Loader />;
  }

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <HiOutlineCollection className="mr-2" />
            Category Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your product categories and subcategories
          </p>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outlined"
            onClick={handleRefresh}
            startIcon={<HiOutlineRefresh />}
            disabled={isLoading}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowForm(true)}
            startIcon={<HiOutlinePlus />}
            className={styles.button}
          >
            Add Category
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <HiOutlineCollection className="text-blue-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold">{stats.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <HiOutlineViewGrid className="text-green-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{stats.active || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <HiOutlineViewGrid className="text-red-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold">{stats.inactive || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <HiOutlineViewGrid className="text-purple-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Root Categories</p>
                <p className="text-2xl font-bold">
                  {stats.byLevel?.find((l) => l._id === 0)?.count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
            />
          </div>

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView("grid")}
              className={`px-3 py-1 rounded text-sm ${
                view === "grid"
                  ? "bg-white shadow text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <HiOutlineViewGrid className="inline mr-1" />
              Grid
            </button>
            <button
              onClick={() => setView("tree")}
              className={`px-3 py-1 rounded text-sm ${
                view === "tree"
                  ? "bg-white shadow text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <HiOutlineCollection className="inline mr-1" />
              Tree
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="space-y-4">
            {categories.map((category) => {
              console.log("Category data:", category);
              console.log("Category image:", category.image);
              console.log(
                "Image URL result:",
                getCategoryImageUrl(category.image, backend_url)
              );

              return (
                <div key={category._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {category.image && (
                        <img
                          src={getCategoryImageUrl(category.image, backend_url)}
                          alt={category.name}
                          className="w-12 h-12 rounded object-cover mr-4"
                          onError={(e) => {
                            console.log("Image failed to load:", e.target.src);
                            console.log("Image data:", category.image);
                          }}
                          onLoad={() => {
                            console.log(
                              "Image loaded successfully:",
                              getCategoryImageUrl(category.image, backend_url)
                            );
                          }}
                        />
                      )}
                      {!category.image && (
                        <div className="w-12 h-12 bg-gray-200 rounded mr-4 flex items-center justify-center text-gray-500 text-xs">
                          No Image
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Level {category.level} • {category.productCount || 0}{" "}
                          products
                        </p>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {category.description}
                          </p>
                        )}
                        {category.parent && (
                          <p className="text-xs text-blue-600 mt-1">
                            Parent: {category.parent.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          category.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setEditingCategory(category);
                          setShowForm(true);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Showing {categories.length} of {total || 0} categories
              </p>
              <div className="flex space-x-2">
                <Button
                  size="small"
                  variant="outlined"
                  disabled={page <= 1 || isLoading}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  Page {page}
                </span>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={categories.length < pageSize || isLoading}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <HiOutlineCollection className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No categories
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first category.
            </p>
            <div className="mt-6">
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowForm(true)}
                startIcon={<HiOutlinePlus />}
              >
                Add Category
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          open={showForm}
          onClose={handleFormClose}
          category={editingCategory}
        />
      )}
    </div>
  );
};

export default AdminCategoryManager;
