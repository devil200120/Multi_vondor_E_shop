import React, { useEffect, useState } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { HiOutlineCheck, HiOutlineX, HiOutlineEye } from "react-icons/hi";
import { useCurrency } from "../../context/CurrencyContext";

const PendingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const fetchPendingProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${server}/product/admin/pending-products`,
        { withCredentials: true }
      );
      setProducts(data.products);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch pending products"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId) => {
    if (!window.confirm("Are you sure you want to approve this product?")) {
      return;
    }

    setActionLoading(true);
    try {
      const { data } = await axios.put(
        `${server}/product/admin/approve-product/${productId}`,
        {},
        { withCredentials: true }
      );
      toast.success(data.message);
      fetchPendingProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve product");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setActionLoading(true);
    try {
      const { data } = await axios.put(
        `${server}/product/admin/reject-product/${selectedProduct._id}`,
        { rejectionReason },
        { withCredentials: true }
      );
      toast.success(data.message);
      setShowRejectModal(false);
      setRejectionReason("");
      setSelectedProduct(null);
      fetchPendingProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject product");
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (product) => {
    setSelectedProduct(product);
    setShowRejectModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-8 max-w-full overflow-hidden">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pending Products</h1>
        <p className="text-sm text-gray-600 mt-1">
          Review and approve seller products ({products.length} pending)
        </p>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No pending products to review</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden max-w-full">
          <div className="overflow-x-auto max-w-full">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={product.images[0]?.url}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.description?.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.sellerShop?.name || product.shop?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.sellerShop?.email || product.shop?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.category?.title || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(product.discountPrice)}
                      </div>
                      {product.originalPrice && (
                        <div className="text-sm text-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.stock}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() =>
                            window.open(`/product/${product._id}`, "_blank")
                          }
                          className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50"
                          title="View Product"
                        >
                          <HiOutlineEye size={18} />
                        </button>
                        <button
                          onClick={() => handleApprove(product._id)}
                          disabled={actionLoading}
                          className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50 disabled:opacity-50"
                          title="Approve"
                        >
                          <HiOutlineCheck size={18} />
                        </button>
                        <button
                          onClick={() => openRejectModal(product)}
                          disabled={actionLoading}
                          className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 disabled:opacity-50"
                          title="Reject"
                        >
                          <HiOutlineX size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Reject Product
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason for rejecting "{selectedProduct?.name}"
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={4}
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? "Rejecting..." : "Reject Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingProducts;
