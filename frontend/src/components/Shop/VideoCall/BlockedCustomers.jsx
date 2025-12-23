import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { formatDistanceToNow, format } from "date-fns";
import axios from "axios";
import { server } from "../../../server";
import { toast } from "react-toastify";

const BlockedCustomers = () => {
  const { seller } = useSelector((state) => state.seller);
  const [blockedCustomers, setBlockedCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unblockingCustomer, setUnblockingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    if (seller) {
      fetchBlockedCustomers();
    }
  }, [seller]);

  const fetchBlockedCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${server}/video-call/blocked-customers`,
        { withCredentials: true }
      );
      setBlockedCustomers(response.data.blockedCustomers || []);
    } catch (error) {
      console.error("Error fetching blocked customers:", error);
      toast.error("Failed to fetch blocked customers");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockCustomer = async (customerId, customerName) => {
    try {
      setUnblockingCustomer(customerId);

      await axios.post(
        `${server}/video-call/unblock-customer`,
        { customerId },
        { withCredentials: true }
      );

      toast.success(`${customerName} has been unblocked successfully`);

      // Remove from the list immediately for better UX
      setBlockedCustomers((prev) =>
        prev.filter((blocked) => blocked.customer._id !== customerId)
      );
    } catch (error) {
      console.error("Error unblocking customer:", error);
      toast.error(
        error.response?.data?.message || "Failed to unblock customer"
      );
    } finally {
      setUnblockingCustomer(null);
    }
  };

  const getReasonLabel = (reason) => {
    switch (reason) {
      case "spam_calls":
        return "Spam Calls";
      case "inappropriate_behavior":
        return "Inappropriate Behavior";
      case "abusive_language":
        return "Abusive Language";
      case "other":
        return "Other";
      default:
        return "Unknown";
    }
  };

  const getReasonColor = (reason) => {
    switch (reason) {
      case "spam_calls":
        return "bg-yellow-100 text-yellow-800";
      case "inappropriate_behavior":
        return "bg-red-100 text-red-800";
      case "abusive_language":
        return "bg-red-100 text-red-800";
      case "other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-3 text-gray-600">Loading blocked customers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Blocked Customers
          </h2>
          <button
            onClick={fetchBlockedCustomers}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <i className="fas fa-sync-alt mr-1"></i>
            Refresh
          </button>
        </div>

        <div className="text-sm text-gray-500">
          Total blocked: {blockedCustomers.length}
        </div>
      </div>

      {/* Blocked Customers List */}
      {blockedCustomers.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-user-slash text-gray-400 text-xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No blocked customers
          </h3>
          <p className="text-gray-500">Customers you block will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blocked Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {blockedCustomers.map((blocked, index) => (
                  <tr
                    key={blocked._id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {(blocked.customer?.name || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {blocked.customer?.name || "Unknown Customer"}
                          </div>
                          {blocked.customer?.email && (
                            <div className="text-sm text-gray-500">
                              {blocked.customer.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReasonColor(
                          blocked.reason
                        )}`}
                      >
                        {getReasonLabel(blocked.reason)}
                      </span>
                      {blocked.notes && (
                        <div className="text-xs text-gray-500 mt-1">
                          {blocked.notes.length > 50
                            ? `${blocked.notes.substring(0, 50)}...`
                            : blocked.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(blocked.blockedAt), "MMM dd, yyyy")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(blocked.blockedAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedCustomer(blocked)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>

                        <button
                          onClick={() =>
                            handleUnblockCustomer(
                              blocked.customer._id,
                              blocked.customer.name
                            )
                          }
                          disabled={unblockingCustomer === blocked.customer._id}
                          className={`${
                            unblockingCustomer === blocked.customer._id
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-green-600 hover:text-green-900"
                          } transition-colors`}
                          title="Unblock this customer"
                        >
                          {unblockingCustomer === blocked.customer._id ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-unlock"></i>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Blocked Customer Details
              </h2>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Customer Name
                    </label>
                    <div className="text-lg font-semibold">
                      {selectedCustomer.customer?.name || "Unknown"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <div className="text-lg">
                      {selectedCustomer.customer?.email || "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Blocked Date
                    </label>
                    <div className="text-lg">
                      {format(
                        new Date(selectedCustomer.blockedAt),
                        "MMM dd, yyyy 'at' HH:mm"
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Reason
                    </label>
                    <div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReasonColor(
                          selectedCustomer.reason
                        )}`}
                      >
                        {getReasonLabel(selectedCustomer.reason)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedCustomer.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Notes</h3>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedCustomer.notes}</p>
                  </div>
                </div>
              )}

              {/* Last Call Info */}
              {selectedCustomer.lastCallId && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Related Call</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      Call ID:{" "}
                      <span className="font-mono">
                        {selectedCustomer.lastCallId}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-4 pt-4 border-t">
                <button
                  onClick={() => {
                    handleUnblockCustomer(
                      selectedCustomer.customer._id,
                      selectedCustomer.customer.name
                    );
                    setSelectedCustomer(null);
                  }}
                  disabled={
                    unblockingCustomer === selectedCustomer.customer._id
                  }
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    unblockingCustomer === selectedCustomer.customer._id
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {unblockingCustomer === selectedCustomer.customer._id ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Unblocking...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-unlock mr-2"></i>
                      Unblock Customer
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockedCustomers;
