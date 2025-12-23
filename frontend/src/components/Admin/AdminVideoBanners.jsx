import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { DataGrid } from "@material-ui/data-grid";
import { AiOutlineEye, AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { BsCheck, BsX, BsClock } from "react-icons/bs";
import { MdVideoLibrary } from "react-icons/md";
import styles from "../../styles/styles";

const AdminVideoBanners = () => {
  const [videoBanners, setVideoBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'approve', 'reject', 'view', 'edit'
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [analytics, setAnalytics] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: 1,
    startDate: "",
    endDate: "",
    targetAudience: "all",
    isActive: true,
  });

  const fetchVideoBanners = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching video banners..."); // Debug log
      const response = await axios.get(
        `${server}/video-banner/admin-all-video-banners?status=${statusFilter}`,
        { withCredentials: true }
      );

      console.log("Response:", response.data); // Debug log
      if (response.data.success) {
        setVideoBanners(response.data.videoBanners);
      }
    } catch (error) {
      toast.error("Failed to fetch video banners");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchAnalytics = useCallback(async () => {
    try {
      console.log("Fetching analytics..."); // Debug log
      const response = await axios.get(
        `${server}/video-banner/banner-analytics`,
        { withCredentials: true }
      );

      console.log("Analytics response:", response.data); // Debug log
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      // Don't show error toast for analytics as it's not critical
    }
  }, []);

  useEffect(() => {
    fetchVideoBanners();
    fetchAnalytics();
  }, [fetchVideoBanners, fetchAnalytics]);

  const handleApprovalAction = async (bannerId, action, reason = null) => {
    try {
      const response = await axios.put(
        `${server}/video-banner/update-banner-approval/${bannerId}`,
        {
          approvalStatus: action,
          rejectionReason: reason,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(`Video banner ${action} successfully`);
        fetchVideoBanners();
        fetchAnalytics();
        setShowModal(false);
        setRejectionReason("");
      }
    } catch (error) {
      toast.error(`Failed to ${action} video banner`);
      console.error("Error:", error);
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (window.confirm("Are you sure you want to delete this video banner?")) {
      try {
        const response = await axios.delete(
          `${server}/video-banner/delete-video-banner/${bannerId}`,
          { withCredentials: true }
        );

        if (response.data.success) {
          toast.success("Video banner deleted successfully");
          fetchVideoBanners();
          fetchAnalytics();
        }
      } catch (error) {
        toast.error("Failed to delete video banner");
        console.error("Error:", error);
      }
    }
  };

  const openModal = (type, banner = null) => {
    setModalType(type);
    setSelectedBanner(banner);

    // If editing, populate the form with existing data
    if (type === "edit" && banner) {
      setEditForm({
        title: banner.title || "",
        description: banner.description || "",
        priority: banner.priority || 1,
        startDate: banner.startDate
          ? new Date(banner.startDate).toISOString().split("T")[0]
          : "",
        endDate: banner.endDate
          ? new Date(banner.endDate).toISOString().split("T")[0]
          : "",
        targetAudience: banner.targetAudience || "all",
        isActive: banner.isActive !== undefined ? banner.isActive : true,
      });
    }

    setShowModal(true);
  };

  const handleEditBanner = async () => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${server}/video-banner/update-video-banner/${selectedBanner._id}`,
        editForm,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Video banner updated successfully!");
        fetchVideoBanners();
        fetchAnalytics();
        setShowModal(false);
        resetEditForm();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating banner");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetEditForm = () => {
    setEditForm({
      title: "",
      description: "",
      priority: 1,
      startDate: "",
      endDate: "",
      targetAudience: "all",
      isActive: true,
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <BsCheck className="text-green-600" />;
      case "rejected":
        return <BsX className="text-red-600" />;
      case "pending":
        return <BsClock className="text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns = [
    { field: "id", headerName: "ID", minWidth: 100, flex: 0.5 },
    {
      field: "thumbnail",
      headerName: "Thumbnail",
      minWidth: 120,
      flex: 0.7,
      renderCell: (params) => (
        <div className="flex items-center h-full">
          <img
            src={params.row.thumbnail}
            alt="Thumbnail"
            className="w-16 h-12 object-cover rounded"
          />
        </div>
      ),
    },
    {
      field: "title",
      headerName: "Title",
      minWidth: 200,
      flex: 1,
    },
    {
      field: "product",
      headerName: "Target Product",
      minWidth: 180,
      flex: 1,
    },
    {
      field: "shop",
      headerName: "Shop",
      minWidth: 150,
      flex: 0.8,
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      flex: 0.7,
      renderCell: (params) => (
        <div
          className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${getStatusColor(
            params.row.status
          )}`}
        >
          {getStatusIcon(params.row.status)}
          <span className="capitalize">{params.row.status}</span>
        </div>
      ),
    },
    {
      field: "priority",
      headerName: "Priority",
      minWidth: 80,
      flex: 0.5,
      renderCell: (params) => (
        <span className="font-medium">{params.row.priority}</span>
      ),
    },
    {
      field: "clicks",
      headerName: "Clicks",
      minWidth: 80,
      flex: 0.5,
      renderCell: (params) => (
        <span className="font-medium text-blue-600">{params.row.clicks}</span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <div className="flex gap-2">
          <button
            onClick={() => openModal("view", params.row.bannerData)}
            className="text-blue-600 hover:text-blue-800"
            title="View Details"
          >
            <AiOutlineEye size={18} />
          </button>

          <button
            onClick={() => openModal("edit", params.row.bannerData)}
            className="text-orange-600 hover:text-orange-800"
            title="Edit Banner"
          >
            <AiOutlineEdit size={18} />
          </button>

          {params.row.status === "pending" && (
            <>
              <button
                onClick={() => openModal("approve", params.row.bannerData)}
                className="text-green-600 hover:text-green-800"
                title="Approve"
              >
                <BsCheck size={18} />
              </button>
              <button
                onClick={() => openModal("reject", params.row.bannerData)}
                className="text-red-600 hover:text-red-800"
                title="Reject"
              >
                <BsX size={18} />
              </button>
            </>
          )}

          <button
            onClick={() => handleDeleteBanner(params.row.bannerData._id)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <AiOutlineDelete size={18} />
          </button>
        </div>
      ),
    },
  ];

  const rows = videoBanners.map((banner) => ({
    id: banner._id.slice(-8),
    thumbnail: banner.thumbnailUrl,
    title: banner.title,
    product: banner.productId?.name || "Product not found",
    shop: banner.shopId?.name || "Admin",
    status: banner.approvalStatus,
    priority: banner.priority,
    clicks: banner.clickCount,
    views: banner.viewCount,
    bannerData: banner,
  }));

  return (
    <div className="w-full mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <MdVideoLibrary size={28} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            Video Banner Management
          </h1>
        </div>

        <button
          onClick={() => (window.location.href = "/admin-create-video-banner")}
          className={`${styles.button} bg-blue-600 hover:bg-blue-700`}
        >
          + Create New Video Banner
        </button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 mb-1">Total Banners</h3>
            <p className="text-2xl font-bold text-gray-800">
              {analytics.totalBanners}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 mb-1">Total Clicks</h3>
            <p className="text-2xl font-bold text-blue-600">
              {analytics.totalClicks}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 mb-1">Total Views</h3>
            <p className="text-2xl font-bold text-green-600">
              {analytics.totalViews}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 mb-1">Pending Approval</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {analytics.pendingBanners}
            </p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Data Grid */}
      <div className="bg-white rounded-lg shadow">
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          disableSelectionOnClick
          autoHeight
          loading={loading}
          className="border-none"
        />
      </div>

      {/* Modal */}
      {showModal && selectedBanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold capitalize">
                {modalType} Video Banner
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {/* Banner Preview */}
            <div className="mb-4">
              <video
                src={selectedBanner.videoUrl}
                poster={selectedBanner.thumbnailUrl}
                controls
                className="w-full h-48 object-cover rounded"
              />
            </div>

            {/* Banner Details */}
            <div className="mb-4">
              <h3 className="font-semibold text-lg">{selectedBanner.title}</h3>
              {selectedBanner.description && (
                <p className="text-gray-600 mt-1">
                  {selectedBanner.description}
                </p>
              )}

              <div className="mt-3 space-y-2 text-sm">
                <p>
                  <strong>Target Product:</strong>{" "}
                  {selectedBanner.productId?.name}
                </p>
                <p>
                  <strong>Shop:</strong>{" "}
                  {selectedBanner.shopId?.name || "Admin"}
                </p>
                <p>
                  <strong>Priority:</strong> {selectedBanner.priority}
                </p>
                <p>
                  <strong>Clicks:</strong> {selectedBanner.clickCount}
                </p>
                <p>
                  <strong>Views:</strong> {selectedBanner.viewCount}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span
                    className={`ml-1 px-2 py-1 rounded text-xs ${getStatusColor(
                      selectedBanner.approvalStatus
                    )}`}
                  >
                    {selectedBanner.approvalStatus}
                  </span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {modalType === "approve" && (
                <button
                  onClick={() =>
                    handleApprovalAction(selectedBanner._id, "approved")
                  }
                  className={`${styles.button} bg-green-600 hover:bg-green-700 text-white`}
                >
                  Approve Banner
                </button>
              )}

              {modalType === "reject" && (
                <div className="w-full">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    className="w-full p-3 border rounded-lg mb-3"
                    rows={3}
                  />
                  <button
                    onClick={() =>
                      handleApprovalAction(
                        selectedBanner._id,
                        "rejected",
                        rejectionReason
                      )
                    }
                    className={`${styles.button} bg-red-600 hover:bg-red-700 text-white`}
                    disabled={!rejectionReason.trim()}
                  >
                    Reject Banner
                  </button>
                </div>
              )}

              {modalType === "edit" && (
                <div className="w-full space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="w-full p-2 border rounded-lg"
                        placeholder="Banner title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={editForm.priority}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            priority: parseInt(e.target.value),
                          }))
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={editForm.startDate}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                          }))
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={editForm.endDate}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }))
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Audience
                      </label>
                      <select
                        value={editForm.targetAudience}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            targetAudience: e.target.value,
                          }))
                        }
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="all">All Users</option>
                        <option value="buyers">Buyers Only</option>
                        <option value="sellers">Sellers Only</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editForm.isActive}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              isActive: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Active
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Banner description"
                      className="w-full p-3 border rounded-lg"
                      rows={3}
                    />
                  </div>

                  <button
                    onClick={handleEditBanner}
                    disabled={loading || !editForm.title.trim()}
                    className={`${styles.button} bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50`}
                  >
                    {loading ? "Updating..." : "Update Banner"}
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setShowModal(false);
                  if (modalType === "edit") {
                    resetEditForm();
                  }
                }}
                className={`${styles.button} bg-gray-500 hover:bg-gray-600 text-white`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVideoBanners;
