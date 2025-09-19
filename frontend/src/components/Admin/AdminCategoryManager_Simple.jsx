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
  const [dataLoaded, setDataLoaded] = useState(false);

  // Initial load only - no dependencies to prevent loops
  useEffect(() => {
    if (!dataLoaded) {
      const params = {
        page: 1,
        limit: 10,
        includeInactive: true,
      };
      dispatch(getAllCategories(params));
      dispatch(getCategoryStats());
      setDataLoaded(true);
    }
  }, [dataLoaded, dispatch]);

  // Handle messages and errors - separate useEffect
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearCategoryErrors());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearCategoryMessages());
      // Reload after success
      setTimeout(() => {
        setDataLoaded(false);
      }, 1000);
    }
  }, [message, dispatch]);

  const handleRefresh = () => {
    setDataLoaded(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Debounce search
    setTimeout(() => {
      const params = {
        page: 1,
        limit: pageSize,
        includeInactive: true,
      };
      if (query.trim()) {
        params.search = query.trim();
      }
      dispatch(getAllCategories(params));
    }, 500);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  if (isLoading && !dataLoaded) {
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
            {categories.map((category) => (
              <div key={category._id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {category.image && (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-12 h-12 rounded object-cover mr-4"
                      />
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
            ))}

            {/* Pagination Info */}
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-600">
                Showing {categories.length} of {total || 0} categories
              </p>
              <div className="flex space-x-2">
                <Button
                  size="small"
                  variant="outlined"
                  disabled={page <= 1 || isLoading}
                  onClick={() => {
                    const newPage = page - 1;
                    setPage(newPage);
                    const params = {
                      page: newPage,
                      limit: pageSize,
                      includeInactive: true,
                    };
                    if (searchQuery.trim()) {
                      params.search = searchQuery.trim();
                    }
                    dispatch(getAllCategories(params));
                  }}
                >
                  Previous
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={categories.length < pageSize || isLoading}
                  onClick={() => {
                    const newPage = page + 1;
                    setPage(newPage);
                    const params = {
                      page: newPage,
                      limit: pageSize,
                      includeInactive: true,
                    };
                    if (searchQuery.trim()) {
                      params.search = searchQuery.trim();
                    }
                    dispatch(getAllCategories(params));
                  }}
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
