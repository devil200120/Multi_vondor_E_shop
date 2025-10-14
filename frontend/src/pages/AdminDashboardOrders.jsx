import React, { useEffect, useState } from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import { DataGrid } from "@material-ui/data-grid";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfAdmin } from "../redux/actions/order";
import styles from "../styles/styles";
import Loader from "../components/Layout/Loader";
import {
  FiPackage,
  FiSearch,
  FiEye,
  FiTruck,
  FiDownload,
  FiX,
  FiFilter,
  FiCalendar,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import { HiOutlineShoppingBag } from "react-icons/hi";
import {
  MdPending,
  MdCheckCircle,
  MdCancel,
  MdFilterList,
} from "react-icons/md";
import { AiOutlineDollarCircle } from "react-icons/ai";
import { Button } from "@material-ui/core";
import { downloadBulkOrderCSV } from "../utils/csvExporter";
import InvoiceDownloadButton from "../components/InvoiceDownloadButton";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../server";
import { getOrderNumber } from "../utils/orderUtils";

const AdminDashboardOrders = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [amountRange, setAmountRange] = useState({
    minAmount: "",
    maxAmount: "",
  });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  const { adminOrders, adminOrderLoading } = useSelector(
    (state) => state.order
  );

  useEffect(() => {
    dispatch(getAllOrdersOfAdmin());
  }, [dispatch]);

  // Bulk export handler
  const handleBulkExport = () => {
    try {
      if (filteredRows.length === 0) {
        toast.error("No orders to export");
        return;
      }

      // Convert filtered rows back to order objects for export
      const ordersToExport = filteredRows
        .map((row) => adminOrders.find((order) => order._id === row.id))
        .filter(Boolean);

      downloadBulkOrderCSV(ordersToExport, "admin-orders-export");
      toast.success(
        `Successfully exported ${ordersToExport.length} orders to CSV!`
      );
    } catch (error) {
      console.error("Error exporting orders:", error);
      toast.error("Error exporting orders");
    }
  };

  // Cancel order handler
  const handleCancelOrder = (orderId) => {
    const order = adminOrders.find((o) => o._id === orderId);
    if (!order) {
      toast.error("Order not found");
      return;
    }

    if (order.status === "Cancelled") {
      toast.error("Order is already cancelled");
      return;
    }

    if (order.status === "Delivered") {
      toast.error("Cannot cancel delivered order");
      return;
    }

    setCancellingOrder(orderId);
    setShowCancelDialog(true);
  };

  const confirmCancelOrder = async () => {
    if (!cancellingOrder) return;

    try {
      await axios.put(
        `${server}/order/admin-cancel-order/${cancellingOrder}`,
        { reason: cancelReason },
        { withCredentials: true }
      );

      toast.success(
        "Order cancelled successfully and customer has been notified via email"
      );
      dispatch(getAllOrdersOfAdmin()); // Refresh orders
      setShowCancelDialog(false);
      setCancellingOrder(null);
      setCancelReason("");
    } catch (error) {
      console.error("Cancel order error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to cancel order. Please try again."
      );
    }
  };

  const closeCancelDialog = () => {
    setShowCancelDialog(false);
    setCancellingOrder(null);
    setCancelReason("");
  };

  const columns = [
    {
      field: "id",
      headerName: "Order ID",
      minWidth: 200,
      flex: 0.9,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div
          className="text-xs font-mono text-primary-600 truncate"
          title={params.value}
        >
          {getOrderNumber(params.row)}
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 140,
      flex: 0.8,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const status = params.value;
        let statusClass = "bg-gray-100 text-gray-800";
        let StatusIcon = MdPending;

        switch (status) {
          case "Delivered":
            statusClass = "bg-green-100 text-green-800";
            StatusIcon = MdCheckCircle;
            break;
          case "Shipped":
          case "On the way":
            statusClass = "bg-blue-100 text-blue-800";
            StatusIcon = FiTruck;
            break;
          case "Processing":
            statusClass = "bg-yellow-100 text-yellow-800";
            StatusIcon = MdPending;
            break;
          case "Cancelled":
          case "Refund Success":
            statusClass = "bg-red-100 text-red-800";
            StatusIcon = MdCancel;
            break;
          default:
            statusClass = "bg-gray-100 text-gray-800";
        }

        return (
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}
          >
            <StatusIcon size={12} />
            <span>{status}</span>
          </div>
        );
      },
    },
    {
      field: "itemsQty",
      headerName: "Items",
      type: "number",
      minWidth: 100,
      flex: 0.6,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div className="flex items-center justify-center space-x-1">
          <FiPackage size={14} className="text-gray-500" />
          <span className="font-medium text-gray-700">{params.value}</span>
        </div>
      ),
    },
    {
      field: "total",
      headerName: "Total Amount",
      minWidth: 130,
      flex: 0.8,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div className="font-semibold text-primary-600 flex items-center justify-center space-x-1">
          <AiOutlineDollarCircle size={14} />
          <span>{params.value}</span>
        </div>
      ),
    },
    {
      field: "createdAt",
      headerName: "Order Date",
      minWidth: 120,
      flex: 0.7,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <span className="text-gray-600 text-sm">{params.value}</span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 150,
      flex: 0.8,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => {
        const order = adminOrders?.find((o) => o._id === params.id);
        const canCancel =
          order && order.status !== "Cancelled" && order.status !== "Delivered";

        return (
          <div className="flex justify-center space-x-2">
            <Button
              className="!min-w-0 !p-2 !text-primary-600 hover:!bg-primary-50 !rounded-lg transition-all duration-200"
              title="View Order Details"
              onClick={() => {
                window.open(`/admin/order/${params.id}`, "_blank");
              }}
            >
              <FiEye size={16} />
            </Button>
            {order && (
              <InvoiceDownloadButton
                order={order}
                showDropdown={true}
                className="!min-w-0 !p-2 !text-green-600 hover:!bg-green-50 !rounded-lg transition-all duration-200 !text-xs"
              >
                <FiDownload size={16} />
              </InvoiceDownloadButton>
            )}
            {canCancel && (
              <Button
                className="!min-w-0 !p-2 !text-red-600 hover:!bg-red-50 !rounded-lg transition-all duration-200"
                title="Cancel Order"
                onClick={() => handleCancelOrder(params.id)}
              >
                <FiX size={16} />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const row = [];
  adminOrders &&
    adminOrders.forEach((item) => {
      row.push({
        id: item._id,
        orderNumber: item.orderNumber, // Add orderNumber to row data
        itemsQty: item?.cart?.reduce((acc, item) => acc + item.qty, 0),
        total: "₹" + item?.totalPrice?.toFixed(2),
        status: item?.status,
        createdAt: item?.createdAt.slice(0, 10),
      });
    });

  // Filter orders based on all criteria
  const filteredAndSortedRows = (() => {
    // First apply filters
    const filtered = row.filter((order) => {
      const orderData = adminOrders.find((o) => o._id === order.id);
      if (!orderData) return false;

      // Search term filter
      const matchesSearch =
        !searchTerm ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.total.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.orderNumber &&
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;

      // Payment status filter
      const matchesPaymentStatus =
        paymentStatusFilter === "All" ||
        (orderData.paymentInfo &&
          orderData.paymentInfo.status === paymentStatusFilter);

      // Date range filter
      const orderDate = new Date(orderData.createdAt);
      const matchesDateRange =
        (!dateRange.startDate || orderDate >= new Date(dateRange.startDate)) &&
        (!dateRange.endDate || orderDate <= new Date(dateRange.endDate));

      // Amount range filter
      const orderAmount = orderData.totalPrice;
      const matchesAmountRange =
        (!amountRange.minAmount ||
          orderAmount >= parseFloat(amountRange.minAmount)) &&
        (!amountRange.maxAmount ||
          orderAmount <= parseFloat(amountRange.maxAmount));

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPaymentStatus &&
        matchesDateRange &&
        matchesAmountRange
      );
    });

    // Then apply sorting
    return filtered.sort((a, b) => {
      const orderA = adminOrders.find((o) => o._id === a.id);
      const orderB = adminOrders.find((o) => o._id === b.id);

      let valueA, valueB;

      switch (sortBy) {
        case "createdAt":
          valueA = new Date(orderA?.createdAt || 0);
          valueB = new Date(orderB?.createdAt || 0);
          break;
        case "totalPrice":
          valueA = orderA?.totalPrice || 0;
          valueB = orderB?.totalPrice || 0;
          break;
        case "status":
          valueA = a.status || "";
          valueB = b.status || "";
          break;
        case "itemsQty":
          valueA = a.itemsQty || 0;
          valueB = b.itemsQty || 0;
          break;
        case "orderNumber":
          valueA = a.orderNumber || a.id;
          valueB = b.orderNumber || b.id;
          break;
        default:
          valueA = new Date(orderA?.createdAt || 0);
          valueB = new Date(orderB?.createdAt || 0);
      }

      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });
  })();

  // Use filteredAndSortedRows instead of filteredRows
  const filteredRows = filteredAndSortedRows;

  // Clear all filters function
  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPaymentStatusFilter("All");
    setDateRange({ startDate: "", endDate: "" });
    setAmountRange({ minAmount: "", maxAmount: "" });
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm ||
    statusFilter !== "All" ||
    paymentStatusFilter !== "All" ||
    dateRange.startDate ||
    dateRange.endDate ||
    amountRange.minAmount ||
    amountRange.maxAmount ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc";

  // Calculate order statistics
  const totalOrders = adminOrders?.length || 0;
  const deliveredOrders =
    adminOrders?.filter((order) => order.status === "Delivered").length || 0;
  const processingOrders =
    adminOrders?.filter((order) => order.status === "Processing").length || 0;

  // Calculate total revenue
  const totalRevenue =
    adminOrders?.reduce((sum, order) => sum + (order.totalPrice || 0), 0) || 0;

  if (adminOrderLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader activeMenuItem={2} />
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader activeMenuItem={2} />
      <div className="flex">
        {/* Sidebar - Fixed positioning for better responsiveness */}
        <div className="hidden 800px:block w-64 fixed left-0 top-20 h-full z-10">
          <AdminSideBar active={2} />
        </div>

        {/* Main Content */}
        <div className="flex-1 800px:ml-64 p-4 800px:p-6">
          <div className="max-w-full">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <HiOutlineShoppingBag className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl 800px:text-3xl font-bold text-gray-900">
                    All Orders
                  </h1>
                  <p className="text-gray-600">Manage all platform orders</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 400px:grid-cols-2 800px:grid-cols-4 gap-4 800px:gap-6 mb-6">
              <div className={`${styles.card} ${styles.card_padding}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-primary-600">
                      {totalOrders}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        All Time
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <HiOutlineShoppingBag className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
              </div>

              <div className={`${styles.card} ${styles.card_padding}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Delivered
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {deliveredOrders}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <MdCheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className={`${styles.card} ${styles.card_padding}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Processing
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {processingOrders}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <MdPending className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className={`${styles.card} ${styles.card_padding}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{totalRevenue.toFixed(2)}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Total Earned
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <AiOutlineDollarCircle className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar and Actions */}
            <div className={`${styles.card} p-4 mb-6`}>
              <div className="flex flex-col gap-4">
                {/* Top row with search and action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="relative flex-1 min-w-0">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 transition-colors duration-200" />
                    <input
                      type="text"
                      placeholder="Search orders by ID, status, amount, or order number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`${styles.input} transition-all duration-300 ease-in-out focus:scale-105 hover:border-gray-400 focus:shadow-lg`}
                      style={{ paddingLeft: "2.5rem" }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    {/* Quick Sort Buttons */}
                    <div className="hidden md:flex items-center space-x-1 px-3 py-1 bg-gray-50 rounded-lg transition-all duration-200 ease-in-out">
                      <span className="text-xs text-gray-600 font-medium">
                        Quick Sort:
                      </span>
                      <button
                        onClick={() => {
                          setSortBy("createdAt");
                          setSortOrder("desc");
                        }}
                        className={`px-2 py-1 text-xs rounded transition-all duration-200 ease-in-out transform hover:scale-105 ${
                          sortBy === "createdAt" && sortOrder === "desc"
                            ? "bg-blue-100 text-blue-700 shadow-sm"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                        }`}
                        title="Sort by newest first"
                      >
                        <FiArrowDown
                          className="inline mr-1 transition-transform duration-200"
                          size={12}
                        />
                        Newest
                      </button>
                      <button
                        onClick={() => {
                          setSortBy("totalPrice");
                          setSortOrder("desc");
                        }}
                        className={`px-2 py-1 text-xs rounded transition-all duration-200 ease-in-out transform hover:scale-105 ${
                          sortBy === "totalPrice" && sortOrder === "desc"
                            ? "bg-blue-100 text-blue-700 shadow-sm"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                        }`}
                        title="Sort by highest amount"
                      >
                        <FiArrowUp
                          className="inline mr-1 transition-transform duration-200"
                          size={12}
                        />
                        Amount
                      </button>
                    </div>

                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`inline-flex items-center px-4 py-2 font-medium rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-sm ${
                        showFilters
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                      }`}
                    >
                      <FiFilter
                        className={`mr-2 h-4 w-4 transition-transform duration-300 ${
                          showFilters ? "rotate-180" : ""
                        }`}
                      />
                      Filters
                      {hasActiveFilters && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full animate-pulse">
                          {
                            [
                              statusFilter !== "All",
                              paymentStatusFilter !== "All",
                              dateRange.startDate,
                              dateRange.endDate,
                              amountRange.minAmount,
                              amountRange.maxAmount,
                              sortBy !== "createdAt",
                              sortOrder !== "desc",
                            ].filter(Boolean).length
                          }
                        </span>
                      )}
                    </button>

                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-sm hover:shadow-md"
                        title="Clear all filters"
                      >
                        <FiRefreshCw className="mr-2 h-4 w-4 transition-transform duration-300 hover:rotate-180" />
                        Clear
                      </button>
                    )}

                    <button
                      onClick={handleBulkExport}
                      disabled={filteredRows.length === 0}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 shadow-sm hover:shadow-md disabled:hover:scale-100"
                      title="Export filtered orders to CSV"
                    >
                      <FiDownload className="mr-2 h-4 w-4 transition-transform duration-200" />
                      Export CSV ({filteredRows.length})
                    </button>
                  </div>
                </div>

                {/* Expandable Filters Section */}
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    showFilters
                      ? "max-h-[600px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="border-t border-gray-200 pt-4 mt-4 transform transition-all duration-300 ease-in-out">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {/* Status Filter */}
                      <div className="transform transition-all duration-300 ease-in-out hover:scale-105">
                        <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-200">
                          <MdFilterList className="inline mr-1 transition-transform duration-200" />
                          Order Status
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-all duration-300 ease-in-out hover:border-gray-400 focus:shadow-lg"
                        >
                          <option value="All">All Status</option>
                          <option value="Processing">Processing</option>
                          <option value="Transferred to delivery partner">
                            Transferred to delivery partner
                          </option>
                          <option value="Shipping">Shipping</option>
                          <option value="Received">Received</option>
                          <option value="On the way">On the way</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Processing Refund">
                            Processing Refund
                          </option>
                          <option value="Refund Success">Refund Success</option>
                        </select>
                      </div>

                      {/* Payment Status Filter */}
                      <div className="transform transition-all duration-300 ease-in-out hover:scale-105">
                        <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-200">
                          <AiOutlineDollarCircle className="inline mr-1 transition-transform duration-200" />
                          Payment Status
                        </label>
                        <select
                          value={paymentStatusFilter}
                          onChange={(e) =>
                            setPaymentStatusFilter(e.target.value)
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-all duration-300 ease-in-out hover:border-gray-400 focus:shadow-lg"
                        >
                          <option value="All">All Payments</option>
                          <option value="succeeded">Paid</option>
                          <option value="pending">Pending</option>
                          <option value="failed">Failed</option>
                          <option value="Cash On Delivery">
                            Cash On Delivery
                          </option>
                        </select>
                      </div>

                      {/* Sort By */}
                      <div className="transform transition-all duration-300 ease-in-out hover:scale-105">
                        <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-200">
                          <FiFilter className="inline mr-1 transition-transform duration-200" />
                          Sort By
                        </label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-all duration-300 ease-in-out hover:border-gray-400 focus:shadow-lg"
                        >
                          <option value="createdAt">Order Date</option>
                          <option value="totalPrice">Amount</option>
                          <option value="status">Status</option>
                          <option value="itemsQty">Items Count</option>
                          <option value="orderNumber">Order Number</option>
                        </select>
                      </div>

                      {/* Sort Order */}
                      <div className="transform transition-all duration-300 ease-in-out hover:scale-105">
                        <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-200">
                          <FiRefreshCw className="inline mr-1 transition-transform duration-200" />
                          Sort Order
                        </label>
                        <select
                          value={sortOrder}
                          onChange={(e) => setSortOrder(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-all duration-300 ease-in-out hover:border-gray-400 focus:shadow-lg"
                        >
                          <option value="desc">Newest First</option>
                          <option value="asc">Oldest First</option>
                        </select>
                      </div>

                      {/* Date Range Filter */}
                      <div className="transform transition-all duration-300 ease-in-out hover:scale-105">
                        <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-200">
                          <FiCalendar className="inline mr-1 transition-transform duration-200" />
                          Date Range
                        </label>
                        <div className="space-y-2">
                          <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) =>
                              setDateRange((prev) => ({
                                ...prev,
                                startDate: e.target.value,
                              }))
                            }
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-300 ease-in-out hover:border-gray-400 focus:shadow-lg"
                            placeholder="Start Date"
                          />
                          <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) =>
                              setDateRange((prev) => ({
                                ...prev,
                                endDate: e.target.value,
                              }))
                            }
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-300 ease-in-out hover:border-gray-400 focus:shadow-lg"
                            placeholder="End Date"
                          />
                        </div>
                      </div>

                      {/* Amount Range Filter */}
                      <div className="transform transition-all duration-300 ease-in-out hover:scale-105">
                        <label className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-200">
                          <AiOutlineDollarCircle className="inline mr-1 transition-transform duration-200" />
                          Amount Range (₹)
                        </label>
                        <div className="space-y-2">
                          <input
                            type="number"
                            value={amountRange.minAmount}
                            onChange={(e) =>
                              setAmountRange((prev) => ({
                                ...prev,
                                minAmount: e.target.value,
                              }))
                            }
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-300 ease-in-out hover:border-gray-400 focus:shadow-lg"
                            placeholder="Min Amount"
                            min="0"
                          />
                          <input
                            type="number"
                            value={amountRange.maxAmount}
                            onChange={(e) =>
                              setAmountRange((prev) => ({
                                ...prev,
                                maxAmount: e.target.value,
                              }))
                            }
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-300 ease-in-out hover:border-gray-400 focus:shadow-lg"
                            placeholder="Max Amount"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Filter Summary */}
                    <div className="mt-4 pt-4 border-t border-gray-200 transform transition-all duration-300 ease-in-out">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="transition-colors duration-200">
                          Showing {filteredRows.length} of {totalOrders} orders
                          {hasActiveFilters && " (filtered)"}
                          {sortBy !== "createdAt" || sortOrder !== "desc" ? (
                            <span className="ml-2 text-blue-600 transition-colors duration-200">
                              • Sorted by{" "}
                              {sortBy === "createdAt"
                                ? "Date"
                                : sortBy === "totalPrice"
                                ? "Amount"
                                : sortBy === "itemsQty"
                                ? "Items"
                                : sortBy}
                              ({sortOrder === "desc" ? "Desc" : "Asc"})
                            </span>
                          ) : (
                            ""
                          )}
                        </span>
                        {hasActiveFilters && (
                          <span className="text-blue-600 font-medium transition-all duration-200 ease-in-out animate-pulse">
                            {[
                              statusFilter !== "All" && "Status",
                              paymentStatusFilter !== "All" && "Payment",
                              (dateRange.startDate || dateRange.endDate) &&
                                "Date",
                              (amountRange.minAmount ||
                                amountRange.maxAmount) &&
                                "Amount",
                              (sortBy !== "createdAt" ||
                                sortOrder !== "desc") &&
                                "Sort",
                            ]
                              .filter(Boolean)
                              .join(", ")}{" "}
                            filter(s) active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className={`${styles.card} overflow-hidden`}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <HiOutlineShoppingBag className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Orders List
                      </h2>
                      <p className="text-sm text-gray-500">
                        {filteredRows.length} order
                        {filteredRows.length !== 1 ? "s" : ""} found
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-[600px] w-full">
                <DataGrid
                  rows={filteredRows}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  disableSelectionOnClick
                  autoHeight={false}
                  className="!border-0"
                  sx={{
                    "& .MuiDataGrid-main": {
                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#f8fafc",
                        borderBottom: "1px solid #e2e8f0",
                        "& .MuiDataGrid-columnHeader": {
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          color: "#374151",
                          padding: "12px",
                        },
                      },
                      "& .MuiDataGrid-cell": {
                        padding: "12px",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: "0.875rem",
                      },
                      "& .MuiDataGrid-row": {
                        "&:hover": {
                          backgroundColor: "#f8fafc",
                        },
                      },
                    },
                    "& .MuiDataGrid-footerContainer": {
                      borderTop: "1px solid #e2e8f0",
                      backgroundColor: "#f8fafc",
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Cancel Order
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this order? The customer will be
              notified via email.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Reason (Optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeCancelDialog}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmCancelOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardOrders;
