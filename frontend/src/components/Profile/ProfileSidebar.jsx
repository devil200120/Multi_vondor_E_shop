import React from "react";
import { AiOutlineLogin, AiOutlineMessage } from "react-icons/ai";
import { RiLockPasswordLine } from "react-icons/ri";
import { HiOutlineReceiptRefund, HiOutlineShoppingBag } from "react-icons/hi";
import { RxPerson } from "react-icons/rx";
import { Link, useNavigate } from "react-router-dom";
import {
  MdOutlineAdminPanelSettings,
  MdOutlineTrackChanges,
} from "react-icons/md";
import { TbAddressBook } from "react-icons/tb";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../redux/actions/user";
import { backend_url } from "../../server";

const ProfileSidebar = ({ setActive, active }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const logoutHandler = async () => {
    try {
      await dispatch(logoutUser());
      toast.success("Logout successful!");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const menuItems = [
    {
      id: 1,
      title: "Profile",
      icon: RxPerson,
      onClick: () => setActive(1),
    },
    {
      id: 2,
      title: "Orders",
      icon: HiOutlineShoppingBag,
      onClick: () => setActive(2),
    },
    {
      id: 3,
      title: "Refunds",
      icon: HiOutlineReceiptRefund,
      onClick: () => setActive(3),
    },
    {
      id: 4,
      title: "Inbox",
      icon: AiOutlineMessage,
      onClick: () => {
        setActive(4);
        navigate("/inbox");
      },
    },
    {
      id: 5,
      title: "Track Order",
      icon: MdOutlineTrackChanges,
      onClick: () => setActive(5),
    },
    {
      id: 6,
      title: "Change Password",
      icon: RiLockPasswordLine,
      onClick: () => setActive(6),
    },
    {
      id: 7,
      title: "Address",
      icon: TbAddressBook,
      onClick: () => setActive(7),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <img
              src={
                user?.avatar
                  ? `${backend_url}${user.avatar}`
                  : "/api/placeholder/80/80"
              }
              alt={user?.name || "User"}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <h3 className="font-semibold text-lg">{user?.name || "User"}</h3>
          <p className="text-blue-100 text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? "text-blue-600" : "text-gray-400"}
                />
                <span className="font-medium">{item.title}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
            );
          })}

          {/* Admin Dashboard Link */}
          {user && user?.role === "Admin" && (
            <Link to="/admin/dashboard" className="block">
              <button
                onClick={() => setActive(8)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active === 8
                    ? "bg-purple-50 text-purple-600 border border-purple-200 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <MdOutlineAdminPanelSettings
                  size={20}
                  className={active === 8 ? "text-purple-600" : "text-gray-400"}
                />
                <span className="font-medium">Admin Dashboard</span>
                {active === 8 && (
                  <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full"></div>
                )}
              </button>
            </Link>
          )}
        </nav>

        {/* Logout Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={logoutHandler}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <AiOutlineLogin size={20} className="text-red-500" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
