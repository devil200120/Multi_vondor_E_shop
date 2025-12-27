import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { HiCheck, HiClock, HiX } from "react-icons/hi";

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchSubscriptions();
    fetchStats();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data } = await axios.get(
        `${server}/subscription/admin/all-subscriptions`,
        { withCredentials: true }
      );
      setSubscriptions(data.subscriptions);
    } catch (error) {
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(
        `${server}/subscription/admin/subscription-stats`,
        { withCredentials: true }
      );
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to load stats");
    }
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    // Apply status filter
    const matchesFilter = filter === "all" || sub.status === filter;

    // Apply search filter
    const matchesSearch =
      !searchTerm ||
      sub.shop?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.shop?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.plan?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleCancelSubscription = async (subscriptionId) => {
    if (!window.confirm("Are you sure you want to cancel this subscription?")) {
      return;
    }

    setCancellingId(subscriptionId);
    try {
      await axios.put(
        `${server}/subscription/admin/cancel-subscription/${subscriptionId}`,
        {},
        { withCredentials: true }
      );
      toast.success("Subscription cancelled successfully");
      fetchSubscriptions();
      fetchStats();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to cancel subscription"
      );
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <AiOutlineLoading3Quarters className="animate-spin text-4xl text-primary-600" />
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Subscription Management
      </h2>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Total Subscriptions"
            value={stats.total}
            color="blue"
          />
          <StatCard
            title="Active Subscriptions"
            value={stats.active}
            color="green"
          />
          <StatCard
            title="Expiring Soon"
            value={stats.expiringSoon}
            color="yellow"
          />
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by shop name, email, or plan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {["all", "active", "expired", "cancelled"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium capitalize ${
              filter === status
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Subscriptions Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Shop
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Plan
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Billing Cycle
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Start Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                End Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSubscriptions.map((sub) => (
              <tr key={sub._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {sub.shop?.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {sub.shop?.email}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {sub.plan.replace("-", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                  {sub.billingCycle.replace("-", " ")}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  ${sub.finalPrice}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(sub.startDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(sub.endDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={sub.status} />
                </td>
                <td className="px-4 py-3">
                  {sub.status === "active" && (
                    <button
                      onClick={() => handleCancelSubscription(sub._id)}
                      disabled={cancellingId === sub._id}
                      className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancellingId === sub._id ? (
                        <span className="flex items-center gap-1">
                          <AiOutlineLoading3Quarters className="animate-spin w-3 h-3" />
                          Cancelling...
                        </span>
                      ) : (
                        "Cancel"
                      )}
                    </button>
                  )}
                  {sub.status !== "active" && (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredSubscriptions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No subscriptions found
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { icon: HiCheck, bg: "bg-green-100", text: "text-green-700" },
    expired: { icon: HiClock, bg: "bg-gray-100", text: "text-gray-700" },
    cancelled: { icon: HiX, bg: "bg-red-100", text: "text-red-700" },
    suspended: { icon: HiX, bg: "bg-yellow-100", text: "text-yellow-700" },
  };

  const config = statusConfig[status] || statusConfig.active;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} capitalize`}
    >
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

export default AdminSubscriptions;
