import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataGrid } from "@material-ui/data-grid";
import { AiOutlineShop } from "react-icons/ai";
import { Button } from "@material-ui/core";
import styles from "../../styles/styles";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { getAllSellers } from "../../redux/actions/sellers";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiTrash2,
  FiEye,
  FiUserX,
  FiUserCheck,
} from "react-icons/fi";
import { HiOutlineUserGroup } from "react-icons/hi";
import { MdStorefront, MdVerified, MdBlock } from "react-icons/md";
import Loader from "../Layout/Loader";

const AllSellers = () => {
  const dispatch = useDispatch();
  const { sellers, loading } = useSelector((state) => state.seller);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Ban/Unban related states
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [unbanModalOpen, setUnbanModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getAllSellers());
  }, [dispatch]);

  const handleDelete = async (id) => {
    await axios
      .delete(`${server}/shop/delete-seller/${id}`, { withCredentials: true })
      .then((res) => {
        toast.success(res.data.message);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Error deleting seller");
      });

    dispatch(getAllSellers());
  };

  // Ban seller function
  const handleBanSeller = async () => {
    if (!banReason.trim()) {
      toast.error("Please provide a ban reason");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log(
        "Banning seller:",
        selectedSeller._id,
        "Reason:",
        banReason.trim()
      );

      const response = await axios.put(
        `${server}/shop/ban-shop`,
        {
          shopId: selectedSeller._id,
          banReason: banReason.trim(),
        },
        { withCredentials: true }
      );

      console.log("Ban response:", response.data);

      if (response.data.success) {
        toast.success("Seller banned successfully");
        setBanModalOpen(false);
        setBanReason("");
        setSelectedSeller(null);
        dispatch(getAllSellers());
      } else {
        toast.error("Failed to ban seller");
      }
    } catch (error) {
      console.error("Ban error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to ban seller");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unban seller function
  const handleUnbanSeller = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `${server}/shop/unban-shop`,
        {
          shopId: selectedSeller._id,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Seller unbanned successfully");
        setUnbanModalOpen(false);
        setSelectedSeller(null);
        dispatch(getAllSellers());
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unban seller");
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
      field: "joinedAt",
      headerName: "Joined Date",
      minWidth: 120,
      flex: 0.8,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <span className="text-gray-600 text-sm">{params.value}</span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      flex: 0.8,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div className="flex justify-center">
          {params.row.isBanned ? (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center space-x-1">
              <MdBlock size={12} />
              <span>Banned</span>
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center space-x-1">
              <MdVerified size={12} />
              <span>Active</span>
            </span>
          )}
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 180,
      flex: 1,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => (
        <div className="flex justify-center space-x-2">
          <Link to={`/shop/preview/${params.id}`}>
            <Button
              className="!min-w-0 !p-2 !text-primary-600 hover:!bg-primary-50 !rounded-lg transition-all duration-200"
              title="Preview Shop"
            >
              <FiEye size={16} />
            </Button>
          </Link>

          {params.row.isBanned ? (
            <Button
              onClick={() => {
                setSelectedSeller(params.row);
                setUnbanModalOpen(true);
              }}
              className="!min-w-0 !p-2 !text-green-600 hover:!bg-green-50 !rounded-lg transition-all duration-200"
              title="Unban Seller"
            >
              <FiUserCheck size={16} />
            </Button>
          ) : (
            <Button
              onClick={() => {
                setSelectedSeller(params.row);
                setBanModalOpen(true);
              }}
              className="!min-w-0 !p-2 !text-orange-600 hover:!bg-orange-50 !rounded-lg transition-all duration-200"
              title="Ban Seller"
            >
              <FiUserX size={16} />
            </Button>
          )}

          <Button
            onClick={() => setUserId(params.id) || setOpen(true)}
            className="!min-w-0 !p-2 !text-red-600 hover:!bg-red-50 !rounded-lg transition-all duration-200"
            title="Delete Seller"
          >
            <FiTrash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  const row = [];
  sellers &&
    sellers.forEach((item) => {
      row.push({
        id: item._id,
        name: item?.name,
        email: item?.email,
        joinedAt: item.createdAt?.slice(0, 10) || "N/A",
        address: item.address,
        isBanned: item.isBanned || false,
        banReason: item.banReason || null,
        bannedAt: item.bannedAt || null,
        _id: item._id, // Add full item for reference
      });
    });

  // Filter sellers based on search term
  const filteredRows = row.filter(
    (seller) =>
      seller.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate seller statistics
  const activeSellers =
    sellers?.filter((seller) => !seller.isBanned).length || 0;

  const bannedSellers =
    sellers?.filter((seller) => seller.isBanned).length || 0;

  const recentSellers =
    sellers?.filter((seller) => {
      // Recent sellers - joined in last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return new Date(seller.createdAt) > sevenDaysAgo;
    }).length || 0;

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
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <HiOutlineUserGroup className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl 800px:text-3xl font-bold text-gray-900">
              All Sellers
            </h1>
            <p className="text-gray-600">
              Manage all registered sellers and their shops
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 400px:grid-cols-2 800px:grid-cols-4 gap-4 800px:gap-6 mb-6">
        <div className={`${styles.card} ${styles.card_padding}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sellers</p>
              <p className="text-2xl font-bold text-orange-600">
                {sellers?.length || 0}
              </p>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Registered
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <HiOutlineUserGroup className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.card_padding}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Sellers
              </p>
              <p className="text-2xl font-bold text-green-600">
                {activeSellers}
              </p>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Not Banned
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MdVerified className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.card_padding}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Sellers</p>
              <p className="text-2xl font-bold text-blue-600">
                {recentSellers}
              </p>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Last 7 days
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <AiOutlineShop className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.card_padding}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Banned Sellers
              </p>
              <p className="text-2xl font-bold text-red-600">{bannedSellers}</p>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Suspended
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <MdBlock className="h-6 w-6 text-red-600" />
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
            placeholder="Search sellers by name, email, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.input}
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
      </div>

      {/* Sellers Table */}
      <div className={`${styles.card} overflow-hidden`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <HiOutlineUserGroup className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Sellers List
                </h2>
                <p className="text-sm text-gray-500">
                  {filteredRows.length} seller
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

      {/* Delete Confirmation Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-unacademy-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Deletion
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
              >
                <RxCross1 size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiTrash2 className="text-red-600 h-6 w-6" />
              </div>
              <p className="text-gray-600 text-center">
                Are you sure you want to delete this seller? This action cannot
                be undone and will remove their shop and all associated data.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setOpen(false)}
                className={`flex-1 ${styles.button_outline}`}
              >
                Cancel
              </button>
              <button
                onClick={() => setOpen(false) || handleDelete(userId)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all duration-200 shadow-unacademy hover:shadow-unacademy-md"
              >
                Delete Seller
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Seller Modal */}
      {banModalOpen && selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-unacademy-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Ban Seller
              </h3>
              <button
                onClick={() => {
                  setBanModalOpen(false);
                  setBanReason("");
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
                Are you sure you want to ban{" "}
                <strong>{selectedSeller.name}</strong>? This will prevent them
                from accessing their shop and all seller features.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ban Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Please provide a reason for banning this seller..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setBanModalOpen(false);
                  setBanReason("");
                  setSelectedSeller(null);
                }}
                className={`flex-1 ${styles.button_outline}`}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleBanSeller}
                disabled={isSubmitting || !banReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all duration-200 shadow-unacademy hover:shadow-unacademy-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Banning..." : "Ban Seller"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unban Seller Modal */}
      {unbanModalOpen && selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-unacademy-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Unban Seller
              </h3>
              <button
                onClick={() => {
                  setUnbanModalOpen(false);
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
                Are you sure you want to unban{" "}
                <strong>{selectedSeller.name}</strong>? This will restore their
                access to all seller features.
              </p>

              {selectedSeller.banReason && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Current Ban Reason:
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedSeller.banReason}
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setUnbanModalOpen(false);
                  setSelectedSeller(null);
                }}
                className={`flex-1 ${styles.button_outline}`}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleUnbanSeller}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all duration-200 shadow-unacademy hover:shadow-unacademy-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Unbanning..." : "Unban Seller"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllSellers;
