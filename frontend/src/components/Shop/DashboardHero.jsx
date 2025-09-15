import React, { useEffect, useState } from "react";
import {
  AiOutlineArrowRight,
  AiOutlineMoneyCollect,
  AiOutlineTrendingUp,
} from "react-icons/ai";
import { Link } from "react-router-dom";
import { MdBorderClear, MdTrendingUp, MdShoppingCart } from "react-icons/md";
import { FiPackage, FiDollarSign, FiUsers, FiTrendingUp } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { getAllProductsShop } from "../../redux/actions/product";
import { DataGrid } from "@material-ui/data-grid";
import { IoStatsChart } from "react-icons/io5";
import { BsBox, BsGraphUp } from "react-icons/bs";

const DashboardHero = () => {
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const { products } = useSelector((state) => state.products);

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllOrdersOfShop(seller._id));
      dispatch(getAllProductsShop(seller._id));
    }
  }, [dispatch, seller]);

  // Stats calculations
  const availableBalance = seller?.availableBalance?.toFixed(2) || "0.00";
  const totalOrders = orders?.length || 0;
  const totalProducts = products?.length || 0;
  const deliveredOrders =
    orders?.filter((order) => order.status === "Delivered").length || 0;
  const pendingOrders =
    orders?.filter((order) => order.status !== "Delivered").length || 0;
  const totalRevenue =
    orders
      ?.reduce((acc, order) => acc + (order.totalPrice || 0), 0)
      .toFixed(2) || "0.00";

  // Mobile responsive stats card component
  const StatsCard = ({
    title,
    value,
    icon: Icon,
    color,
    trend,
    trendValue,
  }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 md:p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:scale-105 group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm font-semibold text-gray-500 mb-1 md:mb-2 uppercase tracking-wider">
            {title}
          </p>
          <p
            className={`text-xl sm:text-2xl md:text-3xl font-bold ${color} mb-1 md:mb-2 truncate`}
          >
            {value}
          </p>
          {trend && (
            <div className="flex items-center space-x-1">
              <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-full">
                <FiTrendingUp className="text-green-600" size={12} />
                <span className="text-xs text-green-600 font-bold">
                  {trendValue}
                </span>
              </div>
            </div>
          )}
        </div>
        <div
          className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-all duration-300 group-hover:scale-110 ${color
            .replace("text", "bg")
            .replace("600", "100")}`}
        >
          <Icon className={`${color} w-5 h-5 md:w-6 md:h-6`} />
        </div>
      </div>
    </div>
  );

  // Mobile-optimized table columns
  const columns = [
    {
      field: "id",
      headerName: "Order ID",
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => (
        <span className="font-medium text-gray-900 text-xs md:text-sm truncate">
          #{params.value.slice(-6)}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 100,
      flex: 0.6,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${
            params.value === "Delivered"
              ? "bg-green-100 text-green-800"
              : params.value === "Processing"
              ? "bg-blue-100 text-blue-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "itemsQty",
      headerName: "Items",
      type: "number",
      minWidth: 70,
      flex: 0.5,
      renderCell: (params) => (
        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
          <span className="text-xs font-bold text-gray-700">
            {params.value}
          </span>
        </div>
      ),
    },
    {
      field: "total",
      headerName: "Total",
      minWidth: 100,
      flex: 0.7,
      renderCell: (params) => (
        <span className="font-bold text-gray-900 text-sm">{params.value}</span>
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
          className="inline-flex items-center px-2 md:px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-600 rounded-lg transition-all duration-200 text-xs md:text-sm font-bold border border-blue-200/50 hover:border-blue-300/50 transform hover:scale-105"
        >
          <span className="hidden md:inline">View</span>
          <span className="md:hidden">•••</span>
          <AiOutlineArrowRight className="ml-1 hidden md:inline" size={12} />
        </Link>
      ),
    },
  ];

  const row = [];

  orders &&
    orders.forEach((item) => {
      row.push({
        id: item._id,
        itemsQty: item.cart.reduce((acc, item) => acc + item.qty, 0),
        total: "₹" + item.totalPrice,
        status: item.status,
      });
    });

  // Mobile card component for orders
  const MobileOrderCard = ({ order }) => (
    <div className="bg-white rounded-xl border border-gray-200/50 p-4 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-gray-900 text-sm">
          #{order.id.slice(-6)}
        </span>
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${
            order.status === "Delivered"
              ? "bg-green-100 text-green-800"
              : order.status === "Processing"
              ? "bg-blue-100 text-blue-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {order.status}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <FiPackage className="text-gray-500" size={14} />
            <span className="text-sm text-gray-600">
              {order.itemsQty} items
            </span>
          </div>
          <span className="font-bold text-gray-900">{order.total}</span>
        </div>
        <Link
          to={`/order/${order.id}`}
          className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 rounded-lg text-sm font-bold hover:from-blue-100 hover:to-purple-100 transition-all duration-200 transform hover:scale-105"
        >
          View
          <AiOutlineArrowRight className="ml-1" size={12} />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-3 md:p-6 lg:ml-51">
      {/* Welcome Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {seller?.name}
          </span>
          ! 👋
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <StatsCard
          title="Total Revenue"
          value={`₹${totalRevenue}`}
          icon={FiDollarSign}
          color="text-green-600"
          trend={true}
          trendValue="+12.5%"
        />
        <StatsCard
          title="Total Orders"
          value={totalOrders.toLocaleString()}
          icon={MdBorderClear}
          color="text-blue-600"
          trend={true}
          trendValue="+8.2%"
        />
        <StatsCard
          title="Products"
          value={totalProducts.toLocaleString()}
          icon={FiPackage}
          color="text-purple-600"
        />
        <StatsCard
          title="Available Balance"
          value={`₹${availableBalance}`}
          icon={AiOutlineMoneyCollect}
          color="text-indigo-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <Link
          to="/dashboard-create-product"
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 md:p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group transform hover:scale-105"
        >
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="p-2 md:p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl md:rounded-2xl group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 group-hover:scale-110">
              <FiPackage className="text-blue-600 w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">
                Add Product
              </h3>
              <p className="text-xs md:text-sm text-gray-600 truncate">
                Create a new product
              </p>
            </div>
            <AiOutlineArrowRight
              className="text-gray-400 group-hover:text-blue-600 transition-all duration-300 group-hover:translate-x-1 flex-shrink-0"
              size={16}
            />
          </div>
        </Link>

        <Link
          to="/dashboard-orders"
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 md:p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group transform hover:scale-105"
        >
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="p-2 md:p-3 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl md:rounded-2xl group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300 group-hover:scale-110">
              <MdBorderClear className="text-purple-600 w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">
                View Orders
              </h3>
              <p className="text-xs md:text-sm text-gray-600 truncate">
                {pendingOrders} pending orders
              </p>
            </div>
            <AiOutlineArrowRight
              className="text-gray-400 group-hover:text-purple-600 transition-all duration-300 group-hover:translate-x-1 flex-shrink-0"
              size={16}
            />
          </div>
        </Link>

        <Link
          to="/dashboard-withdraw-money"
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 md:p-6 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 group transform hover:scale-105 md:col-span-1"
        >
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="p-2 md:p-3 bg-gradient-to-r from-green-100 to-green-200 rounded-xl md:rounded-2xl group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300 group-hover:scale-110">
              <FiDollarSign className="text-green-600 w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">
                Withdraw Money
              </h3>
              <p className="text-xs md:text-sm text-gray-600 truncate">
                Available: ₹{availableBalance}
              </p>
            </div>
            <AiOutlineArrowRight
              className="text-gray-400 group-hover:text-green-600 transition-all duration-300 group-hover:translate-x-1 flex-shrink-0"
              size={16}
            />
          </div>
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden shadow-lg">
        <div className="p-4 md:p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <MdBorderClear className="text-white" size={18} />
              </div>
              <span>Recent Orders</span>
            </h2>
            <Link
              to="/dashboard-orders"
              className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center space-x-1 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <span>View All</span>
              <AiOutlineArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <div style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={row}
              columns={columns}
              pageSize={5}
              disableSelectionOnClick
              autoHeight
              className="border-0"
              style={{
                border: "none",
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #f1f5f9",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                },
              }}
            />
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-3">
          {row.slice(0, 5).map((order, index) => (
            <MobileOrderCard key={index} order={order} />
          ))}
          {row.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdBorderClear className="text-gray-400" size={24} />
              </div>
              <p className="text-gray-500 text-sm">No orders yet</p>
              <Link
                to="/dashboard-create-product"
                className="inline-flex items-center space-x-1 text-blue-600 font-medium text-sm mt-2"
              >
                <span>Create your first product</span>
                <AiOutlineArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;
