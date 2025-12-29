import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { DataGrid } from "@material-ui/data-grid";
import {
  AiOutlineEye,
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlinePlus,
} from "react-icons/ai";
import { MdOutlineAutorenew, MdPauseCircleOutline } from "react-icons/md";
import { Button } from "@material-ui/core";
import { toast } from "react-toastify";

const AllAdvertisements = () => {
  const { seller } = useSelector((state) => state.seller);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${server}/advertisement/vendor/my-ads`,
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        setAds(data.advertisements);
      }
    } catch (error) {
      console.error("Error fetching advertisements:", error);
      toast.error("Failed to load advertisements");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoRenew = async (id, currentStatus) => {
    try {
      const { data } = await axios.put(
        `${server}/advertisement/vendor/auto-renew/${id}`,
        { autoRenew: !currentStatus },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        fetchAdvertisements();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update auto-renew"
      );
    }
  };

  const handleCancelAd = async (id) => {
    if (
      !window.confirm("Are you sure you want to cancel this advertisement?")
    ) {
      return;
    }

    try {
      const { data } = await axios.put(
        `${server}/advertisement/vendor/cancel/${id}`,
        {},
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Advertisement cancelled successfully");
        fetchAdvertisements();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to cancel advertisement"
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAdTypeLabel = (type) => {
    const labels = {
      leaderboard: "Leaderboard (728×120)",
      top_sidebar: "Top Sidebar (200×120)",
      right_sidebar_top: "Right Sidebar Top (300×200)",
      right_sidebar_middle: "Right Sidebar Middle (300×200)",
      right_sidebar_bottom: "Right Sidebar Bottom (300×200)",
      featured_store: "Featured Store",
      featured_product: "Featured Product",
      newsletter_inclusion: "Newsletter Inclusion",
      editorial_writeup: "Editorial Write-up",
    };
    return labels[type] || type;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = (endDate) => {
    const days = Math.ceil(
      (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return days > 0 ? days : 0;
  };

  const columns = [
    {
      field: "title",
      headerName: "Title",
      minWidth: 200,
      flex: 1,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          {params.row.image?.url && (
            <img
              src={params.row.image.url}
              alt={params.row.title}
              className="w-12 h-8 object-cover rounded"
            />
          )}
          <span className="font-medium">{params.row.title}</span>
        </div>
      ),
    },
    {
      field: "adType",
      headerName: "Ad Type",
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <span className="text-xs">{getAdTypeLabel(params.value)}</span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 100,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
            params.value
          )}`}
        >
          {params.value.toUpperCase()}
        </span>
      ),
    },
    {
      field: "duration",
      headerName: "Duration",
      minWidth: 80,
      renderCell: (params) => <span>{params.value} months</span>,
    },
    {
      field: "totalPrice",
      headerName: "Price",
      minWidth: 100,
      renderCell: (params) => (
        <span className="font-semibold">${params.value}</span>
      ),
    },
    {
      field: "endDate",
      headerName: "Expires",
      minWidth: 120,
      renderCell: (params) => {
        const daysRemaining = getDaysRemaining(params.value);
        return (
          <div>
            <div className="text-xs">{formatDate(params.value)}</div>
            {params.row.status === "active" && (
              <div
                className={`text-[10px] ${
                  daysRemaining < 7
                    ? "text-red-600 font-semibold"
                    : "text-gray-500"
                }`}
              >
                {daysRemaining} days left
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: "analytics",
      headerName: "Analytics",
      minWidth: 120,
      renderCell: (params) => (
        <div className="text-xs">
          <div>👁️ {params.row.views || 0} views</div>
          <div>🖱️ {params.row.clicks || 0} clicks</div>
          <div className="text-[10px] text-gray-500">
            CTR: {params.row.clickThroughRate?.toFixed(2) || 0}%
          </div>
        </div>
      ),
    },
    {
      field: "autoRenew",
      headerName: "Auto-Renew",
      minWidth: 100,
      renderCell: (params) => (
        <button
          onClick={() => handleToggleAutoRenew(params.row.id, params.value)}
          disabled={
            params.row.status === "cancelled" ||
            params.row.status === "rejected"
          }
          className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
            params.value
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          } ${
            params.row.status === "cancelled" ||
            params.row.status === "rejected"
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {params.value ? "✓ ON" : "✗ OFF"}
        </button>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 150,
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <Link to={`/shop-dashboard/advertisement/analytics/${params.row.id}`}>
            <Button size="small" color="primary">
              <AiOutlineEye size={18} />
            </Button>
          </Link>

          {params.row.status === "active" && (
            <Button
              size="small"
              color="secondary"
              onClick={() => handleCancelAd(params.row.id)}
            >
              <MdPauseCircleOutline size={18} />
            </Button>
          )}

          {(params.row.status === "expired" ||
            params.row.status === "cancelled") && (
            <Link to={`/shop-dashboard/advertisement/renew/${params.row.id}`}>
              <Button size="small" style={{ color: "#10b981" }}>
                <MdOutlineAutorenew size={18} />
              </Button>
            </Link>
          )}
        </div>
      ),
    },
  ];

  const rows = ads.map((ad) => ({
    id: ad._id,
    title: ad.title,
    adType: ad.adType,
    status: ad.status,
    duration: ad.duration,
    totalPrice: ad.totalPrice,
    endDate: ad.endDate,
    views: ad.views,
    clicks: ad.clicks,
    clickThroughRate: ad.clickThroughRate,
    autoRenew: ad.autoRenew,
    image: ad.image,
  }));

  return (
    <div className="w-full mx-8 pt-1 mt-10 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            My Advertisements
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your advertising campaigns and track performance
          </p>
        </div>
        <Link to="/shop-dashboard/advertisement/create">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AiOutlinePlus />}
          >
            Create Advertisement
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500">
          <div className="text-sm text-gray-600 mb-1">Active Ads</div>
          <div className="text-2xl font-bold text-green-700">
            {ads.filter((ad) => ad.status === "active").length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border-l-4 border-yellow-500">
          <div className="text-sm text-gray-600 mb-1">Pending Approval</div>
          <div className="text-2xl font-bold text-yellow-700">
            {ads.filter((ad) => ad.status === "pending").length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 mb-1">Total Views</div>
          <div className="text-2xl font-bold text-blue-700">
            {ads.reduce((sum, ad) => sum + (ad.views || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-l-4 border-purple-500">
          <div className="text-sm text-gray-600 mb-1">Total Clicks</div>
          <div className="text-2xl font-bold text-purple-700">
            {ads
              .reduce((sum, ad) => sum + (ad.clicks || 0), 0)
              .toLocaleString()}
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="p-6">
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          disableSelectionOnClick
          autoHeight
          loading={loading}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </div>
    </div>
  );
};

export default AllAdvertisements;
