import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllCategories,
  getCategoryStats,
  clearCategoryErrors,
  clearCategoryMessages,
  deleteCategory,
} from "../../redux/actions/category";
import {
  HiOutlineViewGrid,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineCollection,
  HiOutlineRefresh,
  HiOutlineTag,
  HiOutlineX,
} from "react-icons/hi";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiGrid,
  FiList,
  FiAlertTriangle,
} from "react-icons/fi";
import { MdCategory, MdVerified, MdBlock } from "react-icons/md";
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModalAnimating, setDeleteModalAnimating] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteForce, setDeleteForce] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setDeleteForce(false);
    setDeleteModalOpen(true);
    setTimeout(() => setDeleteModalAnimating(true), 10);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteCategory(categoryToDelete._id, deleteForce));
      setDeleteModalAnimating(false);
      setTimeout(() => {
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
        setDeleteForce(false);
      }, 300);
      // Data will be reloaded via message effect
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModalAnimating(false);
    setTimeout(() => {
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      setDeleteForce(false);
    }, 300);
  };

  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full p-4 800px:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <MdCategory className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl 800px:text-3xl font-bold text-gray-900">
              Categories
            </h1>
            <p className="text-gray-600">
              Manage product categories and organize your inventory
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col 400px:flex-row gap-3 400px:justify-end mt-4">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-unacademy hover:shadow-unacademy-md"
          >
            <HiOutlineRefresh className="mr-2 h-4 w-4" />
            Refresh
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-unacademy hover:shadow-unacademy-lg transform hover:-translate-y-0.5"
          >
            <HiOutlinePlus className="mr-2 h-4 w-4" />
            Add Category
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 400px:grid-cols-2 800px:grid-cols-4 gap-4 800px:gap-6 mb-6">
          <div className={`${styles.card} ${styles.card_padding}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Categories
                </p>
                <p className="text-2xl font-bold text-indigo-600">
                  {stats.total || 0}
                </p>
                <div className="flex items-center mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    All Categories
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <MdCategory className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.card_padding}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active || 0}
                </p>
                <div className="flex items-center mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Published
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MdVerified className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.card_padding}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.inactive || 0}
                </p>
                <div className="flex items-center mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Unpublished
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <MdBlock className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.card_padding}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Root Categories
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.byLevel?.find((l) => l._id === 0)?.count || 0}
                </p>
                <div className="flex items-center mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Main Categories
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <HiOutlineTag className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className={`${styles.card} p-4 mb-6`}>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search categories by name, description..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className={styles.input}
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
      </div>

      {/* View Toggle & Categories List */}
      <div className={`${styles.card} overflow-hidden`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between flex-col 400px:flex-row gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <MdCategory className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Categories List
                </h2>
                <p className="text-sm text-gray-500">
                  {categories?.length || 0} categor
                  {categories?.length !== 1 ? "ies" : "y"} found
                </p>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView("grid")}
                className={`px-3 py-1 rounded text-sm transition-all duration-200 flex items-center ${
                  view === "grid"
                    ? "bg-white shadow-unacademy text-primary-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FiGrid className="mr-1 h-4 w-4" />
                Grid
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-3 py-1 rounded text-sm transition-all duration-200 flex items-center ${
                  view === "list"
                    ? "bg-white shadow-unacademy text-primary-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FiList className="mr-1 h-4 w-4" />
                List
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          ) : categories && categories.length > 0 ? (
            <div
              className={
                view === "grid"
                  ? "grid grid-cols-1 400px:grid-cols-2 800px:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {categories.map((category) => (
                <div
                  key={category._id}
                  className={`border border-gray-200 rounded-xl transition-all duration-200 hover:shadow-unacademy-md hover:border-primary-200 ${
                    view === "grid"
                      ? "p-4"
                      : "p-4 flex items-center justify-between"
                  }`}
                >
                  <div
                    className={`${
                      view === "grid"
                        ? "text-center"
                        : "flex items-center flex-1"
                    }`}
                  >
                    {/* Category Image */}
                    <div
                      className={`${
                        view === "grid" ? "mx-auto mb-4" : "mr-4"
                      } flex-shrink-0`}
                    >
                      {category.image ? (
                        <img
                          src={getCategoryImageUrl(category.image, backend_url)}
                          alt={category.name}
                          className={`${
                            view === "grid" ? "w-20 h-20" : "w-12 h-12"
                          } rounded-lg object-cover border-2 border-gray-200`}
                          onError={(e) => {
                            console.log("Image failed to load:", e.target.src);
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`${
                          view === "grid" ? "w-20 h-20" : "w-12 h-12"
                        } ${
                          category.image ? "hidden" : "flex"
                        } bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg items-center justify-center border-2 border-dashed border-indigo-300`}
                      >
                        <MdCategory
                          className={`${
                            view === "grid" ? "h-8 w-8" : "h-6 w-6"
                          } text-indigo-500`}
                        />
                      </div>
                    </div>

                    {/* Category Info */}
                    <div
                      className={`${
                        view === "grid" ? "text-center" : "flex-1"
                      }`}
                    >
                      <h3
                        className={`font-semibold text-gray-900 ${
                          view === "grid" ? "text-lg mb-2" : "text-base mb-1"
                        }`}
                      >
                        {category.name}
                      </h3>

                      <div
                        className={`${
                          view === "grid"
                            ? "space-y-2 mb-4"
                            : "flex items-center space-x-4 mb-2"
                        }`}
                      >
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            category.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>

                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Level {category.level}
                        </span>

                        <span className="text-sm text-gray-500">
                          {category.productCount || 0} products
                        </span>
                      </div>

                      {category.description && (
                        <p
                          className={`text-gray-600 ${
                            view === "grid" ? "text-sm mb-4" : "text-xs mb-2"
                          } line-clamp-2`}
                        >
                          {category.description}
                        </p>
                      )}

                      {category.parent && (
                        <p className="text-xs text-primary-600 font-medium">
                          Parent: {category.parent.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className={`${
                      view === "grid"
                        ? "flex justify-center space-x-2 pt-4 border-t border-gray-100"
                        : "flex space-x-2 ml-4"
                    }`}
                  >
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setShowForm(true);
                      }}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                      title="Edit Category"
                    >
                      <FiEdit2 size={16} />
                    </button>

                    <button
                      onClick={() => openDeleteModal(category)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete Category"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <MdCategory className="h-10 w-10 text-indigo-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No categories found
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery
                  ? `No categories match your search "${searchQuery}". Try a different search term.`
                  : "Get started by creating your first product category to organize your inventory."}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-unacademy hover:shadow-unacademy-lg transform hover:-translate-y-0.5"
              >
                <HiOutlinePlus className="mr-2 h-5 w-5" />
                Create First Category
              </button>
            </div>
          )}

          {/* Pagination */}
          {categories && categories.length > 0 && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 flex-col 400px:flex-row gap-4">
              <p className="text-sm text-gray-600">
                Showing {categories.length} of {total || 0} categories
              </p>
              <div className="flex space-x-2">
                <button
                  disabled={page <= 1 || isLoading}
                  onClick={() => handlePageChange(page - 1)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg">
                  Page {page}
                </span>
                <button
                  disabled={categories.length < pageSize || isLoading}
                  onClick={() => handlePageChange(page + 1)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          open={showForm}
          onClose={handleFormClose}
          category={editingCategory}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && categoryToDelete && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            deleteModalAnimating
              ? "bg-black bg-opacity-50"
              : "bg-black bg-opacity-0"
          }`}
        >
          <div
            className={`bg-white rounded-xl shadow-unacademy-xl w-full max-w-md transition-all duration-300 transform ${
              deleteModalAnimating
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-4"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <FiAlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Delete Category
                  </h2>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <button
                onClick={closeDeleteModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                disabled={isDeleting}
              >
                <HiOutlineX className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-800 mb-2">
                  Are you sure you want to delete{" "}
                  <strong>"{categoryToDelete.name}"</strong>?
                </p>

                {categoryToDelete.productCount > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="flex">
                      <FiAlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          This category has {categoryToDelete.productCount}{" "}
                          associated products
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Products will lose their category assignment if you
                          proceed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex">
                    <FiAlertTriangle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800 mb-2">
                        Force Delete Options:
                      </p>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={deleteForce}
                          onChange={(e) => setDeleteForce(e.target.checked)}
                          className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                          disabled={isDeleting}
                        />
                        <span className="ml-2 text-sm text-red-700">
                          Force delete (removes subcategories and product
                          associations)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-all duration-200 shadow-unacademy hover:shadow-unacademy-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <FiTrash2 className="h-4 w-4" />
                    <span>Delete Category</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoryManager;
