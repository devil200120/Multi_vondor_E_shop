import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../../redux/actions/user";
import { DataGrid } from "@material-ui/data-grid";
import { AiOutlineUser } from "react-icons/ai";
import { MdAdminPanelSettings, MdBlock, MdCheckCircle } from "react-icons/md";
import {
  FiUsers,
  FiSearch,
  FiTrash2,
  FiShield,
  FiShieldOff,
} from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";
import { BiBlock } from "react-icons/bi";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import styles from "../../styles/styles";
import Loader from "../Layout/Loader";

const AllUsers = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [unbanModalOpen, setUnbanModalOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [banReason, setBanReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleDelete = async (id) => {
    await axios
      .delete(`${server}/user/delete-user/${id}`, { withCredentials: true })
      .then((res) => {
        toast.success(res.data.message);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Error deleting user");
      });

    dispatch(getAllUsers());
  };

  const handleBanUser = async () => {
    if (!banReason.trim()) {
      toast.error("Please provide a reason for banning");
      return;
    }

    try {
      const response = await axios.put(
        `${server}/user/ban-user/${userId}`,
        { reason: banReason },
        { withCredentials: true }
      );

      toast.success(response.data.message);
      setBanModalOpen(false);
      setBanReason("");
      dispatch(getAllUsers());
    } catch (error) {
      toast.error(error.response?.data?.message || "Error banning user");
    }
  };

  const handleUnbanUser = async () => {
    try {
      const response = await axios.put(
        `${server}/user/unban-user/${userId}`,
        {},
        { withCredentials: true }
      );

      toast.success(response.data.message);
      setUnbanModalOpen(false);
      dispatch(getAllUsers());
    } catch (error) {
      toast.error(error.response?.data?.message || "Error unbanning user");
    }
  };

  const openBanModal = (user) => {
    setSelectedUser(user);
    setUserId(user.id);
    setBanModalOpen(true);
  };

  const openUnbanModal = (user) => {
    setSelectedUser(user);
    setUserId(user.id);
    setUnbanModalOpen(true);
  };

  const columns = [
    {
      field: "id",
      headerName: "User ID",
      minWidth: 150,
      flex: 0.7,
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
      headerName: "Full Name",
      minWidth: 200,
      flex: 1.2,
      headerAlign: "left",
      align: "left",
      renderCell: (params) => (
        <div className="flex items-center space-x-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              params.row.isBanned
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : "bg-gradient-to-r from-primary-500 to-primary-600"
            }`}
          >
            <AiOutlineUser className="text-white text-sm" />
          </div>
          <span
            className={`font-medium truncate ${
              params.row.isBanned ? "text-red-600" : "text-gray-900"
            }`}
            title={params.value}
          >
            {params.value}
          </span>
        </div>
      ),
    },
    {
      field: "email",
      headerName: "Email Address",
      minWidth: 240,
      flex: 1.3,
      headerAlign: "left",
      align: "left",
      renderCell: (params) => (
        <span
          className={`truncate ${
            params.row.isBanned ? "text-red-500" : "text-gray-600"
          }`}
          title={params.value}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "role",
      headerName: "Role",
      minWidth: 120,
      flex: 0.6,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            params.value === "Admin"
              ? "bg-purple-100 text-purple-800"
              : "bg-primary-100 text-primary-800"
          }`}
        >
          {params.value === "user" ? "User" : params.value}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      flex: 0.6,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
            params.row.isBanned
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {params.row.isBanned ? (
            <>
              <MdBlock size={12} />
              <span>Banned</span>
            </>
          ) : (
            <>
              <MdCheckCircle size={12} />
              <span>Active</span>
            </>
          )}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 150,
      flex: 0.8,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => (
        <div className="flex justify-center space-x-2">
          {params.row.role !== "Admin" && (
            <>
              {params.row.isBanned ? (
                <button
                  onClick={() => openUnbanModal(params.row)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                  title="Unban User"
                >
                  <FiShield size={16} />
                </button>
              ) : (
                <button
                  onClick={() => openBanModal(params.row)}
                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
                  title="Ban User"
                >
                  <FiShieldOff size={16} />
                </button>
              )}
            </>
          )}
          <button
            onClick={() => setUserId(params.id) || setOpen(true)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Delete User"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const row = [];
  users &&
    users.forEach((item) => {
      row.push({
        id: item._id,
        name: item.name,
        email: item.email,
        role: item.role,
        isBanned: item.isBanned || false,
        banReason: item.banReason || null,
      });
    });

  // Filter users based on search term
  const filteredRows = row.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalUsers = users?.length || 0;
  const bannedUsers = users?.filter((user) => user.isBanned).length || 0;
  const activeUsers = totalUsers - bannedUsers;
  const adminUsers = users?.filter((user) => user.role === "Admin").length || 0;

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
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <FiUsers className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl 800px:text-3xl font-bold text-gray-900">
              All Users
            </h1>
            <p className="text-gray-600">
              Manage all registered users and ban system
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 400px:grid-cols-2 800px:grid-cols-4 gap-4 800px:gap-6 mb-6">
        <div className={`${styles.card} ${styles.card_padding}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-primary-600">
                {totalUsers}
              </p>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  All Users
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FiUsers className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.card_padding}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <MdCheckCircle className="mr-1" size={12} />
                  Active
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MdCheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.card_padding}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Banned Users</p>
              <p className="text-2xl font-bold text-red-600">{bannedUsers}</p>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <BiBlock className="mr-1" size={12} />
                  Banned
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <BiBlock className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.card_padding}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admin Users</p>
              <p className="text-2xl font-bold text-purple-600">{adminUsers}</p>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Admins
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MdAdminPanelSettings className="h-6 w-6 text-purple-600" />
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
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.input}
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className={`${styles.card} overflow-hidden`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <FiUsers className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Users List
                </h2>
                <p className="text-sm text-gray-500">
                  {filteredRows.length} user
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
                Are you sure you want to delete this user? This action cannot be
                undone.
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
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban User Modal */}
      {banModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-unacademy-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ban User</h3>
              <button
                onClick={() => setBanModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
              >
                <RxCross1 size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiShieldOff className="text-orange-600 h-6 w-6" />
              </div>
              <p className="text-gray-600 text-center mb-4">
                You are about to ban <strong>{selectedUser.name}</strong>.
                Please provide a reason for this action.
              </p>

              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter reason for banning this user..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {banReason.length}/500 characters
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setBanModalOpen(false)}
                className={`flex-1 ${styles.button_outline}`}
              >
                Cancel
              </button>
              <button
                onClick={handleBanUser}
                disabled={!banReason.trim()}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-all duration-200 shadow-unacademy hover:shadow-unacademy-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unban User Modal */}
      {unbanModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-unacademy-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Unban User
              </h3>
              <button
                onClick={() => setUnbanModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
              >
                <RxCross1 size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiShield className="text-green-600 h-6 w-6" />
              </div>
              <p className="text-gray-600 text-center">
                Are you sure you want to unban{" "}
                <strong>{selectedUser.name}</strong>? They will regain full
                access to their account.
              </p>
              {selectedUser.banReason && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Current ban reason:</strong>{" "}
                    {selectedUser.banReason}
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setUnbanModalOpen(false)}
                className={`flex-1 ${styles.button_outline}`}
              >
                Cancel
              </button>
              <button
                onClick={handleUnbanUser}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all duration-200 shadow-unacademy hover:shadow-unacademy-md"
              >
                Unban User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
