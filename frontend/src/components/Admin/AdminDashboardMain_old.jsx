import React, { useEffect } from "react";
import { 
  AiOutlineArrowRight
} from "react-icons/ai";
import { 
  MdDashboard, 
  MdStore
} from "react-icons/md";
import { FiShoppingBag, FiDollarSign } from "react-icons/fi";
import { Link } from "react-router-dom";
import { DataGrid } from "@material-ui/data-grid";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfAdmin } from "../../redux/actions/order";
import Loader from "../Layout/Loader";
import { getAllSellers } from "../../redux/actions/sellers";

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
    { 
      field: "id", 
      headerName: "Order ID", 
      minWidth: 150, 
      flex: 0.7,
      renderCell: (params) => (
        <span className="text-[#27b3e2] font-medium">#{params.value.slice(0, 8)}</span>
      )
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 130,
      flex: 0.7,
      renderCell: (params) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          params.value === "Delivered" 
            ? "bg-green-100 text-green-800" 
            : params.value === "Processing"
            ? "bg-blue-100 text-blue-800"
            : "bg-orange-100 text-orange-800"
        }`}>
          {params.value}
        </span>
      )
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
      renderCell: (params) => (
        <span className="font-semibold text-gray-800">{params.value}</span>
      )
    },
    {
      field: "createdAt",
      headerName: "Order Date",
      type: "string",
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
        total: "$" + item?.totalPrice,
        status: item?.status,
        createdAt: item?.createdAt.slice(0, 10),
      });
    });

  const statsCards = [
    {
      title: "Total Earnings",
      value: `$${adminBalance}`,
      icon: FiDollarSign,
      gradient: "from-emerald-500 to-teal-600",
      change: "+12.5%",
      changeType: "positive"
    },
    {
      title: "Total Sellers",
      value: sellers && sellers.length,
      icon: MdStore,
      gradient: "from-blue-500 to-indigo-600",
      change: "+5.2%",
      changeType: "positive",
      link: "/admin-sellers",
      linkText: "View Sellers"
    },
    {
      title: "Total Orders",
      value: adminOrders && adminOrders.length,
      icon: FiShoppingBag,
      gradient: "from-purple-500 to-pink-600",
      change: "+8.1%",
      changeType: "positive",
      link: "/admin-orders",
      linkText: "View Orders"
    }
  ];

  return (
    <>
      {adminOrderLoading ? (
        <Loader />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-[#27b3e2] to-[#38cb89] rounded-xl flex items-center justify-center">
                <MdDashboard className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening.</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statsCards.map((card, index) => (
              <div key={index} className="group relative overflow-hidden">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${card.gradient} text-white shadow-lg`}>
                      <card.icon size={24} />
                    </div>
                    <div className={`text-sm font-semibold px-2 py-1 rounded-full ${
                      card.changeType === 'positive' 
                        ? 'text-green-600 bg-green-100' 
                        : 'text-red-600 bg-red-100'
                    }`}>
                      {card.change}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-gray-600 text-sm font-medium">{card.title}</h3>
                    <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                    
                    {card.link && (
                      <Link 
                        to={card.link}
                        className="inline-flex items-center text-[#27b3e2] hover:text-[#38cb89] font-medium text-sm transition-colors mt-3 group"
                      >
                        {card.linkText}
                        <AiOutlineArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Latest Orders */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#27b3e2] to-[#38cb89] rounded-lg flex items-center justify-center">
                    <FiShoppingBag className="text-white text-sm" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Latest Orders</h2>
                    <p className="text-gray-600 text-sm">Recent order activity</p>
                  </div>
                </div>
                <Link 
                  to="/admin-orders"
                  className="px-4 py-2 bg-gradient-to-r from-[#27b3e2] to-[#38cb89] text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            
            <div className="p-0">
              <DataGrid
                rows={row}
                columns={columns}
                pageSize={10}
                disableSelectionOnClick
                autoHeight
                className="border-0"
                style={{
                  border: 'none',
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #f3f4f6',
                    padding: '12px 16px',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f9fafb',
                    border: 'none',
                    fontWeight: 600,
                    color: '#374151',
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: '#f9fafb',
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboardMain;
