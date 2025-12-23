import axios from "axios";
import React, { useEffect, useState } from "react";
import { server } from "../../server";
import { Link } from "react-router-dom";
import { DataGrid } from "@material-ui/data-grid";
import { BsPencil } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import styles from "../../styles/styles";
import { toast } from "react-toastify";

const AllWithdraw = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [withdrawData, setWithdrawData] = useState();
  const [withdrawStatus, setWithdrawStatus] = useState("Processing");
  const [payoutMethod, setPayoutMethod] = useState("bank"); // 'bank' or 'upi'
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWithdrawRequests = async () => {
      try {
        setFetchLoading(true);
        setError(null);
        console.log(
          "Fetching withdrawal requests from:",
          `${server}/withdraw/get-all-withdraw-request`
        );

        const response = await axios.get(
          `${server}/withdraw/get-all-withdraw-request`,
          {
            withCredentials: true,
          }
        );

        console.log("Withdrawal requests response:", response.data);

        if (response.data.success) {
          setData(response.data.withdraws || []);
          console.log(
            "Withdrawal requests loaded:",
            response.data.withdraws?.length || 0
          );
        } else {
          console.error("API returned success: false");
          setError("Failed to load withdrawal requests");
          toast.error("Failed to load withdrawal requests");
        }
      } catch (error) {
        console.error("Error fetching withdrawal requests:", error);
        console.error("Error response:", error.response?.data);

        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to load withdrawal requests";
        setError(errorMessage);
        toast.error(`Error: ${errorMessage}`);

        // If it's an authentication error, redirect or show specific message
        if (error.response?.status === 401) {
          toast.error("Please login as admin to view withdrawal requests");
        } else if (error.response?.status === 403) {
          toast.error("Access denied. Admin permissions required.");
        }
      } finally {
        setFetchLoading(false);
      }
    };

    fetchWithdrawRequests();
  }, []);

  const columns = [
    { field: "id", headerName: "Withdraw Id", minWidth: 150, flex: 0.7 },
    {
      field: "name",
      headerName: "Shop Name",
      minWidth: 180,
      flex: 1.4,
    },
    {
      field: "shopId",
      headerName: "Shop Id",
      minWidth: 180,
      flex: 1.4,
    },
    {
      field: "amount",
      headerName: "Amount",
      minWidth: 100,
      flex: 0.6,
    },
    {
      field: "status",
      headerName: "status",
      type: "text",
      minWidth: 80,
      flex: 0.5,
    },
    {
      field: "createdAt",
      headerName: "Request given at",
      type: "number",
      minWidth: 130,
      flex: 0.6,
    },
    {
      field: " ",
      headerName: "Update Status",
      type: "number",
      minWidth: 130,
      flex: 0.6,
      renderCell: (params) => {
        return (
          <BsPencil
            size={20}
            className={`${
              params.row.status !== "Processing" ? "hidden" : ""
            } mr-5 cursor-pointer`}
            onClick={() => setOpen(true) || setWithdrawData(params.row)}
          />
        );
      },
    },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios
        .put(
          `${server}/withdraw/update-withdraw-request/${withdrawData.id}`,
          {
            sellerId: withdrawData.shopId,
          },
          { withCredentials: true }
        )
        .then((res) => {
          toast.success("Withdraw request updated successfully!");
          setData(res.data.withdraws);
          setOpen(false);
        });
    } catch (error) {
      toast.error("Failed to update withdrawal request");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // New PhonePe Payout Handler
  const handlePhonePePayout = async () => {
    if (!withdrawData) {
      toast.error("No withdrawal data selected");
      return;
    }

    setLoading(true);
    try {
      console.log(
        `🏦 Initiating PhonePe ${payoutMethod} payout for withdrawal:`,
        withdrawData.id
      );

      await axios
        .put(
          `${server}/withdraw/approve-withdrawal-with-phonepe-payout/${withdrawData.id}`,
          {
            sellerId: withdrawData.shopId,
            payoutMethod: payoutMethod, // 'bank' or 'upi'
          },
          { withCredentials: true }
        )
        .then((res) => {
          toast.success(
            `🎉 PhonePe ${payoutMethod} payout initiated successfully!`
          );
          toast.info(`Transaction ID: ${res.data.payoutTransactionId}`);

          // Refresh the data
          axios
            .get(`${server}/withdraw/get-all-withdraw-request`, {
              withCredentials: true,
            })
            .then((refreshRes) => {
              setData(refreshRes.data.withdraws);
            });

          setOpen(false);
        });
    } catch (error) {
      const errorMsg = error.response?.data?.message || "PhonePe payout failed";
      toast.error(`❌ Payout failed: ${errorMsg}`);
      console.error("PhonePe payout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const row = [];

  if (data && Array.isArray(data)) {
    data.forEach((item, index) => {
      try {
        // Handle cases where seller data might not be populated
        const sellerId = item.seller?._id || item.seller || "N/A";
        const sellerName = item.seller?.name || "Unknown Shop";
        const amount = item.amount || 0;
        const status = item.status || "Processing";
        const createdAt = item.createdAt ? item.createdAt.slice(0, 10) : "N/A";

        row.push({
          id: item._id || `temp-${index}`,
          shopId: sellerId,
          name: sellerName,
          amount: "₹ " + amount,
          status: status,
          createdAt: createdAt,
        });
      } catch (rowError) {
        console.error("Error processing withdrawal row:", rowError, item);
        // Add a fallback row to avoid breaking the UI
        row.push({
          id: `error-${index}`,
          shopId: "Error",
          name: "Data Error",
          amount: "₹ 0",
          status: "Error",
          createdAt: "N/A",
        });
      }
    });
  }

  console.log("Processed withdrawal rows:", row);

  const refreshData = async () => {
    setFetchLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${server}/withdraw/get-all-withdraw-request`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setData(response.data.withdraws || []);
        toast.success("Data refreshed successfully!");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to refresh data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setFetchLoading(false);
    }
  };
  return (
    <div className="w-full flex items-center pt-5 justify-center">
      <div className="w-[95%] bg-white">
        {/* Header with refresh button */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            💰 Withdrawal Requests
          </h2>
          <button
            onClick={refreshData}
            disabled={fetchLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {fetchLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Refreshing...
              </>
            ) : (
              <>🔄 Refresh</>
            )}
          </button>
        </div>

        {fetchLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            <div className="ml-4">
              <p className="text-lg font-semibold">
                Loading withdrawal requests...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-lg font-semibold text-red-600 mb-2">
                Failed to load withdrawal requests
              </p>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={refreshData}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <p className="text-lg font-semibold text-gray-600">
                No withdrawal requests found
              </p>
              <p className="text-gray-500">
                Sellers haven't made any withdrawal requests yet.
              </p>
            </div>
          </div>
        ) : (
          <DataGrid
            rows={row}
            columns={columns}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
          />
        )}
      </div>
      {open && (
        <div className="w-full fixed h-screen top-0 left-0 bg-[#00000031] z-[9999] flex items-center justify-center">
          <div className="w-[60%] min-h-[50vh] bg-white rounded shadow p-6">
            <div className="flex justify-end w-full">
              <RxCross1
                size={25}
                onClick={() => setOpen(false)}
                className="cursor-pointer hover:text-red-500"
              />
            </div>

            <h1 className="text-[28px] text-center font-Poppins font-bold mb-2">
              💰 Process Withdrawal
            </h1>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-lg mb-2">
                📋 Withdrawal Details:
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Shop:</strong> {withdrawData?.name}
                </div>
                <div>
                  <strong>Amount:</strong> {withdrawData?.amount}
                </div>
                <div>
                  <strong>Status:</strong>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-xs ${
                      withdrawData?.status === "Processing"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-gray-200"
                    }`}
                  >
                    {withdrawData?.status}
                  </span>
                </div>
                <div>
                  <strong>Request Date:</strong> {withdrawData?.createdAt}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* PhonePe Automated Payout Section */}
              <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">
                  🚀 PhonePe Automated Payout (Recommended)
                </h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Select Payout Method:
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="payoutMethod"
                        value="bank"
                        checked={payoutMethod === "bank"}
                        onChange={(e) => setPayoutMethod(e.target.value)}
                        className="mr-2"
                      />
                      🏦 Bank Transfer (NEFT/IMPS)
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="payoutMethod"
                        value="upi"
                        checked={payoutMethod === "upi"}
                        onChange={(e) => setPayoutMethod(e.target.value)}
                        className="mr-2"
                      />
                      📱 UPI Instant Transfer
                    </label>
                  </div>
                </div>

                <div className="bg-white p-3 rounded border mb-4">
                  <h4 className="font-medium mb-2">✅ Benefits:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Instant automated processing</li>
                    <li>• Real-time status tracking</li>
                    <li>
                      •{" "}
                      {payoutMethod === "upi"
                        ? "Instant money transfer"
                        : "Same-day bank transfer"}
                    </li>
                    <li>• Automatic email notifications</li>
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  className={`w-full ${
                    styles.button
                  } bg-purple-600 hover:bg-purple-700 text-white !h-[45px] text-[16px] font-medium rounded-lg transition-colors ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handlePhonePePayout}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing PhonePe Payout...
                    </div>
                  ) : (
                    `🚀 Process ${
                      payoutMethod === "upi" ? "UPI" : "Bank"
                    } Payout with PhonePe`
                  )}
                </button>
              </div>

              {/* Manual Status Update Section */}
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  ⚠️ Manual Status Update
                </h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Change Status:
                  </label>
                  <select
                    onChange={(e) => setWithdrawStatus(e.target.value)}
                    className="w-[200px] h-[35px] border rounded px-2"
                  >
                    <option value={withdrawStatus}>
                      {withdrawData?.status}
                    </option>
                    <option value="succeed">Succeed</option>
                  </select>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  ⚠️ Note: This only updates the status in the system. No actual
                  money transfer will occur.
                </p>

                <button
                  type="button"
                  disabled={loading}
                  className={`${
                    styles.button
                  } bg-gray-600 hover:bg-gray-700 text-white !h-[42px] text-[16px] ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handleSubmit}
                >
                  {loading ? "Updating..." : "Update Status Only"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllWithdraw;
