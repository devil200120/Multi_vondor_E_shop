import React, { useEffect, useState, useRef, useCallback } from "react";
import { backend_url, server } from "../../server";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteUserAddress,
  loadUser,
  updatUserAddress,
  updateUserInformation,
} from "../../redux/actions/user";
import {
  AiOutlineArrowRight,
  AiOutlineCamera,
  AiOutlineDelete,
} from "react-icons/ai";
import {
  HiOutlineShoppingBag,
  HiOutlineCheckCircle,
  HiOutlineClock,
} from "react-icons/hi";
import { TbAddressBook } from "react-icons/tb";
import { MdLocationOn, MdMyLocation } from "react-icons/md";
import { Link } from "react-router-dom";
import { DataGrid } from "@material-ui/data-grid";
import { Button } from "@material-ui/core";
import { RxCross1 } from "react-icons/rx";
import { MdTrackChanges } from "react-icons/md";
import { toast } from "react-toastify";
import axios from "axios";
import { Country, State } from "country-state-city";
import { getAllOrdersOfUser } from "../../redux/actions/order";

// Google Maps Configuration
const GOOGLE_MAPS_API_KEY = "AIzaSyBecpP3O2kfTa0z-lLIiShmsZE6e1kDmOk";

// Load Google Maps Script
const loadGoogleMapsScript = (callback) => {
  const existingScript = document.getElementById("googleMaps");

  if (!existingScript) {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.id = "googleMaps";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (callback) callback();
    };
  } else {
    if (callback) callback();
  }
};

