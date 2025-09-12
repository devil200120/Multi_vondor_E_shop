import React, { useEffect } from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import { DataGrid } from "@material-ui/data-grid";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfAdmin } from "../redux/actions/order";

const AdminDashboardOrders = () => {
  const dispatch = useDispatch();

  const { adminOrders, adminOrderLoading } = useSelector(
    (state) => state.order
  );

  useEffect(() => {
    dispatch(getAllOrdersOfAdmin());
  }, []);

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
      headerName: "Items Qty",
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
    {
      field: "createdAt",
      headerName: "Order Date",
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
        total: item?.totalPrice + " $",
        status: item?.status,
        createdAt: item?.createdAt.slice(0, 10),
      });
    });
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSideBar active={2} />
        <div className="flex-1 bg-gray-50 min-h-screen">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                All Orders
              </h1>
              <p className="text-gray-600">Manage all platform orders</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <DataGrid
                  rows={row}
                  columns={columns}
                  pageSize={10}
                  disableSelectionOnClick
                  autoHeight
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
