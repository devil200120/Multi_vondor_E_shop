import React, { useEffect, useState } from "react";
import { DataGrid } from "@material-ui/data-grid";
import { Button } from "@material-ui/core";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { AiOutlineCheck, AiOutlineClose, AiOutlineEye } from "react-icons/ai";

const AdminAdvertisements = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAd, setSelectedAd] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchAdvertisements();
  }, [statusFilter]);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const url =
        statusFilter === "all"
          ? `${server}/advertisement/admin/all`
          : `${server}/advertisement/admin/all?status=${statusFilter}`;

      const { data } = await axios.get(url, {
        withCredentials: true,
      });

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

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this advertisement?")) {
      return;
    }

    try {
      const { data } = await axios.put(
        `${server}/advertisement/admin/approve/${id}`,
        {},
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Advertisement approved successfully");
        fetchAdvertisements();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to approve advertisement"
      );
    }
  };

  const handleRejectClick = (ad) => {
    setSelectedAd(ad);
    setShowModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      const { data } = await axios.put(
        `${server}/advertisement/admin/reject/${selectedAd._id}`,
        { reason: rejectReason },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Advertisement rejected and refund initiated");
        setShowModal(false);
        setRejectReason("");
        setSelectedAd(null);
        fetchAdvertisements();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to reject advertisement"
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

  const columns = [
    {
      field: "shop",
      headerName: "Vendor",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          {params.row.shopAvatar && (
            <img
              src={params.row.shopAvatar}
              alt={params.row.shopName}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <span className="font-medium">{params.row.shopName}</span>
        </div>
      ),
    },
    {
      field: "title",
      headerName: "Title",
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          {params.row.image && (
            <img
              src={params.row.image}
              alt={params.row.title}
              className="w-12 h-8 object-cover rounded"
            />
          )}
          <span>{params.row.title}</span>
        </div>
      ),
    },
    {
      field: "adType",
      headerName: "Ad Type",
      minWidth: 150,
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
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
      field: "totalPrice",
      headerName: "Price",
      minWidth: 100,
      renderCell: (params) => (
        <span className="font-semibold">${params.value}</span>
      ),
    },
    {
      field: "duration",
      headerName: "Duration",
      minWidth: 100,
      renderCell: (params) => <span>{params.value} months</span>,
    },
    {
      field: "createdAt",
      headerName: "Created",
      minWidth: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 150,
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <Button
            size="small"
            onClick={() => window.open(params.row.image, "_blank")}
            title="View Image"
          >
            <AiOutlineEye size={18} />
          </Button>

          {params.row.status === "pending" && (
            <>
              <Button
                size="small"
                style={{ color: "#10b981" }}
                onClick={() => handleApprove(params.row.id)}
                title="Approve"
              >
                <AiOutlineCheck size={18} />
              </Button>
              <Button
                size="small"
                color="secondary"
                onClick={() => handleRejectClick(params.row)}
                title="Reject"
              >
                <AiOutlineClose size={18} />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const rows = ads.map((ad) => ({
    id: ad._id,
    shopName: ad.shopId?.name || "Unknown",
    shopAvatar: ad.shopId?.avatar?.url,
    title: ad.title,
    adType: ad.adType,
    status: ad.status,
    totalPrice: ad.totalPrice,
    duration: ad.duration,
    image: ad.image?.url,
    createdAt: ad.createdAt,
  }));

  return (
    <div className="w-full mx-8 pt-1 mt-10 bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-800">
          Advertisement Management
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Review and manage vendor advertisements
        </p>
      </div>

      {/* Status Filter */}
      <div className="p-6 border-b">
        <div className="flex gap-2">
          {["all", "pending", "active", "rejected", "expired"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                statusFilter === status
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border-l-4 border-yellow-500">
          <div className="text-sm text-gray-600 mb-1">Pending Approval</div>
          <div className="text-2xl font-bold text-yellow-700">
            {ads.filter((ad) => ad.status === "pending").length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500">
          <div className="text-sm text-gray-600 mb-1">Active Ads</div>
          <div className="text-2xl font-bold text-green-700">
            {ads.filter((ad) => ad.status === "active").length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-blue-700">
            $
            {ads
              .filter((ad) => ad.status === "active")
              .reduce((sum, ad) => sum + ad.totalPrice, 0)
              .toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border-l-4 border-red-500">
          <div className="text-sm text-gray-600 mb-1">Rejected</div>
          <div className="text-2xl font-bold text-red-700">
            {ads.filter((ad) => ad.status === "rejected").length}
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

      {/* Reject Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Reject Advertisement
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this advertisement. A refund
              will be processed automatically.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setRejectReason("");
                  setSelectedAd(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject & Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdvertisements;