const ProfileContent = ({ active }) => {
  const { user, error, successMessage } = useSelector((state) => state.user);
  const [name, setName] = useState(user && user.name);
  const [email, setEmail] = useState(user && user.email);
  const [phoneNumber, setPhoneNumber] = useState(user && user.phoneNumber);
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch({ type: "clearErrors" });
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch({ type: "clearMessages" });
    }
  }, [error, successMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await dispatch(updateUserInformation(name, email, phoneNumber, password));
      setPassword(""); // Clear password after successful update
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Image update
  const handleImage = async (e) => {
    const file = e.target.files[0];
    setAvatar(file);

    const formData = new FormData();
    formData.append("image", e.target.files[0]);

    try {
      await axios.put(`${server}/user/update-avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      dispatch(loadUser());
      toast.success("Avatar updated successfully!");
    } catch (error) {
      toast.error("Failed to update avatar");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Profile */}
      {active === 1 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
            <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
            <p className="text-blue-100 mt-1">
              Manage your account information
            </p>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {/* Avatar Section */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <img
                  src={
                    user?.avatar
                      ? `${backend_url}${user.avatar}`
                      : "/api/placeholder/120/120"
                  }
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  alt="Profile"
                />
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    onChange={handleImage}
                    accept="image/*"
                  />
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <AiOutlineCamera size={24} className="text-white" />
                  </label>
                </div>
                <div className="absolute bottom-1 right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-600 transition-colors">
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <AiOutlineCamera size={16} className="text-white" />
                  </label>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password (Leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Orders */}
      {active === 2 && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 sm:px-8 py-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <HiOutlineShoppingBag className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  My Orders
                </h2>
                <p className="text-green-100 mt-1 text-sm sm:text-base">
                  Track and manage your orders
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <AllOrders />
          </div>
        </div>
      )}

      {/* Refund Orders */}
      {active === 3 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-8">
            <h2 className="text-2xl font-bold text-white">Refund Requests</h2>
            <p className="text-orange-100 mt-1">View your refund status</p>
          </div>
          <div className="p-6">
            <AllRefundOrders />
          </div>
        </div>
      )}

      {/* Track Order */}
      {active === 5 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-8">
            <h2 className="text-2xl font-bold text-white">Track Orders</h2>
            <p className="text-purple-100 mt-1">Real-time order tracking</p>
          </div>
          <div className="p-6">
            <TrackOrder />
          </div>
        </div>
      )}

      {/* Change Password */}
      {active === 6 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-8">
            <h2 className="text-2xl font-bold text-white">Change Password</h2>
            <p className="text-red-100 mt-1">Update your account security</p>
          </div>
          <div className="p-6">
            <ChangePassword />
          </div>
        </div>
      )}

      {/* Address */}
      {active === 7 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-8">
            <h2 className="text-2xl font-bold text-white">My Addresses</h2>
            <p className="text-teal-100 mt-1">Manage delivery addresses</p>
          </div>
          <div className="p-6">
            <Address />
          </div>
        </div>
      )}
    </div>
  );
};

// All orders
const AllOrders = () => {
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllOrdersOfUser(user._id));
  }, []);

  const columns = [
    {
      field: "id",
      headerName: "Order ID",
      minWidth: 150,
      flex: 0.8,
      renderCell: (params) => (
        <span className="font-mono text-sm font-semibold text-gray-700">
          #{params.value.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 130,
      flex: 0.7,
      renderCell: (params) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            params.value === "Delivered"
              ? "bg-green-100 text-green-800 border border-green-200"
              : params.value === "Processing"
              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
              : params.value === "Shipping"
              ? "bg-blue-100 text-blue-800 border border-blue-200"
              : params.value === "Processing refund"
              ? "bg-orange-100 text-orange-800 border border-orange-200"
              : "bg-gray-100 text-gray-800 border border-gray-200"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "itemsQty",
      headerName: "Items",
      type: "number",
      minWidth: 100,
      flex: 0.5,
      renderCell: (params) => (
        <span className="font-medium text-gray-900">
          {params.value} item{params.value !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      field: "total",
      headerName: "Total",
      type: "number",
      minWidth: 130,
      flex: 0.8,
      renderCell: (params) => (
        <span className="font-bold text-lg text-gray-900">{params.value}</span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params) => (
        <Link to={`/user/order/${params.id}`}>
          <button className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm font-medium group">
            <span>View</span>
            <AiOutlineArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform duration-200"
            />
          </button>
        </Link>
      ),
    },
  ];

  const rows = orders
    ? orders.map((item) => ({
        id: item._id,
        itemsQty: item.cart.length,
        total: "₹" + item.totalPrice,
        status: item.status,
      }))
    : [];

  return (
    <div className="space-y-6">
      {orders && orders.length > 0 ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <HiOutlineShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {orders.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <HiOutlineCheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Delivered
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {
                      orders.filter((order) => order.status === "Delivered")
                        .length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg mr-4">
                  <HiOutlineClock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-600">
                    Processing
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {
                      orders.filter((order) => order.status === "Processing")
                        .length
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Order History
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                View and manage all your orders
              </p>
            </div>
            <div className="overflow-hidden">
              <DataGrid
                rows={rows}
                columns={columns}
                pageSize={10}
                disableSelectionOnClick
                autoHeight
                className="border-0"
                sx={{
                  "& .MuiDataGrid-cell": {
                    borderBottom: "1px solid #f3f4f6",
                    padding: "16px",
                    fontSize: "14px",
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#f9fafb",
                    borderBottom: "2px solid #e5e7eb",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                  },
                  "& .MuiDataGrid-row": {
                    "&:hover": {
                      backgroundColor: "#f8fafc",
                    },
                  },
                  "& .MuiDataGrid-cell:focus": {
                    outline: "none",
                  },
                  "& .MuiDataGrid-columnHeader:focus": {
                    outline: "none",
                  },
                  "& .MuiDataGrid-root": {
                    border: "none",
                  },
                  "& .MuiDataGrid-footerContainer": {
                    borderTop: "2px solid #e5e7eb",
                    backgroundColor: "#f9fafb",
                  },
                }}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <div className="mx-auto w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <HiOutlineShoppingBag size={48} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No orders yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            When you place orders, they'll appear here. Start shopping to see
            your order history.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm font-medium"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

// Refund page

const AllRefundOrders = () => {
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllOrdersOfUser(user._id));
  }, []);

  const eligibleOrders =
    orders && orders.filter((item) => item.status === "Processing refund");

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
      field: " ",
      flex: 1,
      minWidth: 150,
      headerName: "",
      type: "number",
      sortable: false,
      renderCell: (params) => {
        return (
          <>
            <Link to={`/user/order/${params.id}`}>
              <Button>
                <AiOutlineArrowRight size={20} />
              </Button>
            </Link>
          </>
        );
      },
    },
  ];

  const row = [];

  eligibleOrders &&
    eligibleOrders.forEach((item) => {
      row.push({
        id: item._id,
        itemsQty: item.cart.length,
        total: "₹" + item.totalPrice,
        status: item.status,
      });
    });

  return (
    <div className="pl-8 pt-1">
      <DataGrid
        rows={row}
        columns={columns}
        pageSize={10}
        autoHeight
        disableSelectionOnClick
      />
    </div>
  );
};

// Track order
const TrackOrder = () => {
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllOrdersOfUser(user._id));
  }, []);

  const columns = [
    { field: "id", headerName: "Order ID", minWidth: 150, flex: 0.7 },

    {
      field: "status",
      headerName: "Status",
      minWidth: 150,
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
      field: " ",
      flex: 1,
      minWidth: 150,
      headerName: "",
      type: "number",
      sortable: false,
      renderCell: (params) => {
        return (
          <>
            <Link to={`/user/track/order/${params.id}`}>
              <Button>
                <MdTrackChanges size={20} />
              </Button>
            </Link>
          </>
        );
      },
    },
  ];

  const row = [];

  orders &&
    orders.forEach((item) => {
      row.push({
        id: item._id,
        itemsQty: item.cart.length,
        total: "₹ " + item.totalPrice,
        status: item.status,
      });
    });

  return (
    <div className="pl-8 pt-1">
      <DataGrid
        rows={row}
        columns={columns}
        pageSize={10}
        disableSelectionOnClick
        autoHeight
      />
    </div>
  );
};

// Change Password
const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const passwordChangeHandler = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      await axios.put(
        `${server}/user/update-user-password`,
        { oldPassword, newPassword, confirmPassword },
        { withCredentials: true }
      );
      toast.success("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={passwordChangeHandler} className="space-y-6">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <input
            type={showPasswords.old ? "text" : "password"}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Enter current password"
          />
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <input
            type={showPasswords.new ? "text" : "password"}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            minLength={6}
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type={showPasswords.confirm ? "text" : "password"}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            minLength={6}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

// Address
const Address = () => {
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [addressType, setAddressType] = useState("");
  const [editingAddress, setEditingAddress] = useState(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Default to India center

  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const addressInputRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);

  const addressTypeData = [
    { name: "Default" },
    { name: "Home" },
    { name: "Office" },
  ];

  const parseAddressComponents = useCallback((place) => {
    let streetNumber = "";
    let route = "";
    let locality = "";
    let administrativeArea = "";
    let country = "";
    let postalCode = "";

    place.address_components.forEach((component) => {
      const types = component.types;

      if (types.includes("street_number")) {
        streetNumber = component.long_name;
      }
      if (types.includes("route")) {
        route = component.long_name;
      }
      if (types.includes("locality")) {
        locality = component.long_name;
      }
      if (types.includes("administrative_area_level_1")) {
        administrativeArea = component.long_name;
      }
      if (types.includes("country")) {
        country = component.short_name;
      }
      if (types.includes("postal_code")) {
        postalCode = component.long_name;
      }
    });

    // Construct address
    const fullAddress = `${streetNumber} ${route}`.trim();
    setAddress1(fullAddress || place.formatted_address);
    setZipCode(postalCode);

    // Find country and state codes
    const countryData = Country.getAllCountries().find(
      (c) => c.isoCode === country
    );
    if (countryData) {
      setCountry(countryData.isoCode);

      const stateData = State.getStatesOfCountry(countryData.isoCode).find(
        (s) => s.name === administrativeArea
      );
      if (stateData) {
        setCity(stateData.isoCode);
      } else {
        // If no exact state match, use the locality or administrative area
        setCity(locality || administrativeArea);
      }
    } else {
      // Set city directly if country not found
      setCity(locality || administrativeArea);
    }
  }, []);

  const reverseGeocode = useCallback(
    (lat, lng) => {
      if (window.google) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results[0]) {
            const place = results[0];
            setAddress1(place.formatted_address);
            parseAddressComponents(place);

            // Update autocomplete input
            if (addressInputRef.current) {
              addressInputRef.current.value = place.formatted_address;
            }
          }
        });
      }
    },
    [parseAddressComponents]
  );

  const updateMarker = useCallback(
    (lat, lng) => {
      if (mapInstanceRef.current) {
        // Remove existing marker
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }

        // Add new marker
        markerRef.current = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstanceRef.current,
          draggable: true,
          title: "Delivery Location",
        });

        // Add drag listener to marker
        markerRef.current.addListener("dragend", (event) => {
          const newLat = event.latLng.lat();
          const newLng = event.latLng.lng();

          setLatitude(newLat.toString());
          setLongitude(newLng.toString());
          reverseGeocode(newLat, newLng);
        });
      }
    },
    [reverseGeocode]
  );

  const handlePlaceSelect = useCallback(() => {
    const place = autocompleteRef.current.getPlace();

    if (place.geometry) {
      const location = place.geometry.location;
      const lat = location.lat();
      const lng = location.lng();

      setLatitude(lat.toString());
      setLongitude(lng.toString());
      setMapCenter({ lat, lng });

      // Parse address components
      parseAddressComponents(place);

      // Update map if visible
      if (showMap && mapInstanceRef.current) {
        mapInstanceRef.current.setCenter({ lat, lng });
        updateMarker(lat, lng);
      }

      toast.success("Location selected successfully!");
    }
  }, [parseAddressComponents, showMap, updateMarker]);

  // Initialize Google Maps
  const initializeAutocompleteCallback = React.useCallback(() => {
    if (window.google && addressInputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          types: ["address"],
          componentRestrictions: { country: [] }, // Allow all countries
        }
      );

      autocompleteRef.current.addListener("place_changed", handlePlaceSelect);
    }
  }, [handlePlaceSelect]);

  useEffect(() => {
    if (open) {
      loadGoogleMapsScript(() => {
        initializeAutocompleteCallback();
      });
    }
  }, [open, initializeAutocompleteCallback]);

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setLatitude(lat.toString());
          setLongitude(lng.toString());
          setMapCenter({ lat, lng });

          // Reverse geocoding to get address
          reverseGeocode(lat, lng);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error(
            "Unable to get your location. Please enter address manually."
          );
          setIsLoadingLocation(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
      setIsLoadingLocation(false);
    }
  };

  const initializeMap = useCallback(() => {
    if (window.google && mapRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Add click listener to map
      mapInstanceRef.current.addListener("click", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        setLatitude(lat.toString());
        setLongitude(lng.toString());
        updateMarker(lat, lng);
        reverseGeocode(lat, lng);
      });

      // Initialize marker if coordinates exist
      if (latitude && longitude) {
        updateMarker(parseFloat(latitude), parseFloat(longitude));
      }
    }
  }, [mapCenter, latitude, longitude, updateMarker, reverseGeocode]);

  useEffect(() => {
    if (showMap && window.google) {
      setTimeout(() => {
        initializeMap();
      }, 100);
    }
  }, [showMap, mapCenter, initializeMap]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      addressType === "" ||
      country === "" ||
      city === "" ||
      address1 === ""
    ) {
      toast.error("Please fill all required fields!");
    } else {
      console.log("Submitting address form:", {
        editingAddress,
        addressType,
        country,
        city,
        address1,
        address2,
        zipCode,
        latitude,
        longitude,
      });

      // Include coordinates in the address data
      const addressData = {
        country,
        city,
        address1,
        address2,
        zipCode,
        addressType,
        latitude: latitude || null,
        longitude: longitude || null,
      };

      // If editing, include the address ID
      if (editingAddress) {
        addressData._id = editingAddress._id;
        console.log("Adding address ID to update:", editingAddress._id);
      }

      dispatch(
        updatUserAddress(
          country,
          city,
          address1,
          address2,
          zipCode,
          addressType,
          latitude,
          longitude,
          editingAddress?._id
        )
      );

      resetForm();
      setOpen(false);
    }
  };

  const resetForm = () => {
    setCountry("");
    setCity("");
    setAddress1("");
    setAddress2("");
    setZipCode("");
    setAddressType("");
    setLatitude("");
    setLongitude("");
    setShowMap(false);
    setEditingAddress(null);

    if (addressInputRef.current) {
      addressInputRef.current.value = "";
    }
  };

  const handleEdit = (address) => {
    console.log("Editing address:", address);
    setCountry(address.country || "");
    setCity(address.city || "");
    setAddress1(address.address1 || "");
    setAddress2(address.address2 || "");
    setZipCode(address.zipCode || "");
    setAddressType(address.addressType || "");
    setLatitude(address.latitude || "");
    setLongitude(address.longitude || "");
    setEditingAddress(address);

    if (address.latitude && address.longitude) {
      setMapCenter({
        lat: parseFloat(address.latitude),
        lng: parseFloat(address.longitude),
      });
      setShowMap(true);
    }

    setOpen(true);
  };

  const handleDelete = (item) => {
    const id = item._id;
    dispatch(deleteUserAddress(id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Saved Addresses
          </h3>
          <p className="text-gray-500 text-sm">
            Manage your delivery addresses
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add New Address
        </button>
      </div>

      {/* Address List */}
      <div className="space-y-4">
        {user && user.addresses && user.addresses.length > 0 ? (
          user.addresses.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {item.addressType}
                    </span>
                    {item.latitude && item.longitude && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center space-x-1">
                        <MdLocationOn size={12} />
                        <span>GPS Located</span>
                      </span>
                    )}
                  </div>
                  <p className="text-gray-900 font-medium">
                    {item.address1} {item.address2}
                  </p>
                  <p className="text-gray-600 text-sm">{user.phoneNumber}</p>
                  {item.latitude && item.longitude && (
                    <div className="mt-2 flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const url = `https://www.google.com/maps?q=${item.latitude},${item.longitude}`;
                          window.open(url, "_blank");
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center space-x-1"
                      >
                        <MdLocationOn size={12} />
                        <span>View on Google Maps</span>
                      </button>
                      <span className="text-xs text-gray-500">
                        ({parseFloat(item.latitude).toFixed(4)},{" "}
                        {parseFloat(item.longitude).toFixed(4)})
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Address"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Address"
                  >
                    <AiOutlineDelete size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <TbAddressBook size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No addresses saved
            </h3>
            <p className="text-gray-500 mb-4">
              Add your first delivery address to get started.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Address
            </button>
          </div>
        )}
      </div>
      {/* Add Address Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h2>
              <button
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RxCross1 size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Location Tools */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-3">
                  Quick Location Tools
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    <MdMyLocation size={16} />
                    <span className="text-sm">
                      {isLoadingLocation
                        ? "Getting Location..."
                        : "Use Current Location"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <MdLocationOn size={16} />
                    <span className="text-sm">
                      {showMap ? "Hide Map" : "Show Map"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Google Maps Autocomplete Address Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Address <span className="text-red-500">*</span>
                </label>
                <input
                  ref={addressInputRef}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Start typing your address..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Start typing and select from suggestions for accurate location
                </p>
              </div>

              {/* Map Display */}
              {showMap && (
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div
                    ref={mapRef}
                    style={{ height: "300px", width: "100%" }}
                    className="bg-gray-100"
                  />
                  <div className="p-2 bg-gray-50 text-xs text-gray-600">
                    Click on the map to pin your exact location or drag the
                    marker
                  </div>
                </div>
              )}

              {/* Coordinates Display */}
              {latitude && longitude && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <span className="font-medium">
                      📍 Location Coordinates:
                    </span>
                    <br />
                    Latitude: {parseFloat(latitude).toFixed(6)}
                    <br />
                    Longitude: {parseFloat(longitude).toFixed(6)}
                  </p>
                </div>
              )}

              {/* Manual Address Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Choose your country</option>
                    {Country &&
                      Country.getAllCountries().map((item) => (
                        <option key={item.isoCode} value={item.isoCode}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* State/City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/City <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Choose your state/city</option>
                    {State &&
                      State.getStatesOfCountry(country).map((item) => (
                        <option key={item.isoCode} value={item.isoCode}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Address Lines */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  placeholder="Street address, building number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  placeholder="Apartment, suite, unit, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Zip Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="Enter zip code"
                  />
                </div>

                {/* Address Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={addressType}
                    onChange={(e) => setAddressType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Choose address type</option>
                    {addressTypeData.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                >
                  {editingAddress ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileContent;
