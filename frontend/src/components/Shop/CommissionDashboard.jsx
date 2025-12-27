import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  HiCurrencyDollar,
  HiTrendingUp,
  HiClock,
  HiCheckCircle,
} from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const CommissionDashboard = () => {
  const [commissions, setCommissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [revenueShareStatus, setRevenueShareStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCommissions();
    fetchRevenueShareStatus();
  }, [page]);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${server}/commission/seller/my-commissions?page=${page}&limit=20`,
        { withCredentials: true }
      );

      setCommissions(data.commissions);
      setStats(data.stats);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error("Failed to load commission data");
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueShareStatus = async () => {
    try {
      const { data } = await axios.get(
        `${server}/commission/seller/revenue-share-status`,
        { withCredentials: true }
      );
      setRevenueShareStatus(data);
    } catch (error) {
      // Not on revenue share plan
      console.log("Not on revenue share plan");
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <AiOutlineLoading3Quarters className="animate-spin text-4xl text-primary-600" />
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Commission Dashboard
      </h2>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<HiCurrencyDollar className="w-6 h-6" />}
            title="Total Earnings"
            value={`$${stats.totalEarnings.toFixed(2)}`}
            color="green"
          />
          <StatCard
            icon={<HiTrendingUp className="w-6 h-6" />}
            title="Total Sales"
            value={`$${stats.totalSales.toFixed(2)}`}
            color="blue"
          />
          <StatCard
            icon={<HiClock className="w-6 h-6" />}
            title="Pending Payouts"
            value={`$${stats.pendingPayouts.toFixed(2)}`}
            color="yellow"
          />
          <StatCard
            icon={<HiCheckCircle className="w-6 h-6" />}
            title="Platform Commission"
            value={`$${stats.totalPlatformCommission.toFixed(2)}`}
            color="red"
          />
        </div>
      )}

      {/* Revenue Share Status */}
      {revenueShareStatus && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            Monthly Revenue Share Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Current Month Commission</p>
              <p className="text-xl font-bold text-primary-600">
                $
                {revenueShareStatus.currentMonthCommission?.toFixed(2) ||
                  "0.00"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Minimum Required</p>
              <p className="text-xl font-bold text-gray-900">
                $
                {revenueShareStatus.minimumMonthlyPayment?.toFixed(2) ||
                  "25.00"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Remaining to Minimum</p>
              <p className="text-xl font-bold text-red-600">
                ${revenueShareStatus.remainingToMinimum?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress to Minimum</span>
              <span>
                {(
                  ((revenueShareStatus.currentMonthCommission || 0) /
                    (revenueShareStatus.minimumMonthlyPayment || 25)) *
                  100
                ).toFixed(0)}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    ((revenueShareStatus.currentMonthCommission || 0) /
                      (revenueShareStatus.minimumMonthlyPayment || 25)) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Commission Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Order #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Platform (10%)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Your Earnings (90%)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {commissions.map((commission) => (
              <tr key={commission._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {commission.order?.orderNumber || "N/A"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(commission.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  ${commission.totalAmount.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-red-600">
                  ${commission.platformCommissionAmount.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-green-600">
                  ${commission.vendorAmount.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={commission.vendorPaymentStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => {
  const colors = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
    processing: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      label: "Processing",
    },
    paid: { bg: "bg-green-100", text: "text-green-700", label: "Paid" },
    failed: { bg: "bg-red-100", text: "text-red-700", label: "Failed" },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

export default CommissionDashboard;
