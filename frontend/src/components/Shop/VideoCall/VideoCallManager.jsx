import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../../server";
import { toast } from "react-toastify";
import VideoCallInterface from "./VideoCallInterface";
import CallHistory from "./CallHistory";
import CustomersList from "./CustomersList";
import BlockedCustomers from "./BlockedCustomers";
import { useSocket } from "../../../contexts/SocketContext";

const VideoCallManager = () => {
  const { seller } = useSelector((state) => state.seller);
  const { socket } = useSocket(); // Use global socket
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState("customers");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!socket || !seller) return;

    console.log(
      "📞 [VideoCallManager] Setting up video call listeners for seller:",
      seller._id
    );

    // Note: Incoming call handling is now managed by SellerVideoCall component globally

    // Listen for call status updates
    socket.on("callStatusUpdate", (data) => {
      console.log("Received call status update:", data);
      if (data.status === "ended" || data.status === "declined") {
        setActiveCall(null);
        setIncomingCall(null);
        if (data.status === "declined") {
          toast.info("Customer declined the call");
        } else {
          toast.info("Call ended");
        }
      }
    });

    // Listen for real-time online status changes
    socket.on("userOnlineStatusChanged", (data) => {
      console.log("User online status changed:", data);
      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) => {
          if (customer._id === data.userId) {
            // Show toast notification for status change
            const customerName = customer.name || "Customer";
            if (data.isOnline) {
              toast.success(`${customerName} is now online`, {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            }
            return { ...customer, isOnline: data.isOnline };
          }
          return customer;
        })
      );
    });

    return () => {
      socket.off("callStatusUpdate");
      socket.off("userOnlineStatusChanged");
      stopRingtone();
    };
  }, [seller, socket]);

  useEffect(() => {
    fetchCallHistory();
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopRingtone = () => {
    const audio = document.getElementById("seller-ringtone");
    if (audio) {
      audio.pause();
      audio.remove();
    }
  };

  const acceptIncomingCall = async () => {
    try {
      stopRingtone();

      await axios.post(
        `${server}/video-call/respond`,
        {
          callId: incomingCall.callId,
          response: "accepted",
        },
        { withCredentials: true }
      );

      setActiveCall(incomingCall);
      setIncomingCall(null);

      // Join video call room
      socket.emit("joinVideoCall", {
        callId: incomingCall.callId,
        userId: seller._id,
        userType: "seller",
      });

      toast.success("Call accepted");
      fetchCallHistory(); // Refresh history to show the accepted call
    } catch (error) {
      toast.error("Failed to accept call");
    }
  };

  const declineIncomingCall = async () => {
    try {
      stopRingtone();

      await axios.post(
        `${server}/video-call/respond`,
        {
          callId: incomingCall.callId,
          response: "declined",
        },
        { withCredentials: true }
      );

      // Emit socket event to notify customer that call was declined
      if (socket && incomingCall) {
        socket.emit("callStatusUpdate", {
          callId: incomingCall.callId,
          status: "declined",
          userId: seller._id,
          userType: "seller",
        });
      }

      setIncomingCall(null);
      toast.info("Call declined");
      fetchCallHistory(); // Refresh history to show the declined call
    } catch (error) {
      toast.error("Failed to decline call");
    }
  };

  const fetchCallHistory = async () => {
    try {
      const response = await axios.get(
        `${server}/video-call/history/${seller?._id}`,
        { withCredentials: true }
      );
      setCallHistory(response.data.calls);
    } catch (error) {
      console.error("Error fetching call history:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        `${server}/video-call/customers/${seller?._id}`,
        { withCredentials: true }
      );
      setCustomers(response.data.customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const initiateCall = async (customerId, orderId = null) => {
    setLoading(true);
    try {
      const requestBody = {
        customerId,
        callType: "general_support",
      };

      // Only add orderId if it's not null
      if (orderId) {
        requestBody.orderId = orderId;
      }

      console.log("🎯 [Seller] Initiating call with data:", requestBody);

      const response = await axios.post(
        `${server}/video-call/initiate`,
        requestBody,
        { withCredentials: true }
      );

      console.log("🎯 [Seller] Backend response:", response.data);

      const callData = response.data.videoCall; // Changed from 'call' to 'videoCall' to match backend response

      console.log("🎯 [Seller] Extracted call data:", callData);
      console.log("🎯 [Seller] Call seller field:", callData.seller);
      console.log("🎯 [Seller] Call customer field:", callData.customer);
      console.log("🎯 [Seller] Setting active call...");

      setActiveCall(callData);

      // Emit socket event to notify customer of incoming call
      if (socket && callData) {
        // Handle both populated and non-populated seller/customer data
        const sellerData = callData.seller || {
          _id: seller._id,
          name: seller.name,
        };
        const customerData = callData.customer || { _id: customerId };

        const incomingCallData = {
          callId: callData.callId,
          sellerId: (typeof sellerData === "object"
            ? sellerData._id
            : sellerData
          ).toString(),
          sellerName: sellerData.name || seller.name,
          shopName: seller.shopName || seller.name,
          customerId: (typeof customerData === "object"
            ? customerData._id
            : customerData
          ).toString(),
          customerName: customerData.name || "Customer",
          callType: callData.callType,
          orderNumber: callData.orderId?.orderNumber || null,
          timestamp: new Date(),
        };

        console.log(
          "🚀 [Seller] Sending incoming call data:",
          incomingCallData
        );
        console.log(
          "🚀 [Seller] Target customer ID:",
          incomingCallData.customerId
        );
        console.log("🚀 [Seller] Current seller ID:", seller._id);

        // Emit to notify customer
        socket.emit("incomingVideoCall", incomingCallData);
      }

      // Join video call room
      socket.emit("joinVideoCall", {
        callId: callData.callId,
        userId: seller._id,
        userType: "seller",
      });

      toast.success("Call initiated successfully");
    } catch (error) {
      console.error("❌ [Seller] Error initiating call:", error);
      toast.error(error.response?.data?.message || "Failed to initiate call");
    } finally {
      setLoading(false);
    }
  };

  const endCall = async () => {
    if (activeCall) {
      try {
        await axios.post(
          `${server}/video-call/end`,
          {
            callId: activeCall.callId,
          },
          { withCredentials: true }
        );

        // Leave video call room
        socket.emit("leaveVideoCall", {
          callId: activeCall.callId,
          userId: seller._id,
        });

        setActiveCall(null);
        fetchCallHistory(); // Refresh history
      } catch (error) {
        console.error("Error ending call:", error);
      }
    }
  };

  if (activeCall) {
    console.log(
      "🎬 [Seller] Rendering VideoCallInterface with call:",
      activeCall
    );
    return (
      <VideoCallInterface
        call={activeCall}
        socket={socket}
        userId={seller._id}
        userType="seller"
        onEndCall={endCall}
      />
    );
  }

  console.log(
    "📋 [Seller] Rendering call center interface, activeCall:",
    activeCall
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Incoming Call Notification */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
            {/* Customer Avatar */}
            <div className="mb-6">
              <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <i className="fas fa-user text-white text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Incoming Video Call
              </h3>
              <p className="text-lg text-gray-600 mb-1">
                {incomingCall.customerName}
              </p>
              {incomingCall.productName && (
                <p className="text-sm text-blue-600 mt-2">
                  About: {incomingCall.productName}
                </p>
              )}
              {incomingCall.orderNumber && (
                <p className="text-xs text-blue-600 mt-2">
                  Order: #{incomingCall.orderNumber}
                </p>
              )}
            </div>

            {/* Call Controls */}
            <div className="flex justify-center space-x-6">
              <button
                onClick={declineIncomingCall}
                className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
              >
                <i className="fas fa-phone-slash text-xl"></i>
              </button>
              <button
                onClick={acceptIncomingCall}
                className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors shadow-lg animate-bounce"
              >
                <i className="fas fa-video text-xl"></i>
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Tap the green button to accept or red button to decline
            </p>
          </div>
        </div>
      )}

      {/* Main Interface */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Video Call Center
            </h1>
            <p className="text-gray-600 mt-1">
              Connect with your customers through video calls
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("customers")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "customers"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <i className="fas fa-users mr-2"></i>
                Customers ({customers.length})
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "history"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <i className="fas fa-history mr-2"></i>
                Call History ({callHistory.length})
              </button>
              <button
                onClick={() => setActiveTab("blocked")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "blocked"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <i className="fas fa-user-slash mr-2"></i>
                Blocked Customers
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "customers" && (
              <CustomersList
                customers={customers}
                onInitiateCall={initiateCall}
                loading={loading}
              />
            )}
            {activeTab === "history" && (
              <CallHistory
                calls={callHistory}
                onRefresh={fetchCallHistory}
                onInitiateCall={initiateCall}
              />
            )}
            {activeTab === "blocked" && <BlockedCustomers />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallManager;
