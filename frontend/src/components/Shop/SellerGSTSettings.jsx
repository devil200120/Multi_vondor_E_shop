import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { server } from "../../server";
import axios from "axios";
import { toast } from "react-toastify";
import { useCurrency } from "../../context/CurrencyContext";
import { FiSave, FiRefreshCw, FiInfo, FiPackage } from "react-icons/fi";
import { HiOutlineCalculator } from "react-icons/hi";
import DashboardHeader from "./Layout/DashboardHeader";

const SellerGSTSettings = () => {
  const { seller } = useSelector((state) => state.seller);
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // State for bulk update
  const [bulkUpdateSettings, setBulkUpdateSettings] = useState({
    isGstApplicable: false,
    gstType: "separate",
    cgstRate: 9,
    sgstRate: 9,
    combinedGstRate: 18,
    hsnCode: "",
  });

  const [selectedProducts, setSelectedProducts] = useState([]);

  // Fetch shop's products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${server}/product/get-all-products-shop/${seller._id}`
      );
      if (response.data.success) {
        setProducts(response.data.products);
        setFilteredProducts(response.data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [seller._id]);

  // Search products
  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  useEffect(() => {
    if (seller?._id) {
      fetchProducts();
    }
  }, [seller, fetchProducts]);

  // Handle individual product GST update
  const updateProductGST = async (productId, gstSettings) => {
    try {
      const response = await axios.put(
        `${server}/product/update-product-gst/${productId}`,
        { gstConfiguration: gstSettings },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Product GST settings updated successfully");
        fetchProducts(); // Refresh products list
      }
    } catch (error) {
      console.error("Error updating product GST:", error);
      toast.error("Failed to update product GST settings");
    }
  };

  // Handle bulk update
  const handleBulkUpdate = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    try {
      setSaveLoading(true);
      const updatePromises = selectedProducts.map((productId) =>
        updateProductGST(productId, bulkUpdateSettings)
      );

      await Promise.all(updatePromises);
      toast.success(
        `Updated GST settings for ${selectedProducts.length} products`
      );
      setSelectedProducts([]);
    } catch (error) {
      console.error("Error in bulk update:", error);
      toast.error("Failed to update some products");
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle select all products
  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((product) => product._id));
    }
  };

  // Calculate GST amount for preview
  const calculateGSTPreview = (price, gstSettings) => {
    if (!gstSettings.isGstApplicable) return { cgst: 0, sgst: 0, total: 0 };

    if (gstSettings.gstType === "separate") {
      const cgst = (price * gstSettings.cgstRate) / 100;
      const sgst = (price * gstSettings.sgstRate) / 100;
      return { cgst, sgst, total: cgst + sgst };
    } else {
      const total = (price * gstSettings.combinedGstRate) / 100;
      return { cgst: 0, sgst: 0, total };
    }
  };

  return (
    <div className="w-full mx-auto">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <HiOutlineCalculator className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">GST Settings</h1>
          </div>
          <p className="text-gray-600">
            Manage GST configuration for your products. GST will be displayed in
            invoices only.
          </p>
        </div>

        {/* Information Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <FiInfo className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">
                Important Information
              </h3>
              <p className="text-sm text-blue-700">
                GST settings are used for invoice generation only. They do not
                affect cart calculations or pricing during checkout. The GST
                will be shown as additional information in the invoice for tax
                compliance purposes.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bulk Update Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HiOutlineCalculator className="w-5 h-5 mr-2" />
                Bulk Update GST
              </h2>

              <div className="space-y-4">
                {/* GST Applicable Toggle */}
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={bulkUpdateSettings.isGstApplicable}
                      onChange={(e) =>
                        setBulkUpdateSettings({
                          ...bulkUpdateSettings,
                          isGstApplicable: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      GST Applicable
                    </span>
                  </label>
                </div>

                {bulkUpdateSettings.isGstApplicable && (
                  <>
                    {/* GST Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GST Type
                      </label>
                      <select
                        value={bulkUpdateSettings.gstType}
                        onChange={(e) =>
                          setBulkUpdateSettings({
                            ...bulkUpdateSettings,
                            gstType: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="separate">Separate (CGST + SGST)</option>
                        <option value="combined">Combined GST</option>
                      </select>
                    </div>

                    {/* GST Rates */}
                    {bulkUpdateSettings.gstType === "separate" ? (
                      <div className="space-y-3">
                        {/* Predefined GST Rate Selector */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Standard GST Rate
                          </label>
                          <select
                            onChange={(e) => {
                              const selectedRate = parseFloat(e.target.value);
                              if (selectedRate > 0) {
                                const halfRate = selectedRate / 2;
                                setBulkUpdateSettings({
                                  ...bulkUpdateSettings,
                                  cgstRate: halfRate,
                                  sgstRate: halfRate,
                                  combinedGstRate: selectedRate,
                                });
                              }
                            }}
                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Choose a standard rate...
                            </option>
                            <option value="5">
                              5% GST (2.5% CGST + 2.5% SGST)
                            </option>
                            <option value="12">
                              12% GST (6% CGST + 6% SGST)
                            </option>
                            <option value="18">
                              18% GST (9% CGST + 9% SGST)
                            </option>
                            <option value="28">
                              28% GST (14% CGST + 14% SGST)
                            </option>
                          </select>
                          <p className="text-xs text-blue-600 mt-1">
                            💡 Select a standard rate to automatically split
                            into CGST and SGST
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CGST Rate (%)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="50"
                              step="0.01"
                              value={bulkUpdateSettings.cgstRate}
                              onChange={(e) =>
                                setBulkUpdateSettings({
                                  ...bulkUpdateSettings,
                                  cgstRate: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              SGST Rate (%)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="50"
                              step="0.01"
                              value={bulkUpdateSettings.sgstRate}
                              onChange={(e) =>
                                setBulkUpdateSettings({
                                  ...bulkUpdateSettings,
                                  sgstRate: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Combined GST Rate (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={bulkUpdateSettings.combinedGstRate}
                          onChange={(e) =>
                            setBulkUpdateSettings({
                              ...bulkUpdateSettings,
                              combinedGstRate: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}

                    {/* HSN Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        HSN Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={bulkUpdateSettings.hsnCode}
                        onChange={(e) =>
                          setBulkUpdateSettings({
                            ...bulkUpdateSettings,
                            hsnCode: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter HSN code"
                      />
                    </div>
                  </>
                )}

                {/* Preview */}
                {bulkUpdateSettings.isGstApplicable && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Preview (on {formatPrice(100)}):
                    </h4>
                    {(() => {
                      const preview = calculateGSTPreview(
                        100,
                        bulkUpdateSettings
                      );
                      return (
                        <div className="text-xs space-y-1">
                          {bulkUpdateSettings.gstType === "separate" ? (
                            <>
                              <div>CGST: {formatPrice(preview.cgst)}</div>
                              <div>SGST: {formatPrice(preview.sgst)}</div>
                            </>
                          ) : null}
                          <div className="font-medium">
                            Total GST: {formatPrice(preview.total)}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Selected Count */}
                <div className="text-sm text-gray-600">
                  {selectedProducts.length} product(s) selected
                </div>

                {/* Apply Button */}
                <button
                  onClick={handleBulkUpdate}
                  disabled={selectedProducts.length === 0 || saveLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {saveLoading ? (
                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiSave className="w-4 h-4" />
                  )}
                  <span>Apply to Selected</span>
                </button>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiPackage className="w-5 h-5 mr-2" />
                    Products GST Configuration
                  </h2>
                  <button
                    onClick={fetchProducts}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-700 p-2"
                  >
                    <FiRefreshCw
                      className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>

                {/* Search */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Select All */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={
                      filteredProducts.length > 0 &&
                      selectedProducts.length === filteredProducts.length
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select All ({filteredProducts.length} products)
                  </span>
                </label>
              </div>

              {/* Products List */}
              <div className="divide-y divide-gray-200">
                {loading ? (
                  <div className="p-8 text-center">
                    <FiRefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Loading products...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="p-8 text-center">
                    <FiPackage className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No products found</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <ProductGSTCard
                      key={product._id}
                      product={product}
                      isSelected={selectedProducts.includes(product._id)}
                      onSelect={(productId) => {
                        if (selectedProducts.includes(productId)) {
                          setSelectedProducts(
                            selectedProducts.filter((id) => id !== productId)
                          );
                        } else {
                          setSelectedProducts([...selectedProducts, productId]);
                        }
                      }}
                      onUpdate={updateProductGST}
                      calculateGSTPreview={calculateGSTPreview}
                      formatPrice={formatPrice}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual Product GST Card Component
const ProductGSTCard = ({
  product,
  isSelected,
  onSelect,
  onUpdate,
  calculateGSTPreview,
  formatPrice,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [gstSettings, setGstSettings] = useState(
    product.gstConfiguration || {
      isGstApplicable: false,
      gstType: "separate",
      cgstRate: 9,
      sgstRate: 9,
      combinedGstRate: 18,
      hsnCode: "",
    }
  );

  const handleSave = async () => {
    try {
      setSaving(true);
      await onUpdate(product._id, gstSettings);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving GST settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setGstSettings(
      product.gstConfiguration || {
        isGstApplicable: false,
        gstType: "separate",
        cgstRate: 9,
        sgstRate: 9,
        combinedGstRate: 18,
        hsnCode: "",
      }
    );
    setIsEditing(false);
  };

  const preview = calculateGSTPreview(product.discountPrice, gstSettings);

  return (
    <div className="p-6">
      <div className="flex items-start space-x-4">
        {/* Selection Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(product._id)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
        />

        {/* Product Image */}
        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500">
                Price: {formatPrice(product.discountPrice)}
              </p>

              {/* Current GST Status */}
              <div className="mt-2">
                {gstSettings.isGstApplicable ? (
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                    GST Enabled
                    {gstSettings.gstType === "separate"
                      ? ` (${gstSettings.cgstRate}% + ${gstSettings.sgstRate}%)`
                      : ` (${gstSettings.combinedGstRate}%)`}
                  </div>
                ) : (
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1"></span>
                    No GST
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="ml-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-3">
                {/* GST Applicable */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={gstSettings.isGstApplicable}
                    onChange={(e) =>
                      setGstSettings({
                        ...gstSettings,
                        isGstApplicable: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    GST Applicable
                  </span>
                </label>

                {gstSettings.isGstApplicable && (
                  <>
                    {/* GST Type */}
                    <div>
                      <select
                        value={gstSettings.gstType}
                        onChange={(e) =>
                          setGstSettings({
                            ...gstSettings,
                            gstType: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="separate">Separate (CGST + SGST)</option>
                        <option value="combined">Combined GST</option>
                      </select>
                    </div>

                    {/* Predefined GST Rates */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quick Select GST Rate
                      </label>
                      <select
                        onChange={(e) => {
                          const totalRate = parseFloat(e.target.value);
                          if (totalRate > 0) {
                            const halfRate = totalRate / 2;
                            setGstSettings({
                              ...gstSettings,
                              cgstRate: halfRate,
                              sgstRate: halfRate,
                              combinedGstRate: totalRate,
                            });
                          }
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select standard rate...</option>
                        <option value="5">5% (2.5% CGST + 2.5% SGST)</option>
                        <option value="12">12% (6% CGST + 6% SGST)</option>
                        <option value="18">18% (9% CGST + 9% SGST)</option>
                        <option value="28">28% (14% CGST + 14% SGST)</option>
                      </select>
                    </div>

                    {/* GST Rates */}
                    {gstSettings.gstType === "separate" ? (
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          min="0"
                          max="50"
                          step="0.01"
                          value={gstSettings.cgstRate}
                          onChange={(e) =>
                            setGstSettings({
                              ...gstSettings,
                              cgstRate: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="CGST %"
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="number"
                          min="0"
                          max="50"
                          step="0.01"
                          value={gstSettings.sgstRate}
                          onChange={(e) =>
                            setGstSettings({
                              ...gstSettings,
                              sgstRate: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="SGST %"
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={gstSettings.combinedGstRate}
                        onChange={(e) =>
                          setGstSettings({
                            ...gstSettings,
                            combinedGstRate: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="Combined GST %"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}

                    {/* HSN Code */}
                    <input
                      type="text"
                      value={gstSettings.hsnCode}
                      onChange={(e) =>
                        setGstSettings({
                          ...gstSettings,
                          hsnCode: e.target.value,
                        })
                      }
                      placeholder="HSN Code (Optional)"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />

                    {/* Preview */}
                    <div className="bg-blue-50 p-2 rounded text-xs">
                      <strong>
                        Preview on {formatPrice(product.discountPrice)}:
                      </strong>
                      {gstSettings.gstType === "separate" ? (
                        <div>
                          CGST: {formatPrice(preview.cgst)}, SGST:{" "}
                          {formatPrice(preview.sgst)}
                        </div>
                      ) : null}
                      <div>Total GST: {formatPrice(preview.total)}</div>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-1"
                  >
                    {saving ? (
                      <FiRefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <FiSave className="w-3 h-3" />
                    )}
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1.5 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerGSTSettings;
