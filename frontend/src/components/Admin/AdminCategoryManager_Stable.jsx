import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllCategories,
  getCategoryTree,
  deleteCategory,
  toggleCategoryStatus,
  bulkCategoryAction,
  getCategoryStats,
  clearCategoryErrors,
  clearCategoryMessages,
  setSelectedCategory,
} from "../../redux/actions/category";
import {
  HiOutlineViewGrid,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineCollection,
  HiOutlineRefresh,
} from "react-icons/hi";
import { DataGrid } from "@material-ui/data-grid";
import {
  Button,
  IconButton,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
} from "@material-ui/core";
import { toast } from "react-toastify";
import styles from "../../styles/styles";
import Loader from "../Layout/Loader";
import CategoryForm from "./CategoryForm";
import { backend_url } from "../../server";

const AdminCategoryManager = () => {
  const dispatch = useDispatch();
  const {
    categories,
    categoryTree,
    isLoading,
    error,
    message,
    stats,
    total,
    currentPage,
  } = useSelector((state) => state.categories);

  // Local state
  const [view, setView] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [filters, setFilters] = useState({
    level: "",
    isActive: "",
    parentId: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortModel, setSortModel] = useState([
    { field: "sortOrder", sort: "asc" },
  ]);

  // Use refs to track if we've already loaded initial data
  const initialLoadDone = useRef(false);
  const lastMessageRef = useRef(null);
  const lastErrorRef = useRef(null);

  // Stable load function
  const loadData = useCallback(() => {
    const params = {
      page: page || 1,
      limit: pageSize || 10,
      includeInactive: true,
    };

    if (searchQuery && searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    if (filters.level && filters.level !== "") {
      params.level = filters.level;
    }

    if (filters.isActive && filters.isActive !== "") {
      params.isActive = filters.isActive;
    }

    if (filters.parentId && filters.parentId !== "") {
      params.parentId = filters.parentId;
    }

    if (sortModel.length > 0) {
      params.sort = `${sortModel[0].field}:${sortModel[0].sort}`;
    }

    dispatch(getAllCategories(params));
    dispatch(getCategoryStats());

    if (view === "tree") {
      dispatch(getCategoryTree());
    }
  }, [
    dispatch,
    page,
    pageSize,
    searchQuery,
    filters.level,
    filters.isActive,
    filters.parentId,
    sortModel,
    view,
  ]);

  // Initial load only once
  useEffect(() => {
    if (!initialLoadDone.current) {
      loadData();
      initialLoadDone.current = true;
    }
  }, [loadData]);

  // Handle messages and errors with refs to prevent loops
  useEffect(() => {
    if (error && error !== lastErrorRef.current) {
      toast.error(error);
      dispatch(clearCategoryErrors());
      lastErrorRef.current = error;
    }

    if (message && message !== lastMessageRef.current) {
      toast.success(message);
      dispatch(clearCategoryMessages());
      lastMessageRef.current = message;
      // Reload data after successful operations
      setTimeout(() => {
        loadData();
      }, 500);
    }
  }, [error, message, dispatch, loadData]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const handleCategoryEdit = useCallback(
    (category) => {
      setEditingCategory(category);
      dispatch(setSelectedCategory(category));
      setShowForm(true);
    },
    [dispatch]
  );

  const handleCategoryDelete = useCallback(
    async (categoryId) => {
      if (window.confirm("Are you sure you want to delete this category?")) {
        dispatch(deleteCategory(categoryId));
      }
    },
    [dispatch]
  );

  const handleToggleStatus = useCallback(
    (categoryId) => {
      dispatch(toggleCategoryStatus(categoryId));
    },
    [dispatch]
  );

  const handleBulkAction = useCallback(
    (action) => {
      if (selectedCategories.length === 0) {
        toast.error("Please select categories first");
        return;
      }

      const confirmMessages = {
        activate: "Are you sure you want to activate selected categories?",
        deactivate: "Are you sure you want to deactivate selected categories?",
        delete: "Are you sure you want to delete selected categories?",
      };

      if (window.confirm(confirmMessages[action])) {
        dispatch(bulkCategoryAction(action, selectedCategories));
        setSelectedCategories([]);
      }
    },
    [dispatch, selectedCategories]
  );

  const handleFormClose = useCallback(() => {
    setShowForm(false);
    setEditingCategory(null);
    dispatch(setSelectedCategory(null));
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    loadData();
  }, [loadData]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage + 1);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setPage(1);
  }, []);

  const handleSortModelChange = useCallback((newSortModel) => {
    setSortModel(newSortModel);
  }, []);

  const handleViewChange = useCallback((newView) => {
    setView(newView);
  }, []);

  // Trigger reload when page, pageSize, sortModel changes
  useEffect(() => {
    if (initialLoadDone.current) {
      const timer = setTimeout(() => {
        loadData();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [page, pageSize, sortModel, loadData]);

  // Trigger reload when search query changes (with debounce)
  useEffect(() => {
    if (initialLoadDone.current) {
      const timer = setTimeout(() => {
        loadData();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, loadData]);

  // Trigger reload when filters change
  useEffect(() => {
    if (initialLoadDone.current) {
      const timer = setTimeout(() => {
        loadData();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [filters.level, filters.isActive, filters.parentId, loadData]);

  // Tree view component
  const CategoryTreeNode = ({ category, level = 0 }) => {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div className={`category-tree-node ${level > 0 ? "ml-6" : ""}`}>
        <div
          className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          {hasChildren && (
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              className="mr-2"
            >
              {expanded ? <HiOutlineChevronDown /> : <HiOutlineChevronRight />}
            </IconButton>
          )}

          <div className="flex items-center flex-1">
            {category.image && (
              <img
                src={`${backend_url}${category.image}`}
                alt={category.name}
                className="w-8 h-8 rounded object-cover mr-3"
              />
            )}
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{category.name}</h4>
              <p className="text-sm text-gray-500">
                Level {category.level} • {category.productCount || 0} products
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Chip
                label={category.isActive ? "Active" : "Inactive"}
                color={category.isActive ? "primary" : "default"}
                size="small"
              />

              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => handleCategoryEdit(category)}
                >
                  <HiOutlinePencil />
                </IconButton>
              </Tooltip>

              <Tooltip title={category.isActive ? "Deactivate" : "Activate"}>
                <IconButton
                  size="small"
                  onClick={() => handleToggleStatus(category._id)}
                >
                  {category.isActive ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={() => handleCategoryDelete(category._id)}
                  color="secondary"
                >
                  <HiOutlineTrash />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </div>

        {expanded && hasChildren && (
          <div className="category-children">
            {category.children.map((child) => (
              <CategoryTreeNode
                key={child._id}
                category={child}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Grid columns
  const columns = [
    {
      field: "name",
      headerName: "Category Name",
      width: 250,
      renderCell: (params) => (
        <div className="flex items-center">
          {params.row.image && (
            <img
              src={params.row.image}
              alt={params.row.name}
              className="w-8 h-8 rounded object-cover mr-2"
            />
          )}
          <div>
            <div className="font-medium">{params.row.name}</div>
            <div className="text-sm text-gray-500">
              Level {params.row.level}
            </div>
          </div>
        </div>
      ),
    },
    {
      field: "parent",
      headerName: "Parent Category",
      width: 200,
      renderCell: (params) => params.row.parent?.name || "Root Category",
    },
    {
      field: "productCount",
      headerName: "Products",
      width: 100,
      align: "center",
      renderCell: (params) => params.row.productCount || 0,
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.isActive ? "Active" : "Inactive"}
          color={params.row.isActive ? "primary" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "sortOrder",
      headerName: "Sort Order",
      width: 120,
      align: "center",
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 150,
      renderCell: (params) =>
        new Date(params.row.createdAt).toLocaleDateString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <div className="flex space-x-1">
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleCategoryEdit(params.row)}
            >
              <HiOutlinePencil />
            </IconButton>
          </Tooltip>

          <Tooltip title={params.row.isActive ? "Deactivate" : "Activate"}>
            <IconButton
              size="small"
              onClick={() => handleToggleStatus(params.row._id)}
            >
              {params.row.isActive ? <HiOutlineEyeOff /> : <HiOutlineEye />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleCategoryDelete(params.row._id)}
              color="secondary"
            >
              <HiOutlineTrash />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  if (isLoading && !initialLoadDone.current) {
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
              <HiOutlineEye className="text-green-500 text-2xl mr-3" />
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{stats.active || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <HiOutlineEyeOff className="text-red-500 text-2xl mr-3" />
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
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
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

            {/* Level Filter */}
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange("level", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Levels</option>
              <option value="0">Root Categories</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange("isActive", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* View Toggle and Actions */}
          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleViewChange("grid")}
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
                onClick={() => handleViewChange("tree")}
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

            {/* Bulk Actions */}
            {selectedCategories.length > 0 && (
              <div className="flex space-x-2">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                  Bulk Actions ({selectedCategories.length})
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem
                    onClick={() => {
                      handleBulkAction("activate");
                      setAnchorEl(null);
                    }}
                  >
                    Activate
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleBulkAction("deactivate");
                      setAnchorEl(null);
                    }}
                  >
                    Deactivate
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleBulkAction("delete");
                      setAnchorEl(null);
                    }}
                  >
                    Delete
                  </MenuItem>
                </Menu>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        {view === "grid" ? (
          <div style={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={categories || []}
              columns={columns}
              pageSize={pageSize}
              rowsPerPageOptions={[5, 10, 25, 50]}
              checkboxSelection
              disableSelectionOnClick
              loading={isLoading}
              pagination
              paginationMode="server"
              rowCount={total || 0}
              page={currentPage ? currentPage - 1 : 0}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSelectionModelChange={setSelectedCategories}
              sortingMode="server"
              sortModel={sortModel}
              onSortModelChange={handleSortModelChange}
              getRowId={(row) => row._id}
              className="border-0"
            />
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {categoryTree && categoryTree.length > 0 ? (
              categoryTree.map((category) => (
                <CategoryTreeNode key={category._id} category={category} />
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                {isLoading ? "Loading categories..." : "No categories found"}
              </div>
            )}
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
