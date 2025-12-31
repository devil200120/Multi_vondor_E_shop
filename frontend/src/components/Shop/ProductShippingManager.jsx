import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { server } from "../../server";
import axios from "axios";
import { useCurrency } from "../../context/CurrencyContext";
import {
  FiPackage,
  FiTruck,
  FiEdit3,
  FiX,
  FiCheck,
  FiSettings,
  FiMapPin,
  FiUpload,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { DataGrid } from "@material-ui/data-grid";

// Helper function to safely parse float values without precision issues
const safeParseFloat = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) {
    return fallback;
  }
  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    return fallback;
  }
  // Round to 2 decimal places to avoid precision issues
  return Math.round(parsed * 100) / 100;
};

const ProductShippingManager = () => {
  const { seller } = useSelector((state) => state.seller);
  const { formatPrice, currency } = useCurrency();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [shippingConfig, setShippingConfig] = useState({
    baseShippingRate: 0,
    freeShippingThreshold: null,
    weight: 1,
    dimensions: {
      length: 10,
      width: 10,
      height: 5,
    },
    expressDeliveryAvailable: true,
    estimatedDeliveryDays: {
      min: 2,
      max: 7,
    },
    restrictions: {
      customServicePincodes: [],
      excludePincodes: [],
      requiresSpecialHandling: false,
      specialHandlingCharge: 0,
    },
  });

  // Pincode management states
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [pincodeMode, setPincodeMode] = useState("custom"); // 'custom' or 'exclude'
  const [newPincode, setNewPincode] = useState("");
  const [bulkPincodes, setBulkPincodes] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // Load seller's products
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${server}/product/get-all-products-shop/${seller._id}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      toast.error("Failed to load products");
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  }, [seller?._id]);

  useEffect(() => {
    if (seller?._id) {
      loadProducts();
    }
  }, [seller?._id, loadProducts]);

  // Handle edit product shipping
  const handleEditShipping = (product) => {
    setEditingProduct(product._id);
    setShippingConfig({
      baseShippingRate: product.shipping?.baseShippingRate || 0,
      freeShippingThreshold: product.shipping?.freeShippingThreshold || null,
      weight: product.shipping?.weight || 1,
      dimensions: {
        length: product.shipping?.dimensions?.length || 10,
        width: product.shipping?.dimensions?.width || 10,
        height: product.shipping?.dimensions?.height || 5,
      },
      expressDeliveryAvailable:
        product.shipping?.expressDeliveryAvailable ?? true,
      estimatedDeliveryDays: {
        min: product.shipping?.estimatedDeliveryDays?.min || 2,
        max: product.shipping?.estimatedDeliveryDays?.max || 7,
      },
      restrictions: {
        customServicePincodes:
          product.shipping?.restrictions?.customServicePincodes || [],
        excludePincodes: product.shipping?.restrictions?.excludePincodes || [],
        requiresSpecialHandling:
          product.shipping?.restrictions?.requiresSpecialHandling || false,
        specialHandlingCharge:
          product.shipping?.restrictions?.specialHandlingCharge || 0,
      },
    });
  };

  // Handle save shipping configuration
  const handleSaveShipping = async (productId) => {
    try {
      setSaveLoading(true);

      const response = await axios.put(
        `${server}/product/update-shipping/${productId}`,
        { shipping: shippingConfig },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Shipping configuration updated successfully!");
        setEditingProduct(null);
        loadProducts(); // Reload products to show updated data
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update shipping configuration"
      );
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const keys = field.split(".");
      if (keys.length === 2) {
        setShippingConfig((prev) => ({
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: value,
          },
        }));
      } else if (keys.length === 3) {
        setShippingConfig((prev) => ({
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: {
              ...prev[keys[0]][keys[1]],
              [keys[2]]: value,
            },
          },
        }));
      }
    } else {
      setShippingConfig((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Bulk apply shipping settings
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Handle add pincode
  const handleAddPincode = () => {
    if (newPincode && /^\d{6}$/.test(newPincode)) {
      const targetArray =
        pincodeMode === "custom"
          ? shippingConfig.restrictions.customServicePincodes
          : shippingConfig.restrictions.excludePincodes;

      if (!targetArray.includes(newPincode)) {
        const updatedConfig = {
          ...shippingConfig,
          restrictions: {
            ...shippingConfig.restrictions,
            [pincodeMode === "custom"
              ? "customServicePincodes"
              : "excludePincodes"]: [...targetArray, newPincode],
          },
        };
        setShippingConfig(updatedConfig);
        setNewPincode("");
      } else {
        toast.warning("Pincode already exists in the list");
      }
    } else {
      toast.error("Please enter a valid 6-digit pincode");
    }
  };

  // Handle remove pincode
  const handleRemovePincode = (pincode, type) => {
    const updatedConfig = {
      ...shippingConfig,
      restrictions: {
        ...shippingConfig.restrictions,
        [type]: shippingConfig.restrictions[type].filter((p) => p !== pincode),
      },
    };
    setShippingConfig(updatedConfig);
  };

  // Handle bulk pincode upload
  const handleBulkPincodeUpload = () => {
    if (!bulkPincodes.trim()) {
      toast.error("Please enter pincodes to upload");
      return;
    }

    const pincodes = bulkPincodes
      .split(/[\n,\s]+/)
      .map((p) => p.trim())
      .filter((p) => /^\d{6}$/.test(p));

    if (pincodes.length === 0) {
      toast.error("No valid pincodes found");
      return;
    }

    const targetArray =
      pincodeMode === "custom"
        ? shippingConfig.restrictions.customServicePincodes
        : shippingConfig.restrictions.excludePincodes;

    const newPincodes = pincodes.filter((p) => !targetArray.includes(p));

    if (newPincodes.length === 0) {
      toast.warning("All pincodes already exist in the list");
      return;
    }

    const updatedConfig = {
      ...shippingConfig,
      restrictions: {
        ...shippingConfig.restrictions,
        [pincodeMode === "custom"
          ? "customServicePincodes"
          : "excludePincodes"]: [...targetArray, ...newPincodes],
      },
    };

    setShippingConfig(updatedConfig);
    setBulkPincodes("");
    toast.success(`Added ${newPincodes.length} new pincodes`);
  };

  // Handle Excel file upload
  const handleExcelUpload = async (file) => {
    if (!file) return;

    setPincodeLoading(true);
    try {
      const XLSX = await import("xlsx");
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Extract pincodes from all cells
          const extractedPincodes = [];
          jsonData.forEach((row) => {
            row.forEach((cell) => {
              if (cell) {
                const cellValue = String(cell).trim();
                // Check if it's a 6-digit pincode
                if (/^\d{6}$/.test(cellValue)) {
                  extractedPincodes.push(cellValue);
                }
              }
            });
          });

          if (extractedPincodes.length === 0) {
            toast.error("No valid pincodes found in the Excel file");
            return;
          }

          // Remove duplicates
          const uniquePincodes = [...new Set(extractedPincodes)];

          // Add to current config
          const targetArray =
            pincodeMode === "custom"
              ? shippingConfig.restrictions.customServicePincodes
              : shippingConfig.restrictions.excludePincodes;

          const newPincodes = uniquePincodes.filter(
            (p) => !targetArray.includes(p)
          );

          if (newPincodes.length === 0) {
            toast.warning(
              "All pincodes from Excel file already exist in the list"
            );
            return;
          }

          const updatedConfig = {
            ...shippingConfig,
            restrictions: {
              ...shippingConfig.restrictions,
              [pincodeMode === "custom"
                ? "customServicePincodes"
                : "excludePincodes"]: [...targetArray, ...newPincodes],
            },
          };

          setShippingConfig(updatedConfig);
          toast.success(
            `Successfully imported ${newPincodes.length} pincodes from Excel file`
          );
        } catch (parseError) {
          console.error("Excel parsing error:", parseError);
          toast.error("Failed to parse Excel file. Please check the format.");
        } finally {
          setPincodeLoading(false);
        }
      };

      reader.readAsArrayBuffer(file);
      setExcelFile(null);
    } catch (error) {
      console.error("Excel upload error:", error);
      toast.error("Failed to process Excel file");
      setPincodeLoading(false);
    }
  };

  const handleBulkApply = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select products to apply bulk shipping");
      return;
    }

    try {
      setSaveLoading(true);

      const response = await axios.put(
        `${server}/product/bulk-update-shipping`,
        {
          productIds: selectedProducts,
          shipping: shippingConfig,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(
          `Shipping configuration applied to ${selectedProducts.length} products!`
        );
        setShowBulkModal(false);
        setSelectedProducts([]);
        loadProducts();
      }
    } catch (error) {
      toast.error("Failed to apply bulk shipping configuration");
    } finally {
      setSaveLoading(false);
    }
  };

  // DataGrid columns
  const columns = [
    {
      field: "name",
      headerName: "Product Name",
      width: 250,
      renderCell: (params) => (
        <div className="flex items-center space-x-3">
          <img
            src={`${params.row.images?.[0]?.url}`}
            alt={params.row.name}
            className="w-10 h-10 rounded-lg object-cover"
            onError={(e) => {
              e.target.src = "/placeholder-product.jpg";
            }}
          />
          <div>
            <p className="font-medium text-sm">{params.row.name}</p>
            <p className="text-xs text-gray-500">
              SKU: {params.row._id.slice(-6)}
            </p>
          </div>
        </div>
      ),
    },
    {
      field: "stock",
      headerName: "Stock",
      width: 100,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            params.row.stock > 10
              ? "bg-green-100 text-green-800"
              : params.row.stock > 0
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {params.row.stock}
        </span>
      ),
    },
    {
      field: "price",
      headerName: "Price",
      width: 120,
      renderCell: (params) => (
        <div>
          <p className="font-medium">
            {formatPrice(params.row.discountPrice || params.row.originalPrice)}
          </p>
          {params.row.discountPrice && (
            <p className="text-xs text-gray-500 line-through">
              {formatPrice(params.row.originalPrice)}
            </p>
          )}
        </div>
      ),
    },
    {
      field: "shippingStatus",
      headerName: "Shipping Config",
      width: 150,
      renderCell: (params) => {
        const hasCustomShipping = params.row.shipping?.baseShippingRate > 0;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              hasCustomShipping
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {hasCustomShipping ? "Custom Rate" : "Default Rate"}
          </span>
        );
      },
    },
    {
      field: "shippingRate",
      headerName: "Shipping Rate",
      width: 120,
      renderCell: (params) => (
        <span className="font-medium">
          {params.row.shipping?.baseShippingRate > 0
            ? formatPrice(params.row.shipping.baseShippingRate)
            : "Default"}
        </span>
      ),
    },
    {
      field: "pincodeConfig",
      headerName: "Pincode Config",
      width: 150,
      renderCell: (params) => {
        const customPincodes =
          params.row.shipping?.restrictions?.customServicePincodes?.length || 0;
        const excludePincodes =
          params.row.shipping?.restrictions?.excludePincodes?.length || 0;

        if (customPincodes > 0) {
          return (
            <div className="text-center">
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                Custom ({customPincodes})
              </span>
            </div>
          );
        } else if (excludePincodes > 0) {
          return (
            <div className="text-center">
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                Excluded ({excludePincodes})
              </span>
            </div>
          );
        } else {
          return (
            <div className="text-center">
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                Karnataka Default
              </span>
            </div>
          );
        }
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center space-x-2">
          {editingProduct === params.row._id ? (
            <>
              <button
                onClick={() => handleSaveShipping(params.row._id)}
                disabled={saveLoading}
                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                title="Save"
              >
                <FiCheck size={16} />
              </button>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                title="Cancel"
              >
                <FiX size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleEditShipping(params.row)}
                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                title="Edit Shipping"
              >
                <FiEdit3 size={16} />
              </button>
              <button
                onClick={() => {
                  setEditingProduct(params.row._id);
                  setShippingConfig({
                    ...shippingConfig,
                    restrictions: {
                      customServicePincodes:
                        params.row.shipping?.restrictions
                          ?.customServicePincodes || [],
                      excludePincodes:
                        params.row.shipping?.restrictions?.excludePincodes ||
                        [],
                    },
                  });
                  setShowPincodeModal(true);
                }}
                className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded transition-colors"
                title="Manage Pincodes"
              >
                <FiMapPin size={16} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiPackage className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Product Shipping Management
                </h1>
                <p className="text-gray-600">
                  Configure shipping rates for individual products
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowBulkModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FiSettings size={16} />
              <span>Bulk Update</span>
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div style={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={products}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              checkboxSelection
              onSelectionModelChange={(newSelection) => {
                setSelectedProducts(newSelection);
              }}
              loading={loading}
              disableSelectionOnClick
              getRowId={(row) => row._id}
            />
          </div>
        </div>

        {/* Shipping Configuration Panel */}
        {editingProduct && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
            <div className="flex items-center space-x-3 mb-6">
              <FiTruck className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Configure Shipping Settings
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Shipping Rate */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Base Shipping Rate ({currency?.symbol || "$"})
                </label>
                <input
                  type="number"
                  value={shippingConfig.baseShippingRate}
                  onChange={(e) =>
                    handleInputChange(
                      "baseShippingRate",
                      safeParseFloat(e.target.value, 0)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0 (uses shop default)"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-gray-500">
                  Set 0 to use shop's default shipping rates
                </p>
              </div>

              {/* Free Shipping Threshold */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Free Shipping Threshold ({currency?.symbol || "$"})
                </label>
                <input
                  type="number"
                  value={shippingConfig.freeShippingThreshold || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "freeShippingThreshold",
                      e.target.value === ""
                        ? null
                        : safeParseFloat(e.target.value, null)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Leave empty for shop default"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={shippingConfig.weight}
                  onChange={(e) =>
                    handleInputChange(
                      "weight",
                      safeParseFloat(e.target.value, 1)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0.1"
                  step="0.1"
                />
              </div>

              {/* Dimensions */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Dimensions (cm)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={shippingConfig.dimensions.length}
                    onChange={(e) =>
                      handleInputChange(
                        "dimensions.length",
                        safeParseFloat(e.target.value, 10)
                      )
                    }
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                    placeholder="L"
                    min="1"
                  />
                  <input
                    type="number"
                    value={shippingConfig.dimensions.width}
                    onChange={(e) =>
                      handleInputChange(
                        "dimensions.width",
                        safeParseFloat(e.target.value, 10)
                      )
                    }
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                    placeholder="W"
                    min="1"
                  />
                  <input
                    type="number"
                    value={shippingConfig.dimensions.height}
                    onChange={(e) =>
                      handleInputChange(
                        "dimensions.height",
                        safeParseFloat(e.target.value, 5)
                      )
                    }
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                    placeholder="H"
                    min="1"
                  />
                </div>
                <p className="text-xs text-gray-500">Length × Width × Height</p>
              </div>

              {/* Delivery Days */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Estimated Delivery (days)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={shippingConfig.estimatedDeliveryDays.min}
                    onChange={(e) =>
                      handleInputChange(
                        "estimatedDeliveryDays.min",
                        parseInt(e.target.value) || 2
                      )
                    }
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                    placeholder="Min"
                    min="1"
                  />
                  <input
                    type="number"
                    value={shippingConfig.estimatedDeliveryDays.max}
                    onChange={(e) =>
                      handleInputChange(
                        "estimatedDeliveryDays.max",
                        parseInt(e.target.value) || 7
                      )
                    }
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                    placeholder="Max"
                    min="1"
                  />
                </div>
              </div>

              {/* Express Delivery */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={shippingConfig.expressDeliveryAvailable}
                    onChange={(e) =>
                      handleInputChange(
                        "expressDeliveryAvailable",
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Express Delivery Available
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Update Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Bulk Update Shipping
                </h3>
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={20} />
                </button>
              </div>

              <p className="text-gray-600 mb-4">
                Apply shipping configuration to {selectedProducts.length}{" "}
                selected products?
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkApply}
                  disabled={saveLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saveLoading ? "Applying..." : "Apply"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pincode Management Modal */}
        {showPincodeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <FiMapPin className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">
                    Manage Product Delivery Pincodes
                  </h3>
                </div>
                <button
                  onClick={() => setShowPincodeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Pincode Mode Toggle */}
              <div className="mb-6">
                <div className="flex space-x-4 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setPincodeMode("custom")}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      pincodeMode === "custom"
                        ? "bg-purple-600 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Custom Service Areas
                  </button>
                  <button
                    onClick={() => setPincodeMode("exclude")}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      pincodeMode === "exclude"
                        ? "bg-red-600 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Exclude Pincodes
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {pincodeMode === "custom"
                    ? "Add specific pincodes where this product will be delivered. If set, only these pincodes will be serviceable."
                    : "Add pincodes where this product should NOT be delivered. Karnataka-wide delivery will apply except for these pincodes."}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Add Single Pincode */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Add Single Pincode
                  </h4>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      placeholder="Enter 6-digit pincode"
                      maxLength="6"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleAddPincode}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                    >
                      <FiPlus size={16} />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Bulk Text Input */}
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-700">
                      Bulk Add Pincodes
                    </h5>
                    <textarea
                      value={bulkPincodes}
                      onChange={(e) => setBulkPincodes(e.target.value)}
                      placeholder="Enter multiple pincodes separated by commas, spaces, or new lines&#10;Example: 560001, 560002, 560003"
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                    <button
                      onClick={handleBulkPincodeUpload}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <FiUpload size={16} />
                      <span>Upload Bulk Pincodes</span>
                    </button>
                  </div>

                  {/* Excel Upload Placeholder */}
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-700">Excel Upload</h5>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={(e) => handleExcelUpload(e.target.files[0])}
                        className="hidden"
                        id="excel-upload"
                      />
                      <label
                        htmlFor="excel-upload"
                        className="cursor-pointer text-gray-600 hover:text-gray-800"
                      >
                        <FiUpload className="w-8 h-8 mx-auto mb-2" />
                        <p>Click to upload Excel file</p>
                        <p className="text-xs text-gray-500">
                          Supports .xlsx, .xls, .csv
                        </p>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Current Pincodes List */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Current {pincodeMode === "custom" ? "Service" : "Excluded"}{" "}
                    Pincodes
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      (
                      {pincodeMode === "custom"
                        ? shippingConfig.restrictions.customServicePincodes
                            .length
                        : shippingConfig.restrictions.excludePincodes
                            .length}{" "}
                      pincodes)
                    </span>
                  </h4>

                  <div className="border border-gray-300 rounded-lg p-4 max-h-80 overflow-y-auto">
                    {(pincodeMode === "custom"
                      ? shippingConfig.restrictions.customServicePincodes
                      : shippingConfig.restrictions.excludePincodes
                    ).length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No {pincodeMode === "custom" ? "service" : "excluded"}{" "}
                        pincodes added yet
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {(pincodeMode === "custom"
                          ? shippingConfig.restrictions.customServicePincodes
                          : shippingConfig.restrictions.excludePincodes
                        ).map((pincode, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                          >
                            <span className="text-sm font-mono">{pincode}</span>
                            <button
                              onClick={() =>
                                handleRemovePincode(
                                  pincode,
                                  pincodeMode === "custom"
                                    ? "customServicePincodes"
                                    : "excludePincodes"
                                )
                              }
                              className="text-red-600 hover:text-red-800 ml-2"
                              title="Remove pincode"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowPincodeModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleSaveShipping(editingProduct);
                    setShowPincodeModal(false);
                  }}
                  disabled={saveLoading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {saveLoading ? "Saving..." : "Save Pincodes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductShippingManager;
