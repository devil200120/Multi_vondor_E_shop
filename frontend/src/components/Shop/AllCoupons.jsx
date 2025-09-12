import { DataGrid } from "@material-ui/data-grid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlinePlus } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { MdOutlineLocalOffer } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../Layout/Loader";
import { server } from "../../server";
import { toast } from "react-toastify";

const AllCoupons = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [coupouns, setCoupouns] = useState([]);
  const [minAmount, setMinAmout] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [selectedProducts, setSelectedProducts] = useState("");
  const [value, setValue] = useState("");
  const { seller } = useSelector((state) => state.seller);
  const { products } = useSelector((state) => state.products);

  const dispatch = useDispatch();

  // Debug logs
  console.log("Seller state:", seller);
  console.log("Products state:", products);

  useEffect(() => {
    const fetchCoupons = async () => {
      if (!seller || !seller._id) {
        console.log("Seller not loaded yet");
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(
          `${server}/coupon/get-coupon/${seller._id}`,
          {
            withCredentials: true,
          }
        );
        console.log("Coupons API response:", response.data);
        setCoupouns(response.data.couponCodes || []);
      } catch (error) {
        console.error("Error fetching coupons:", error);
        if (error.response) {
          console.error("Error response:", error.response.data);
          toast.error(error.response.data.message || "Failed to fetch coupons");
        } else {
          toast.error("Network error while fetching coupons");
        }
        setCoupouns([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupons();
  }, [seller?._id]);

  const handleDelete = async (id) => {
    try {
      console.log("Deleting coupon with ID:", id);
      const response = await axios.delete(
        `${server}/coupon/delete-coupon/${id}`,
        {
          withCredentials: true,
        }
      );
      console.log("Delete response:", response.data);
      toast.success("Coupon code deleted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(error.response.data.message || "Failed to delete coupon");
      } else {
        toast.error("Network error while deleting coupon");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!seller || !seller._id) {
      toast.error("Seller information not available");
      return;
    }

    if (!name || !value) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const couponData = {
        name: name.trim(),
        minAmount: minAmount ? Number(minAmount) : null,
        maxAmount: maxAmount ? Number(maxAmount) : null,
        selectedProducts: selectedProducts || null,
        value: Number(value),
        shopId: seller._id,
      };

      console.log("Creating coupon with data:", couponData);

      const response = await axios.post(
        `${server}/coupon/create-coupon-code`,
        couponData,
        { withCredentials: true }
      );

      console.log("Coupon creation response:", response.data);
      toast.success("Coupon code created successfully!");

      // Reset form
      setName("");
      setValue("");
      setMinAmout("");
      setMaxAmount("");
      setSelectedProducts("");
      setOpen(false);

      // Refresh coupons list
      window.location.reload();
    } catch (error) {
      console.error("Error creating coupon:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(error.response.data.message || "Failed to create coupon");
      } else {
        toast.error("Network error while creating coupon");
      }
    }
  };

  const columns = [
    {
      field: "id",
      headerName: "Coupon ID",
      minWidth: 200,
      flex: 1,
      renderCell: (params) => (
        <span className="text-gray-600 font-mono text-xs">
          {params.value.substring(0, 8)}...
        </span>
      ),
    },
    {
      field: "name",
      headerName: "Coupon Code",
      minWidth: 180,
      flex: 1.4,
      renderCell: (params) => (
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium">
            {params.value}
          </div>
        </div>
      ),
    },
    {
      field: "price",
      headerName: "Discount Value",
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => (
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm font-semibold">
          {params.value}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 100,
      flex: 0.6,
      renderCell: () => (
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
          Active
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
        <button
          onClick={() => handleDelete(params.id)}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          <AiOutlineDelete className="mr-1 h-4 w-4" />
          Delete
        </button>
      ),
    },
  ];

  const row = [];

  coupouns &&
    coupouns.length > 0 &&
    coupouns.forEach((item) => {
      row.push({
        id: item._id,
        name: item.name,
        price: item.value + "%",
        status: "Active",
      });
    });

  // Show loading or error state for seller
  if (!seller) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Please log in as a seller to manage coupons.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Coupon Management
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Create and manage discount coupons for your products
                </p>
              </div>
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <AiOutlinePlus className="mr-2 h-4 w-4" />
                Create Coupon
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MdOutlineLocalOffer className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Coupons
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {coupouns?.length || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">%</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Active Coupons
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {coupouns?.length || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">₹</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Savings
                  </p>
                  <p className="text-2xl font-bold text-gray-900">₹0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Grid */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">All Coupons</h3>
            </div>
            <div className="p-6">
              <DataGrid
                rows={row}
                columns={columns}
                pageSize={10}
                disableSelectionOnClick
                autoHeight
                className="bg-white"
                style={{
                  border: "none",
                  "& .MuiDataGrid-root": {
                    border: "none",
                  },
                }}
              />
            </div>
          </div>

          {/* Create Coupon Modal */}
          {open && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Create New Coupon
                  </h3>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <RxCross1 size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coupon Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter coupon code name..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Percentage{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="value"
                      value={value}
                      required
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="Enter discount percentage..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="minAmount"
                      value={minAmount}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => setMinAmout(e.target.value)}
                      placeholder="Enter minimum purchase amount..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Discount (₹)
                    </label>
                    <input
                      type="number"
                      name="maxAmount"
                      value={maxAmount}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => setMaxAmount(e.target.value)}
                      placeholder="Enter maximum discount amount..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Applicable Product
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selectedProducts}
                      onChange={(e) => setSelectedProducts(e.target.value)}
                    >
                      <option value="">All Products</option>
                      {products &&
                        products.map((product) => (
                          <option value={product.name} key={product._id}>
                            {product.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Create Coupon
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AllCoupons;
