import React, { useEffect, useState } from "react";
import {
  AiOutlineDelete,
  AiOutlineEye,
  AiOutlinePlus,
  AiOutlineSearch,
  AiOutlineFilter,
  AiOutlineArrowRight,
  AiOutlineEdit,
} from "react-icons/ai";
import { FiPackage, FiAlertTriangle } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllProductsShop } from "../../redux/actions/product";
import { deleteProduct } from "../../redux/actions/product";
import Loader from "../Layout/Loader";
import { DataGrid } from "@material-ui/data-grid";
import { toast } from "react-toastify";
import { useCurrency } from "../../context/CurrencyContext";

const AllProducts = () => {
  const { products, isLoading, message, error } = useSelector(
    (state) => state.products
  );
  const { seller } = useSelector((state) => state.seller);
  const { formatPrice } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStock, setFilterStock] = useState("all");

  const dispatch = useDispatch();

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllProductsShop(seller._id));
    }
  }, [dispatch, seller?._id]);

  // Handle delete success/error messages
  useEffect(() => {
    if (message) {
      toast.success(message);
      // Clear the message after showing
      dispatch({ type: "clearMessages" });
    }
    if (error) {
      toast.error(error);
      // Clear the error after showing
      dispatch({ type: "clearMessages" });
    }
  }, [message, error, dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await dispatch(deleteProduct(id));
        // Success message will be handled by useEffect when message state updates
      } catch (error) {
        // Error message will be handled by useEffect when error state updates
        console.error("Delete failed:", error);
      }
    }
  };

  const columns = [
    {
      field: "id",
      headerName: "Product ID",
      minWidth: 120,
      flex: 0.6,
      renderCell: (params) => (
        <span className="text-gray-600 text-xs font-mono">
          #{params.value.slice(-6)}
        </span>
      ),
    },
    {
      field: "name",
      headerName: "Product Name",
      minWidth: 200,
      flex: 1.2,
      renderCell: (params) => (
        <div className="flex items-center space-x-2 py-1">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FiPackage className="text-blue-600" size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-900 truncate text-sm">
              {params.value}
            </p>
          </div>
        </div>
      ),
    },
    {
      field: "price",
      headerName: "Price",
      minWidth: 80,
      flex: 0.5,
      renderCell: (params) => (
        <span className="font-bold text-green-600 text-sm">{params.value}</span>
      ),
    },
    {
      field: "Stock",
      headerName: "Stock",
      type: "number",
      minWidth: 70,
      flex: 0.4,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${
            params.value > 10
              ? "bg-green-100 text-green-800"
              : params.value > 0
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "approvalStatus",
      headerName: "Status",
      minWidth: 100,
      flex: 0.5,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${
            params.value === "approved"
              ? "bg-green-100 text-green-800"
              : params.value === "rejected"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {params.value === "approved"
            ? "Approved"
            : params.value === "rejected"
            ? "Rejected"
            : "Pending"}
        </span>
      ),
    },
    {
      field: "sold",
      headerName: "Sold",
      type: "number",
      minWidth: 60,
      flex: 0.4,
      renderCell: (params) => (
        <span className="text-gray-600 font-bold text-sm">
          {params.value || 0}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center space-x-1">
          <Link
            to={`/product/${params.row.id}`}
            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all duration-200 transform hover:scale-110"
            title="View Product"
          >
            <AiOutlineEye size={14} />
          </Link>
          <Link
            to={`/dashboard-edit-product/${params.row.id}`}
            className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-all duration-200 transform hover:scale-110"
            title="Edit Product"
          >
            <AiOutlineEdit size={14} />
          </Link>
          <button
            onClick={() => handleDelete(params.row.id)}
            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all duration-200 transform hover:scale-110"
            title="Delete Product"
          >
            <AiOutlineDelete size={14} />
          </button>
        </div>
      ),
    },
  ];

  const row = [];

  let filteredProducts =
    products?.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Apply stock filter
  if (filterStock === "low") {
    filteredProducts = filteredProducts.filter(
      (p) => p.stock < 10 && p.stock > 0
    );
  } else if (filterStock === "out") {
    filteredProducts = filteredProducts.filter((p) => p.stock === 0);
  }

  filteredProducts.forEach((item) => {
    row.push({
      id: item._id,
      name: item.name,
      price: formatPrice(item.discountPrice),
      Stock: item.stock,
      approvalStatus: item.approvalStatus || "pending",
      sold: item.sold_out,
    });
  });

  // Mobile Product Card Component
  const MobileProductCard = ({ product }) => (
    <div className="bg-white rounded-2xl border border-gray-200/50 p-4 hover:shadow-lg transition-all duration-200 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <FiPackage className="text-blue-600" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 truncate text-sm">
              {product.name}
            </h3>
            <p className="text-xs text-gray-500">#{product._id.slice(-6)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Link
            to={`/product/${product._id}`}
            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all duration-200 transform hover:scale-110"
          >
            <AiOutlineEye size={16} />
          </Link>
          <Link
            to={`/dashboard-edit-product/${product._id}`}
            className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-all duration-200 transform hover:scale-110"
          >
            <AiOutlineEdit size={16} />
          </Link>
          <button
            onClick={() => handleDelete(product._id)}
            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all duration-200 transform hover:scale-110"
          >
            <AiOutlineDelete size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 font-medium">Price</p>
          <p className="font-bold text-green-600 text-sm">
            {formatPrice(product.discountPrice)}
          </p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 font-medium">Stock</p>
          <p
            className={`font-bold text-sm ${
              product.stock > 10
                ? "text-green-600"
                : product.stock > 0
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {product.stock}
          </p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 font-medium">Sold</p>
          <p className="font-bold text-gray-600 text-sm">
            {product.sold_out || 0}
          </p>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 p-3 md:p-6 ">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiPackage className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                  All Products
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  Manage your product inventory
                </p>
              </div>
            </div>
            <Link
              to="/dashboard-create-product"
              className="inline-flex items-center justify-center px-4 md:px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <AiOutlinePlus className="mr-2" size={18} />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="relative flex-1">
              <AiOutlineSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
              />
            </div>
            <div className="relative">
              <AiOutlineFilter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md min-w-[140px]"
              >
                <option value="all">All Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 md:p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Total Products
                </p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  {products?.length || 0}
                </p>
              </div>
              <div className="p-2 md:p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl">
                <FiPackage className="text-blue-600 w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 md:p-6 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Low Stock
                </p>
                <p className="text-xl md:text-2xl font-bold text-red-600">
                  {products?.filter((p) => p.stock < 10 && p.stock > 0)
                    .length || 0}
                </p>
              </div>
              <div className="p-2 md:p-3 bg-gradient-to-r from-red-100 to-red-200 rounded-xl">
                <FiAlertTriangle className="text-red-600 w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 md:p-6 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 transform hover:scale-105 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Out of Stock
                </p>
                <p className="text-xl md:text-2xl font-bold text-orange-600">
                  {products?.filter((p) => p.stock === 0).length || 0}
                </p>
              </div>
              <div className="p-2 md:p-3 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl">
                <AiOutlineDelete className="text-orange-600 w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Products Table/Cards */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden shadow-xl">
          <div className="p-4 md:p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50/50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FiPackage className="text-white" size={18} />
                </div>
                <span>Product Inventory</span>
              </h2>
              <span className="text-sm font-bold text-gray-500">
                {filteredProducts.length} products
              </span>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <div style={{ height: 500, width: "100%" }}>
              <DataGrid
                rows={row}
                columns={columns}
                pageSize={8}
                disableSelectionOnClick
                autoHeight
                className="border-0"
                style={{
                  border: "none",
                  "& .MuiDataGrid-cell": {
                    borderBottom: "1px solid #f1f5f9",
                    padding: "8px 12px",
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    fontSize: "13px",
                    fontWeight: 700,
                  },
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "#f8fafc",
                  },
                }}
              />
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-3">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <MobileProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiPackage className="text-gray-400" size={24} />
                </div>
                <p className="text-gray-500 font-medium mb-2">
                  No products found
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  {searchTerm || filterStock !== "all"
                    ? "Try adjusting your search or filter"
                    : "Start by adding your first product"}
                </p>
                {!searchTerm && filterStock === "all" && (
                  <Link
                    to="/dashboard-create-product"
                    className="inline-flex items-center space-x-2 text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors"
                  >
                    <span>Create your first product</span>
                    <AiOutlineArrowRight size={14} />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;
