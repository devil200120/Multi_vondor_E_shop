import React, { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import axios from "axios";
import { server } from "../../../server";
import { toast } from "react-toastify";

const CallHistory = ({ calls, onRefresh, onInitiateCall }) => {
  const [sortBy, setSortBy] = useState("date");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCall, setSelectedCall] = useState(null);
  const [callingBack, setCallingBack] = useState(null);
  const [blockingCustomer, setBlockingCustomer] = useState(null);
  const [showBlockModal, setShowBlockModal] = useState(null);
  const [blockReason, setBlockReason] = useState("other");
  const [blockNotes, setBlockNotes] = useState("");

  const sortedAndFilteredCalls = calls
    .filter((call) => filterStatus === "all" || call.status === filterStatus)
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "duration":
          return (b.duration || 0) - (a.duration || 0);
        case "customer":
          return (a.customer?.name || "Unknown").localeCompare(
            b.customer?.name || "Unknown"
          );
        default:
          return 0;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "missed":
        return "bg-red-100 text-red-800";
      case "declined":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "fa-check-circle";
      case "missed":
        return "fa-phone-slash";
      case "declined":
        return "fa-times-circle";
      case "failed":
        return "fa-exclamation-triangle";
      default:
        return "fa-phone";
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatCallTime = (date) => {
    return format(new Date(date), "MMM dd, yyyy HH:mm");
  };

  const getCallTypeLabel = (call) => {
    if (call.orderId) {
      return `Order #${call.orderId?.orderNumber || "N/A"}`;
    }
    if (call.productId) {
      return `Product: ${call.productId?.name || "N/A"}`;
    }
    return "General Inquiry";
  };

  const handleCallBack = async (call) => {
    try {
      setCallingBack(call._id);

      if (onInitiateCall) {
        // Call back to the customer who called
        await onInitiateCall(call.customer._id, call.orderId?._id);
      }
    } catch (error) {
      console.error("Failed to call back:", error);
    } finally {
      setCallingBack(null);
    }
  };

  const canCallBack = (call) => {
    // Can call back if the call is completed, declined, or ended
    return (
      ["completed", "declined", "ended", "missed"].includes(call.status) &&
      call.customer?._id
    );
  };

  // Block customer function
  const handleBlockCustomer = async (call) => {
    try {
      setBlockingCustomer(call.customer._id);

      const blockData = {
        customerId: call.customer._id,
        reason: blockReason,
        notes: blockNotes,
        callId: call.callId,
      };

      await axios.post(`${server}/video-call/block-customer`, blockData, {
        withCredentials: true,
      });

      toast.success(`${call.customer.name} has been blocked successfully`);
      setShowBlockModal(null);
      setBlockReason("other");
      setBlockNotes("");

      // Refresh call history to update UI
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error blocking customer:", error);
      toast.error(error.response?.data?.message || "Failed to block customer");
    } finally {
      setBlockingCustomer(null);
    }
  };

  const canBlockCustomer = (call) => {
    // Can block if call has a customer
    return call.customer?._id;
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">Call History</h2>
          <button
            onClick={onRefresh}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-sync-alt mr-1"></i>
            Refresh
          </button>
        </div>

        <div className="flex space-x-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
            <option value="declined">Declined</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="duration">Sort by Duration</option>
            <option value="customer">Sort by Customer</option>
          </select>
        </div>
      </div>

      {/* Call Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{calls.length}</div>
          <div className="text-sm text-gray-500">Total Calls</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {calls.filter((call) => call.status === "completed").length}
          </div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">
            {calls.filter((call) => call.status === "missed").length}
          </div>
          <div className="text-sm text-gray-500">Missed</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(
              calls
                .filter((call) => call.duration)
                .reduce((acc, call) => acc + call.duration, 0) / 60
            )}
          </div>
          <div className="text-sm text-gray-500">Total Minutes</div>
        </div>
      </div>

      {/* Calls List */}
      {sortedAndFilteredCalls.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-history text-gray-400 text-xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No call history found
          </h3>
          <p className="text-gray-500">
            {filterStatus !== "all"
              ? "No calls match the selected filter"
              : "Start making calls to see your history here"}
          </p>
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
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedAndFilteredCalls.map((call, index) => (
                  <tr
                    key={call._id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {(call.customer?.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {call.customer?.name || "Unknown Customer"}
                          </div>
                          {call.customer?.email && (
                            <div className="text-sm text-gray-500">
                              {call.customer.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getCallTypeLabel(call)}
                      </div>
                      {call.orderId && (
                        <div className="text-xs text-gray-500">
                          Order Support
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          call.status
                        )}`}
                      >
                        <i
                          className={`fas ${getStatusIcon(call.status)} mr-1`}
                        ></i>
                        {call.status.charAt(0).toUpperCase() +
                          call.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(call.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCallTime(call.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(call.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedCall(call)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>

                        {/* Callback button */}
                        {canCallBack(call) && (
                          <button
                            onClick={() => handleCallBack(call)}
                            disabled={callingBack === call._id}
                            className={`${
                              callingBack === call._id
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-green-600 hover:text-green-900"
                            } transition-colors`}
                            title="Call back this customer"
                          >
                            {callingBack === call._id ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fas fa-phone"></i>
                            )}
                          </button>
                        )}

                        {/* Block customer button */}
                        {canBlockCustomer(call) && (
                          <button
                            onClick={() => setShowBlockModal(call)}
                            className="text-red-600 hover:text-red-900"
                            title="Block this customer"
                          >
                            <i className="fas fa-ban"></i>
                          </button>
                        )}

                        {call.recording && (
                          <button
                            onClick={() =>
                              window.open(call.recording, "_blank")
                            }
                            className="text-purple-600 hover:text-purple-900"
                            title="View recording"
                          >
                            <i className="fas fa-play"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Call Detail Modal */}
      {selectedCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Call Details</h2>
              <button
                onClick={() => setSelectedCall(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-6">
              {/* Call Overview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Customer
                    </label>
                    <div className="text-lg font-semibold">
                      {selectedCall.customer?.name || "Unknown"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          selectedCall.status
                        )}`}
                      >
                        <i
                          className={`fas ${getStatusIcon(
                            selectedCall.status
                          )} mr-1`}
                        ></i>
                        {selectedCall.status.charAt(0).toUpperCase() +
                          selectedCall.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Duration
                    </label>
                    <div className="text-lg font-semibold">
                      {formatDuration(selectedCall.duration)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Date & Time
                    </label>
                    <div className="text-lg font-semibold">
                      {formatCallTime(selectedCall.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              {selectedCall.orderId && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Order Information
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Order Number
                        </label>
                        <div className="text-lg font-semibold">
                          #{selectedCall.orderId?.orderNumber || "N/A"}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Order Status
                        </label>
                        <div className="text-lg font-semibold">
                          {selectedCall.orderStatus || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Call Notes */}
              {selectedCall.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Notes</h3>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedCall.notes}</p>
                  </div>
                </div>
              )}

              {/* Technical Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Technical Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Call ID:</span>
                    <div className="font-mono text-xs bg-gray-100 p-1 rounded">
                      {selectedCall.callId}
                    </div>
                  </div>
                  {selectedCall.endReason && (
                    <div>
                      <span className="text-gray-500">End Reason:</span>
                      <div>{selectedCall.endReason}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4 pt-4 border-t">
                {/* Callback button */}
                {canCallBack(selectedCall) && (
                  <button
                    onClick={() => {
                      handleCallBack(selectedCall);
                      setSelectedCall(null); // Close modal after initiating callback
                    }}
                    disabled={callingBack === selectedCall._id}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      callingBack === selectedCall._id
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {callingBack === selectedCall._id ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Calling...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-phone mr-2"></i>
                        Call Back
                      </>
                    )}
                  </button>
                )}

                {/* Block customer button in detail modal */}
                {canBlockCustomer(selectedCall) && (
                  <button
                    onClick={() => {
                      setShowBlockModal(selectedCall);
                      setSelectedCall(null); // Close detail modal
                    }}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                  >
                    <i className="fas fa-ban mr-2"></i>
                    Block Customer
                  </button>
                )}

                {selectedCall.recording && (
                  <button
                    onClick={() =>
                      window.open(selectedCall.recording, "_blank")
                    }
                    className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
                  >
                    <i className="fas fa-play mr-2"></i>
                    Play Recording
                  </button>
                )}
                <button
                  onClick={() => setSelectedCall(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block Customer Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Block Customer
              </h2>
              <button
                onClick={() => setShowBlockModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                Are you sure you want to block{" "}
                <span className="font-semibold">
                  {showBlockModal.customer?.name}
                </span>
                ?
              </p>
              <p className="text-sm text-gray-500">
                Blocked customers will not be able to call you anymore.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for blocking
                </label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="spam_calls">Spam calls</option>
                  <option value="inappropriate_behavior">
                    Inappropriate behavior
                  </option>
                  <option value="abusive_language">Abusive language</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional notes (optional)
                </label>
                <textarea
                  value={blockNotes}
                  onChange={(e) => setBlockNotes(e.target.value)}
                  placeholder="Add any additional details..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => handleBlockCustomer(showBlockModal)}
                disabled={blockingCustomer === showBlockModal.customer._id}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  blockingCustomer === showBlockModal.customer._id
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {blockingCustomer === showBlockModal.customer._id ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Blocking...
                  </>
                ) : (
                  <>
                    <i className="fas fa-ban mr-2"></i>
                    Block Customer
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowBlockModal(null);
                  setBlockReason("other");
                  setBlockNotes("");
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
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

export default CallHistory;
