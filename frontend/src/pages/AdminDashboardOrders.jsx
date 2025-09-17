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
} from "react-icons/fi";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { MdPending, MdCheckCircle, MdCancel } from "react-icons/md";
import { AiOutlineDollarCircle } from "react-icons/ai";
import { Button } from "@material-ui/core";
import { downloadBulkOrderCSV } from "../utils/csvExporter";
import InvoiceDownloadButton from "../components/InvoiceDownloadButton";
import { toast } from "react-toastify";

const AdminDashboardOrders = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");

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
          #{params.value.slice(0, 8)}
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
        itemsQty: item?.cart?.reduce((acc, item) => acc + item.qty, 0),
        total: "$" + item?.totalPrice?.toFixed(2),
        status: item?.status,
        createdAt: item?.createdAt.slice(0, 10),
      });
    });

  // Filter orders based on search term
  const filteredRows = row.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.total.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                      ${totalRevenue.toFixed(2)}
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
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 min-w-0">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search orders by ID, status, or amount..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.input}
                    style={{ paddingLeft: "2.5rem" }}
                  />
                </div>

                {/* Bulk Export Button */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBulkExport}
                    disabled={filteredRows.length === 0}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    title="Export filtered orders to CSV"
                  >
                    <FiDownload className="mr-2 h-4 w-4" />
                    Export CSV ({filteredRows.length})
                  </button>
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
    </div>
  );
};

export default AdminDashboardOrders;
