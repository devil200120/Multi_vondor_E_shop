import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../../redux/actions/user";
import { DataGrid } from "@material-ui/data-grid";
import { AiOutlineUser } from "react-icons/ai";
import { MdAdminPanelSettings } from "react-icons/md";
import { FiUsers, FiSearch, FiTrash2 } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";

const AllUsers = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleDelete = async (id) => {
    await axios
      .delete(`${server}/user/delete-user/${id}`, { withCredentials: true })
      .then((res) => {
        toast.success(res.data.message);
      });

    dispatch(getAllUsers());
  };

  const columns = [
    {
      field: "id",
      headerName: "User ID",
      minWidth: 150,
      flex: 0.7,
      renderCell: (params) => (
        <span className="text-blue-600 font-medium">
          #{params.value.slice(0, 8)}
        </span>
      ),
    },
    {
      field: "name",
      headerName: "Full Name",
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <AiOutlineUser className="text-white text-sm" />
          </div>
          <span className="font-medium text-gray-900">{params.value}</span>
        </div>
      ),
    },
    {
      field: "email",
      headerName: "Email Address",
      minWidth: 220,
      flex: 1.2,
      renderCell: (params) => (
        <span className="text-gray-600">{params.value}</span>
      ),
    },
    {
      field: "role",
      headerName: "Role",
      minWidth: 120,
      flex: 0.6,
      renderCell: (params) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            params.value === "Admin"
              ? "bg-purple-100 text-purple-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 100,
      flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <button
          onClick={() => setUserId(params.id) || setOpen(true)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete User"
        >
          <FiTrash2 size={16} />
        </button>
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
      });
    });

  // Filter users based on search term
  const filteredRows = row.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <FiUsers className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">All Users</h1>
          </div>
          <p className="text-gray-600">Manage all registered users</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users?.length || 0}
                </p>
                <div className="flex items-center mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Active
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiUsers className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admin Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users?.filter((user) => user.role === "Admin").length || 0}
                </p>
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

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Regular Users
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {users?.filter((user) => user.role === "user").length || 0}
                </p>
                <div className="flex items-center mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Users
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <AiOutlineUser className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiUsers className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    All Users
                  </h2>
                  <p className="text-sm text-gray-500">
                    {filteredRows.length} user
                    {filteredRows.length !== 1 ? "s" : ""} found
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <DataGrid
              rows={filteredRows}
              columns={columns}
              pageSize={10}
              disableSelectionOnClick
              autoHeight
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Deletion
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
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
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => setOpen(false) || handleDelete(userId)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
