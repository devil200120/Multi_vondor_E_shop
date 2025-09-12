import React, { useEffect } from "react";
import { AiOutlineMoneyCollect } from "react-icons/ai";
import { MdBorderClear } from "react-icons/md";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfAdmin } from "../../redux/actions/order";
import { getAllSellers } from "../../redux/actions/sellers";
import { DataGrid } from "@material-ui/data-grid";
import {
  HiOutlineUserGroup,
  HiOutlineShoppingBag,
  HiOutlineViewGrid,
} from "react-icons/hi";

const AdminDashboardMain = () => {
  const dispatch = useDispatch();
  const { adminOrders, adminOrderLoading } = useSelector(
    (state) => state.order
  );
  const { sellers } = useSelector((state) => state.seller);

  useEffect(() => {
    dispatch(getAllOrdersOfAdmin());
    dispatch(getAllSellers());
  }, [dispatch]);

  const adminEarning =
    adminOrders &&
    adminOrders.reduce((acc, item) => acc + item.totalPrice * 0.1, 0);
  const adminBalance = adminEarning?.toFixed(2);

  const columns = [
    { field: "id", headerName: "Order ID", minWidth: 150, flex: 0.7 },
    {
      field: "status",
      headerName: "Status",
      minWidth: 130,
      flex: 0.7,
      cellClassName: (params) => {
        return params.getValue(params.id, "status") === "Delivered"
          ? "greenColor"
          : "redColor";
      },
    },
    {
      field: "itemsQty",
      headerName: "Items",
      type: "number",
      minWidth: 130,
      flex: 0.7,
    },
    {
      field: "total",
      headerName: "Total",
      type: "number",
      minWidth: 130,
      flex: 0.8,
    },
  ];

  const row = [];
  adminOrders &&
    adminOrders.forEach((item) => {
      row.push({
        id: item._id,
        itemsQty: item?.cart?.reduce((acc, item) => acc + item.qty, 0),
        total: "US$ " + item?.totalPrice,
        status: item?.status,
      });
    });

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <HiOutlineViewGrid className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600">
            Welcome back! Here's what's happening.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Earnings */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Earnings
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${adminBalance}
                </p>
                <div className="flex items-center mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    +12.5%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <AiOutlineMoneyCollect className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Sellers */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Sellers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {sellers && sellers.length}
                </p>
                <div className="flex items-center mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    +5.2%
                  </span>
                </div>
                <Link
                  to="/admin-sellers"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
                >
                  View Sellers →
                </Link>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <HiOutlineUserGroup className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {adminOrders && adminOrders.length}
                </p>
                <div className="flex items-center mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    +8.1%
                  </span>
                </div>
                <Link
                  to="/admin-orders"
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium mt-2 inline-block"
                >
                  View Orders →
                </Link>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <HiOutlineShoppingBag className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MdBorderClear className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Latest Orders
                  </h2>
                  <p className="text-sm text-gray-500">Recent order activity</p>
                </div>
              </div>
              <Link
                to="/admin-orders"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All
              </Link>
            </div>
          </div>

          <div className="p-6">
            {adminOrderLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <DataGrid
                rows={row}
                columns={columns}
                pageSize={10}
                disableSelectionOnClick
                autoHeight
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardMain;
