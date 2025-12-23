import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataGrid } from "@material-ui/data-grid";
import { Button } from "@material-ui/core";
import styles from "../../styles/styles";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { getAllSellers } from "../../redux/actions/sellers";
import { Link } from "react-router-dom";
import { FiSearch, FiEye, FiUserX, FiUserCheck, FiClock } from "react-icons/fi";
import { HiOutlineUserGroup } from "react-icons/hi";
import { MdStorefront, MdVerified } from "react-icons/md";
import Loader from "../Layout/Loader";

const PendingSellers = () => {
  const dispatch = useDispatch();
  const { sellers, loading } = useSelector((state) => state.seller);
  const [searchTerm, setSearchTerm] = useState("");

  // Approval/rejection states
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getAllSellers());
  }, [dispatch]);

  // Approval handler function
  const handleApproveSeller = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `${server}/shop/admin-approve-seller/${selectedSeller._id}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Seller approved successfully");
        setApprovalModalOpen(false);
        setSelectedSeller(null);
        dispatch(getAllSellers());
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve seller");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rejection handler function
  const handleRejectSeller = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `${server}/shop/admin-reject-seller/${selectedSeller._id}`,
        { rejectionReason: rejectionReason.trim() },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Seller rejected successfully");
        setRejectionModalOpen(false);
        setRejectionReason("");
        setSelectedSeller(null);
        dispatch(getAllSellers());
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject seller");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      field: "id",
      headerName: "Seller ID",
      minWidth: 180,
      flex: 0.8,
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
      field: "name",
      headerName: "Shop Name",
      minWidth: 200,
      flex: 1.2,
      headerAlign: "left",
      align: "left",
      renderCell: (params) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
            <MdStorefront className="text-white text-sm" />
          </div>
          <span
            className="font-medium text-gray-900 truncate"
            title={params.value}
          >
            {params.value || "N/A"}
          </span>
        </div>
      ),
    },
    {
      field: "email",
      headerName: "Email Address",
      minWidth: 220,
      flex: 1.2,
      headerAlign: "left",
      align: "left",
      renderCell: (params) => (
        <span className="text-gray-600 truncate" title={params.value}>
          {params.value}
        </span>
      ),
    },
    {
      field: "address",
      headerName: "Address",
      minWidth: 180,
      flex: 1,
      headerAlign: "left",
      align: "left",
      renderCell: (params) => (
        <span className="text-gray-600 truncate" title={params.value}>
          {params.value || "Not provided"}
        </span>
      ),
    },
    {
      field: "phoneNumber",
      headerName: "Phone",
      minWidth: 130,
      flex: 0.8,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <span className="text-gray-600 text-sm">{params.value || "N/A"}</span>
      ),
    },
    {
      field: "registeredAt",
      headerName: "Registration Date",
      minWidth: 130,
      flex: 0.8,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <span className="text-gray-600 text-sm">{params.value}</span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 200,
      flex: 1.2,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => (
        <div className="flex justify-center space-x-1">
          <Link to={`/shop/preview/${params.id}`}>
            <Button
              className="!min-w-0 !p-2 !text-primary-600 hover:!bg-primary-50 !rounded-lg transition-all duration-200"
              title="Preview Shop"
            >
              <FiEye size={16} />
            </Button>
          </Link>

          <Button
            onClick={() => {
              setSelectedSeller(params.row);
              setApprovalModalOpen(true);
            }}
            className="!min-w-0 !p-2 !text-green-600 hover:!bg-green-50 !rounded-lg transition-all duration-200"
            title="Approve Seller"
          >
            <FiUserCheck size={16} />
          </Button>

          <Button
            onClick={() => {
              setSelectedSeller(params.row);
              setRejectionModalOpen(true);
            }}
            className="!min-w-0 !p-2 !text-red-600 hover:!bg-red-50 !rounded-lg transition-all duration-200"
            title="Reject Seller"
          >
            <FiUserX size={16} />
          </Button>
        </div>
      ),
    },
  ];

  // Filter only pending sellers
  const pendingSellers =
    sellers?.filter((seller) => seller.approvalStatus === "pending") || [];

  const row = [];
  pendingSellers.forEach((item) => {
    row.push({
      id: item._id,
      name: item?.name,
      email: item?.email,
      registeredAt: item.createdAt?.slice(0, 10) || "N/A",
      address: item.address,
      phoneNumber: item.phoneNumber,
      approvalStatus: item.approvalStatus || "pending",
      _id: item._id, // Add full item for reference
    });
  });

  // Filter sellers based on search term
  const filteredRows = row.filter((seller) => {
    const matchesSearch =
      seller.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.address?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full p-4 800px:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
            <FiClock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl 800px:text-3xl font-bold text-gray-900">
              Pending Sellers
            </h1>
            <p className="text-gray-600">
              Review and approve seller applications
            </p>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 400px:grid-cols-2 800px:grid-cols-3 gap-4 800px:gap-6 mb-6">
        <div className={`${styles.card} ${styles.card_padding}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Applications
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingSellers.length}
              </p>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Awaiting Review
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FiClock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.card_padding}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sellers</p>
              <p className="text-2xl font-bold text-blue-600">
                {sellers?.length || 0}
              </p>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  All Status
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <HiOutlineUserGroup className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.card_padding}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Approved Sellers
              </p>
              <p className="text-2xl font-bold text-green-600">
                {sellers?.filter((s) => s.approvalStatus === "approved")
                  .length || 0}
              </p>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MdVerified className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className={`${styles.card} p-4 mb-6`}>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search pending sellers by name, email, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.input}
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
      </div>

      {/* Pending Sellers Table */}
      <div className={`${styles.card} overflow-hidden`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FiClock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Pending Applications
                </h2>
                <p className="text-sm text-gray-500">
                  {filteredRows.length} seller
                  {filteredRows.length !== 1 ? "s" : ""} awaiting approval
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                to="/admin-sellers"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Sellers →
              </Link>
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
                  backgroundColor: "#fffbeb",
                  borderBottom: "1px solid #fed7aa",
                  "& .MuiDataGrid-columnHeader": {
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#92400e",
                    padding: "12px",
                  },
                },
                "& .MuiDataGrid-cell": {
                  padding: "12px",
                  borderBottom: "1px solid #fef3c7",
                  fontSize: "0.875rem",
                },
                "& .MuiDataGrid-row": {
                  "&:hover": {
                    backgroundColor: "#fffbeb",
                  },
                },
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "1px solid #fed7aa",
                backgroundColor: "#fffbeb",
              },
            }}
          />
        </div>
      </div>

      {/* Approval Modal */}
      {approvalModalOpen && selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-unacademy-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Approve Seller
              </h3>
              <button
                onClick={() => {
                  setApprovalModalOpen(false);
                  setSelectedSeller(null);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
              >
                <RxCross1 size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiUserCheck className="text-green-600 h-6 w-6" />
              </div>
              <p className="text-gray-600 text-center mb-4">
                Are you sure you want to approve{" "}
                <strong>{selectedSeller.name}</strong>? This will allow them to
                access their seller dashboard and start selling on the platform.
              </p>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Shop Details:
                </p>
                <p className="text-sm text-gray-600">
                  Name: {selectedSeller.name}
                </p>
                <p className="text-sm text-gray-600">
                  Email: {selectedSeller.email}
                </p>
                <p className="text-sm text-gray-600">
                  Address: {selectedSeller.address}
                </p>
                <p className="text-sm text-gray-600">
                  Phone: {selectedSeller.phoneNumber}
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setApprovalModalOpen(false);
                  setSelectedSeller(null);
                }}
                className={`flex-1 ${styles.button_outline}`}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleApproveSeller}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all duration-200 shadow-unacademy hover:shadow-unacademy-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Approving..." : "Approve Seller"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModalOpen && selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-unacademy-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Reject Seller
              </h3>
              <button
                onClick={() => {
                  setRejectionModalOpen(false);
                  setRejectionReason("");
                  setSelectedSeller(null);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
              >
                <RxCross1 size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiUserX className="text-red-600 h-6 w-6" />
              </div>
              <p className="text-gray-600 text-center mb-4">
                Are you sure you want to reject{" "}
                <strong>{selectedSeller.name}</strong>? This will prevent them
                from accessing their seller dashboard.
              </p>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Shop Details:
                </p>
                <p className="text-sm text-gray-600">
                  Name: {selectedSeller.name}
                </p>
                <p className="text-sm text-gray-600">
                  Email: {selectedSeller.email}
                </p>
                <p className="text-sm text-gray-600">
                  Address: {selectedSeller.address}
                </p>
                <p className="text-sm text-gray-600">
                  Phone: {selectedSeller.phoneNumber}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this seller application..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setRejectionModalOpen(false);
                  setRejectionReason("");
                  setSelectedSeller(null);
                }}
                className={`flex-1 ${styles.button_outline}`}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSeller}
                disabled={isSubmitting || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all duration-200 shadow-unacademy hover:shadow-unacademy-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Rejecting..." : "Reject Seller"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingSellers;
