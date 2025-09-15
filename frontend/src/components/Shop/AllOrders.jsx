import { DataGrid } from "@material-ui/data-grid";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../Layout/Loader";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { AiOutlineEye } from "react-icons/ai";
import {
  FiPackage,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";
import { MdFilterList, MdSearch } from "react-icons/md";

const AllOrders = () => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const dispatch = useDispatch();

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllOrdersOfShop(seller._id));
    }
  }, [dispatch, seller]);

  useEffect(() => {
    if (orders) {
      let filtered = [...orders];

      // Filter by status
      if (statusFilter !== "All") {
        filtered = filtered.filter((order) => order.status === statusFilter);
      }

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(
          (order) =>
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setFilteredOrders(filtered);
    }
  }, [orders, statusFilter, searchTerm]);

  // Calculate stats
  const totalOrders = orders?.length || 0;
  const deliveredOrders =
    orders?.filter((order) => order.status === "Delivered").length || 0;
  const processingOrders =
    orders?.filter((order) => order.status === "Processing").length || 0;
  const totalRevenue =
    orders?.reduce((acc, order) => acc + order.totalPrice, 0) || 0;

  const columns = [
    {
      field: "id",
      headerName: "Order ID",
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => (
        <div className="font-medium text-gray-900 text-sm">
          #{params.value.slice(-8)}
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      flex: 0.7,
      renderCell: (params) => {
        const getStatusColor = (status) => {
          switch (status) {
            case "Delivered":
              return "bg-green-100 text-green-800";
            case "Processing":
              return "bg-blue-100 text-blue-800";
            case "Pending":
              return "bg-yellow-100 text-yellow-800";
            case "Cancelled":
              return "bg-red-100 text-red-800";
            default:
              return "bg-gray-100 text-gray-800";
          }
        };

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
              params.value
            )}`}
          >
            {params.value}
          </span>
        );
      },
    },
    {
      field: "itemsQty",
      headerName: "Items",
      type: "number",
      minWidth: 80,
      flex: 0.5,
      renderCell: (params) => (
        <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-full">
          <span className="text-sm font-semibold text-blue-700">
            {params.value}
          </span>
        </div>
      ),
    },
    {
      field: "total",
      headerName: "Total",
      minWidth: 120,
      flex: 0.7,
      renderCell: (params) => (
        <span className="font-bold text-gray-900 text-sm">{params.value}</span>
      ),
    },
    {
      field: "createdAt",
      headerName: "Date",
      minWidth: 120,
      flex: 0.7,
      renderCell: (params) => (
        <span className="text-sm text-gray-600">
          {new Date(params.value).toLocaleDateString()}
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
        <Link
          to={`/order/${params.row.id}`}
          className="inline-flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all duration-200 text-sm font-medium border border-blue-200 hover:border-blue-300"
        >
          <AiOutlineEye className="mr-1" size={16} />
          <span className="hidden sm:inline">View</span>
        </Link>
      ),
    },
  ];

  const row = [];

  filteredOrders &&
    filteredOrders.forEach((item) => {
      row.push({
        id: item._id,
        itemsQty:
          item.cart?.reduce((acc, cartItem) => acc + cartItem.qty, 0) || 0,
        total: "₹" + item.totalPrice?.toFixed(2),
        status: item.status,
        createdAt: item.createdAt,
      });
    });

  // Stats Card Component
  const StatsCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <div
      className={`${bgColor} rounded-xl p-4 lg:p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl lg:text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${color
            .replace("text", "bg")
            .replace("600", "100")}`}
        >
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  // Mobile Order Card Component
  const MobileOrderCard = ({ order }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-gray-900 text-sm">
          #{order.id.slice(-8)}
        </span>
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            order.status === "Delivered"
              ? "bg-green-100 text-green-800"
              : order.status === "Processing"
              ? "bg-blue-100 text-blue-800"
              : order.status === "Pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {order.status}
        </span>
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <FiPackage className="text-gray-500" size={14} />
            <span className="text-sm text-gray-600">
              {order.itemsQty} items
            </span>
          </div>
          <span className="font-bold text-gray-900 text-sm">{order.total}</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {new Date(order.createdAt).toLocaleDateString()}
        </span>
        <Link
          to={`/order/${order.id}`}
          className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
        >
          <AiOutlineEye className="mr-1" size={14} />
          View
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full p-4 lg:p-8 bg-gray-50 min-h-screen">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Orders Management
            </h1>
            <p className="text-gray-600">
              Track and manage all your orders in one place
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <StatsCard
              title="Total Orders"
              value={totalOrders.toLocaleString()}
              icon={FiPackage}
              color="text-blue-600"
              bgColor="bg-white"
            />
            <StatsCard
              title="Delivered"
              value={deliveredOrders.toLocaleString()}
              icon={FiCheckCircle}
              color="text-green-600"
              bgColor="bg-white"
            />
            <StatsCard
              title="Processing"
              value={processingOrders.toLocaleString()}
              icon={FiClock}
              color="text-yellow-600"
              bgColor="bg-white"
            />
            <StatsCard
              title="Total Revenue"
              value={`$${totalRevenue.toLocaleString()}`}
              icon={FiDollarSign}
              color="text-purple-600"
              bgColor="bg-white"
            />
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white"
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <MdFilterList className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                Showing {filteredOrders.length} of {totalOrders} orders
              </div>
            </div>
          </div>

          {/* Orders Table/Cards */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 lg:p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <FiPackage className="mr-2" />
                All Orders
              </h2>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <div className="min-h-[500px]">
                <DataGrid
                  rows={row}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  disableSelectionOnClick
                  autoHeight
                  className="border-0"
                />
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden p-4 space-y-4">
              {row.length === 0 ? (
                <div className="text-center py-12">
                  <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No orders found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== "All"
                      ? "Try adjusting your search criteria"
                      : "Orders will appear here when customers place them"}
                  </p>
                </div>
              ) : (
                row.map((order, index) => (
                  <MobileOrderCard key={index} order={order} />
                ))
              )}
            </div>

            {/* Empty State for Desktop */}
            {row.length === 0 && (
              <div className="hidden lg:block text-center py-12">
                <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No orders found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== "All"
                    ? "Try adjusting your search criteria"
                    : "Orders will appear here when customers place them"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AllOrders;
