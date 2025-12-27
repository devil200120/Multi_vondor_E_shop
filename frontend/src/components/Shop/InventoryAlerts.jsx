import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { HiExclamationCircle, HiExclamation } from "react-icons/hi";
import { AiOutlineLoading3Quarters, AiOutlineEdit } from "react-icons/ai";
import { FiPackage } from "react-icons/fi";

const InventoryAlerts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState(null);
  const [newStock, setNewStock] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(
        `${server}/product/get-all-products-shop`,
        {
          withCredentials: true,
        }
      );
      setProducts(data.products);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const calculateStockPercentage = (product) => {
    if (!product.inventoryAlerts?.baselineStock) return 100;
    return (product.stock / product.inventoryAlerts.baselineStock) * 100;
  };

  const getAlertStatus = (product) => {
    const percentage = calculateStockPercentage(product);
    if (percentage <= product.inventoryAlerts?.criticalStockThreshold)
      return "critical";
    if (percentage <= product.inventoryAlerts?.lowStockThreshold) return "low";
    return "normal";
  };

  const filteredProducts = products.filter((product) => {
    const status = getAlertStatus(product);
    if (filter === "all") return status !== "normal";
    return status === filter;
  });

  const handleUpdateStock = async (productId) => {
    if (!newStock || newStock <= 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }

    setUpdating(true);
    try {
      const { data } = await axios.put(
        `${server}/product/update-product-stock/${productId}`,
        { stock: parseInt(newStock) },
        { withCredentials: true }
      );

      toast.success("Stock updated successfully!");
      setEditingProduct(null);
      setNewStock("");
      fetchProducts(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update stock");
    } finally {
      setUpdating(false);
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setNewStock(product.stock.toString());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <AiOutlineLoading3Quarters className="animate-spin text-4xl text-primary-600" />
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiPackage className="text-primary-600" />
            Inventory Alerts
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Monitor and manage your product stock levels
          </p>
        </div>
        <button
          onClick={fetchProducts}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <AlertCard
          title="Critical Stock"
          count={
            products.filter((p) => getAlertStatus(p) === "critical").length
          }
          color="red"
          icon={<HiExclamationCircle className="w-6 h-6" />}
        />
        <AlertCard
          title="Low Stock"
          count={products.filter((p) => getAlertStatus(p) === "low").length}
          color="yellow"
          icon={<HiExclamation className="w-6 h-6" />}
        />
        <AlertCard
          title="Normal Stock"
          count={products.filter((p) => getAlertStatus(p) === "normal").length}
          color="green"
          icon={<HiExclamationCircle className="w-6 h-6" />}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { value: "all", label: "All Alerts" },
          { value: "critical", label: "Critical" },
          { value: "low", label: "Low Stock" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === tab.value
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Current Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Baseline Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Stock Level
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map((product) => {
              const status = getAlertStatus(product);
              const percentage = calculateStockPercentage(product);

              return (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images?.[0]?.url}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          SKU: {product.sku || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-semibold ${
                        status === "critical"
                          ? "text-red-600"
                          : status === "low"
                          ? "text-yellow-600"
                          : "text-gray-900"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">
                      {product.inventoryAlerts?.baselineStock || "Not set"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            status === "critical"
                              ? "bg-red-500"
                              : status === "low"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 min-w-[40px]">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={status} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEditModal(product)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      <AiOutlineEdit className="w-4 h-4" />
                      Update Stock
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No inventory alerts at this time
        </div>
      )}

      {/* Update Stock Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Update Stock</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={editingProduct.images?.[0]?.url}
                  alt={editingProduct.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {editingProduct.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Current Stock: {editingProduct.stock}
                  </p>
                </div>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter new stock quantity"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStock(editingProduct._id)}
                disabled={updating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <span className="flex items-center justify-center gap-2">
                    <AiOutlineLoading3Quarters className="animate-spin" />
                    Updating...
                  </span>
                ) : (
                  "Update Stock"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AlertCard = ({ title, count, color, icon }) => {
  const colors = {
    red: "bg-red-100 text-red-600",
    yellow: "bg-yellow-100 text-yellow-600",
    green: "bg-green-100 text-green-600",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{count}</p>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    critical: {
      bg: "bg-red-100",
      text: "text-red-700",
      label: "Critical",
      icon: HiExclamationCircle,
    },
    low: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      label: "Low Stock",
      icon: HiExclamation,
    },
    normal: {
      bg: "bg-green-100",
      text: "text-green-700",
      label: "Normal",
      icon: null,
    },
  };

  const config = statusConfig[status] || statusConfig.normal;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {config.label}
    </span>
  );
};

export default InventoryAlerts;
