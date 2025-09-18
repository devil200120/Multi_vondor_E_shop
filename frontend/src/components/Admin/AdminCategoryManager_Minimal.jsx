import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HiOutlineCollection, HiOutlinePlus } from "react-icons/hi";
import { Button } from "@material-ui/core";
import { toast } from "react-toastify";
import Loader from "../Layout/Loader";

const AdminCategoryManager = () => {
  const dispatch = useDispatch();
  const { categories, isLoading, error } = useSelector(
    (state) => state.categories
  );

  const [showForm, setShowForm] = useState(false);

  // Simple handler to show success message
  const handleAddCategory = () => {
    setShowForm(true);
    toast.success("Add category form will be implemented here");
  };

  if (isLoading) {
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
            variant="contained"
            color="primary"
            onClick={handleAddCategory}
            startIcon={<HiOutlinePlus />}
          >
            Add Category
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <HiOutlineCollection className="text-blue-500 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Categories</p>
              <p className="text-2xl font-bold">{categories?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <HiOutlineCollection className="text-green-500 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold">
                {categories?.filter((cat) => cat.isActive)?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <HiOutlineCollection className="text-red-500 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold">
                {categories?.filter((cat) => !cat.isActive)?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <HiOutlineCollection className="text-purple-500 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Root Categories</p>
              <p className="text-2xl font-bold">
                {categories?.filter((cat) => !cat.parent)?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
        )}

        <div className="text-center py-8">
          <HiOutlineCollection className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No categories yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first category.
          </p>
          <div className="mt-6">
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddCategory}
              startIcon={<HiOutlinePlus />}
            >
              Add Category
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategoryManager;
