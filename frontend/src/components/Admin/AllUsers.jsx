import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../../redux/actions/user";
import { DataGrid } from "@material-ui/data-grid";
import { AiOutlineUser, AiOutlineUpload } from "react-icons/ai";
import { MdAdminPanelSettings, MdBlock, MdCheckCircle } from "react-icons/md";
import {
  FiUsers,
  FiSearch,
  FiTrash2,
  FiShield,
  FiShieldOff,
  FiUserPlus,
  FiSettings,
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
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [createUserModalAnimating, setCreateUserModalAnimating] =
    useState(false);
  const [roleAssignModalOpen, setRoleAssignModalOpen] = useState(false);
  const [roleAssignModalAnimating, setRoleAssignModalAnimating] =
    useState(false);
  const [banModalAnimating, setBanModalAnimating] = useState(false);
  const [unbanModalAnimating, setUnbanModalAnimating] = useState(false);
  const [userId, setUserId] = useState("");
  const [banReason, setBanReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [createUserLoading, setCreateUserLoading] = useState(false);

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
      setBanModalAnimating(false);
      setTimeout(() => {
        setBanModalOpen(false);
        setBanReason("");
      }, 300);
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
      setUnbanModalAnimating(false);
      setTimeout(() => setUnbanModalOpen(false), 300);
      dispatch(getAllUsers());
    } catch (error) {
      toast.error(error.response?.data?.message || "Error unbanning user");
    }
  };

  const openBanModal = (user) => {
    setSelectedUser(user);
    setUserId(user.id);
    setBanModalOpen(true);
    setTimeout(() => setBanModalAnimating(true), 10);
  };

  const openUnbanModal = (user) => {
    setSelectedUser(user);
    setUserId(user.id);
    setUnbanModalOpen(true);
    setTimeout(() => setUnbanModalAnimating(true), 10);
  };

  const handleCreateUser = async () => {
    const { name, email, password, role, avatar } = newUserData;

    // Validate inputs
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    if (password.length < 4) {
      toast.error("Password should be at least 4 characters");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setCreateUserLoading(true);

    try {
      // Use FormData for file upload
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("password", password.trim());
      formData.append("role", role);

      // Add avatar file if provided
      if (avatar) {
        formData.append("file", avatar);
      }

      const response = await axios.post(
        `${server}/user/create-user-by-admin`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(response.data.message);
      setCreateUserModalAnimating(false);

      setTimeout(() => {
        setCreateUserModalOpen(false);
        // Reset form
        setNewUserData({
          name: "",
          email: "",
          password: "",
          role: "user",
          avatar: null,
        });
        setAvatarPreview(null);
      }, 300);

      // Refresh users list
      dispatch(getAllUsers());
    } catch (error) {
      console.error("Create user error:", error);
      toast.error(error.response?.data?.message || "Failed to create user");
    } finally {
      setCreateUserLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await axios.put(
        `${server}/user/change-user-role/${userId}`,
        { role: newRole },
        { withCredentials: true }
      );

      toast.success(response.data.message);
      setRoleAssignModalAnimating(false);
      setTimeout(() => setRoleAssignModalOpen(false), 300);
      dispatch(getAllUsers());
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to change user role"
      );
    }
  };

  const openRoleAssignModal = (user) => {
    setSelectedUser(user);
    setUserId(user.id);
    setRoleAssignModalOpen(true);
    setTimeout(() => setRoleAssignModalAnimating(true), 10);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, JPG, PNG, GIF)");
        e.target.value = "";
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        e.target.value = "";
        return;
      }

      setNewUserData((prev) => ({ ...prev, avatar: file }));

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
      minWidth: 200,
      flex: 1,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => (
        <div className="flex justify-center space-x-1">
          {/* Role Assignment - Only for non-current admin */}
          {params.row.id !==
            users?.find((u) => u.role === "Admin" && u._id === params.row.id)
              ?._id && (
            <button
              onClick={() => openRoleAssignModal(params.row)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="Change Role"
            >
              <FiSettings size={16} />
            </button>
          )}

          {/* Ban/Unban - Only for non-admin users */}
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

          {/* Delete User */}
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

            {/* Create User Button */}
            <button
              onClick={() => {
                setCreateUserModalOpen(true);
                setTimeout(() => setCreateUserModalAnimating(true), 10);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-all duration-200 shadow-unacademy hover:shadow-unacademy-md"
            >
              <FiUserPlus size={16} />
              <span>Create User</span>
            </button>
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
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
            banModalAnimating
              ? "bg-black bg-opacity-50"
              : "bg-black bg-opacity-0"
          }`}
        >
          <div
            className={`bg-white rounded-lg shadow-unacademy-xl p-6 w-full max-w-md mx-4 transition-all duration-300 transform ${
              banModalAnimating
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-4"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ban User</h3>
              <button
                onClick={() => {
                  setBanModalAnimating(false);
                  setTimeout(() => setBanModalOpen(false), 300);
                }}
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
                onClick={() => {
                  setBanModalAnimating(false);
                  setTimeout(() => setBanModalOpen(false), 300);
                }}
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
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
            unbanModalAnimating
              ? "bg-black bg-opacity-50"
              : "bg-black bg-opacity-0"
          }`}
        >
          <div
            className={`bg-white rounded-lg shadow-unacademy-xl p-6 w-full max-w-md mx-4 transition-all duration-300 transform ${
              unbanModalAnimating
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-4"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Unban User
              </h3>
              <button
                onClick={() => {
                  setUnbanModalAnimating(false);
                  setTimeout(() => setUnbanModalOpen(false), 300);
                }}
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
                onClick={() => {
                  setUnbanModalAnimating(false);
                  setTimeout(() => setUnbanModalOpen(false), 300);
                }}
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

      {/* Create User Modal */}
      {createUserModalOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
            createUserModalAnimating
              ? "bg-black bg-opacity-50"
              : "bg-black bg-opacity-0"
          }`}
        >
          <div
            className={`bg-white rounded-lg shadow-unacademy-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto transition-all duration-300 transform ${
              createUserModalAnimating
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-4"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Create New User
              </h3>
              <button
                onClick={() => {
                  setCreateUserModalAnimating(false);
                  setTimeout(() => {
                    setCreateUserModalOpen(false);
                    setNewUserData({
                      name: "",
                      email: "",
                      password: "",
                      role: "user",
                      avatar: null,
                    });
                    setAvatarPreview(null);
                  }, 300);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
                disabled={createUserLoading}
              >
                <RxCross1 size={20} className="text-gray-500" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateUser();
              }}
            >
              {/* Avatar Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture (Optional)
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <AiOutlineUser className="text-2xl text-gray-400" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-upload"
                      disabled={createUserLoading}
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="cursor-pointer inline-flex items-center space-x-2 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <AiOutlineUpload size={14} />
                      <span className="text-sm">Upload Image</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Max 5MB, JPEG/PNG/GIF
                    </p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newUserData.name}
                  onChange={(e) =>
                    setNewUserData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className={styles.input}
                  placeholder="Enter full name"
                  disabled={createUserLoading}
                  required
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) =>
                    setNewUserData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className={styles.input}
                  placeholder="Enter email address"
                  disabled={createUserLoading}
                  required
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) =>
                    setNewUserData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className={styles.input}
                  placeholder="Enter password (min 4 characters)"
                  disabled={createUserLoading}
                  required
                  minLength={4}
                />
              </div>

              {/* Role */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Role *
                </label>
                <select
                  value={newUserData.role}
                  onChange={(e) =>
                    setNewUserData((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                  className={styles.input}
                  disabled={createUserLoading}
                  required
                >
                  <option value="user">User</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Admin">Admin</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose the appropriate role for this user
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setCreateUserModalOpen(false);
                    setNewUserData({
                      name: "",
                      email: "",
                      password: "",
                      role: "user",
                      avatar: null,
                    });
                    setAvatarPreview(null);
                  }}
                  className={`flex-1 ${styles.button_outline}`}
                  disabled={createUserLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    createUserLoading ||
                    !newUserData.name.trim() ||
                    !newUserData.email.trim() ||
                    !newUserData.password.trim()
                  }
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-all duration-200 shadow-unacademy hover:shadow-unacademy-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {createUserLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <FiUserPlus size={16} />
                      <span>Create User</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {roleAssignModalOpen && selectedUser && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
            roleAssignModalAnimating
              ? "bg-black bg-opacity-50"
              : "bg-black bg-opacity-0"
          }`}
        >
          <div
            className={`bg-white rounded-lg shadow-unacademy-xl p-6 w-full max-w-md mx-4 transition-all duration-300 transform ${
              roleAssignModalAnimating
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-4"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Change User Role
              </h3>
              <button
                onClick={() => {
                  setRoleAssignModalAnimating(false);
                  setTimeout(() => setRoleAssignModalOpen(false), 300);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
              >
                <RxCross1 size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiSettings className="text-blue-600 h-6 w-6" />
              </div>
              <p className="text-gray-600 text-center mb-4">
                Change role for <strong>{selectedUser.name}</strong>
              </p>
              <p className="text-sm text-gray-500 text-center mb-4">
                Current role:{" "}
                <span className="font-medium text-gray-700">
                  {selectedUser.role}
                </span>
              </p>

              <div className="space-y-3">
                {["user", "Supplier", "Admin"].map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(selectedUser.id, role)}
                    disabled={role === selectedUser.role}
                    className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                      role === selectedUser.role
                        ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {role === "user" ? "User" : role}
                        </div>
                        <div className="text-sm text-gray-500">
                          {role === "user" &&
                            "Regular user with basic permissions"}
                          {role === "Supplier" &&
                            "Can create and manage products"}
                          {role === "Admin" &&
                            "Full system administrator access"}
                        </div>
                      </div>
                      {role === selectedUser.role && (
                        <MdCheckCircle className="text-green-500" size={20} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setRoleAssignModalOpen(false)}
                className={`flex-1 ${styles.button_outline}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
