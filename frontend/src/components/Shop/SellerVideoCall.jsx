import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import VideoCallInterface from "./VideoCall/VideoCallInterface";
import { useSocket } from "../../contexts/SocketContext";

const SellerVideoCall = () => {
  const { seller } = useSelector((state) => state.seller);
  const { user } = useSelector((state) => state.user);
  const { socket } = useSocket();
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);

  useEffect(() => {
    // Don't show seller video call interface if seller is not logged in or user is acting as customer
    if (!seller || user) {
      console.log(
        "🚫 [Seller] Not showing seller video call - no seller or user active"
      );
      return;
    }

    console.log(
      "✅ [Seller] Initializing seller video call for seller:",
      seller._id
    );

    // Add seller to socket if not already added
    if (!socket) {
      console.log("🚫 [Seller] Socket not available");
      return;
    }

    socket.emit("addUser", seller._id);

    // Listen for incoming calls
    socket.on("incomingVideoCall", (callData) => {
      console.log("📞 [Seller] Received incoming call:", callData);
      console.log("📞 [Seller] Current seller ID:", seller._id);
      console.log("📞 [Seller] Call customer ID:", callData.customerId);
      console.log("📞 [Seller] Call seller ID:", callData.sellerId);

      // Convert to strings for comparison
      const currentSellerId = seller._id.toString();
      const targetSellerId = callData.sellerId?.toString();

      // Only show incoming call if:
      // 1. This seller is the target customer (customer is calling this seller)
      // 2. Seller is not already in a call

      if (
        targetSellerId &&
        currentSellerId === targetSellerId &&
        !activeCall &&
        !incomingCall
      ) {
        console.log("✅ [Seller] Call is for this seller from customer");
        setIncomingCall(callData);
        playRingtone();
        showNotification(`Incoming call from ${callData.customerName}`, {
          body: callData.productName
            ? `About: ${callData.productName}`
            : "Customer calling",
          icon: "/favicon.ico",
        });
      } else if (
        targetSellerId &&
        currentSellerId === targetSellerId &&
        (activeCall || incomingCall)
      ) {
        console.log("❌ [Seller] Seller is busy, rejecting call");
        // Send busy signal
        socket.emit("callStatusUpdate", {
          callId: callData.callId,
          status: "busy",
          senderId: seller._id,
          receiverId: callData.customerId,
        });
      } else {
        console.log("❌ [Seller] Call is not for this seller, ignoring");
        console.log(
          "📞 [Seller] Expected seller:",
          targetSellerId,
          "Current seller:",
          currentSellerId
        );
      }
    });

    // Listen for call status updates
    socket.on("callStatusUpdate", (data) => {
      if (data.status === "ended") {
        setActiveCall(null);
        setIncomingCall(null);
        stopRingtone();
        toast.info("Call ended");
      }
    });

    return () => {
      // Only remove the specific event listeners, don't disconnect global socket
      socket.off("incomingVideoCall");
      socket.off("callStatusUpdate");
      stopRingtone();
    };
  }, [seller, user, socket, activeCall, incomingCall]);

  const playRingtone = () => {
    try {
      const audio = new Audio("/sounds/ringtone.mp3");
      audio.loop = true;
      audio.play().catch((e) => console.log("Ringtone play failed:", e));
      window.currentRingtone = audio;
    } catch (error) {
      console.log("Ringtone not available:", error);
    }
  };

  const stopRingtone = () => {
    if (window.currentRingtone) {
      window.currentRingtone.pause();
      window.currentRingtone.currentTime = 0;
      window.currentRingtone = null;
    }
  };

  const showNotification = (title, options) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, options);
    } else if (
      "Notification" in window &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, options);
        }
      });
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    try {
      // Check if customer is blocked
      const response = await axios.get(
        `${server}/video-call/check-blocked/${incomingCall.customerId}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.isBlocked) {
        toast.error("This customer is blocked. Cannot accept call.");
        handleRejectCall();
        return;
      }

      // Accept the call via API
      await axios.post(
        `${server}/video-call/respond`,
        {
          callId: incomingCall.callId,
          response: "accepted",
        },
        { withCredentials: true }
      );

      stopRingtone();

      socket.emit("joinVideoCall", {
        callId: incomingCall.callId,
        userId: seller._id,
        userType: "seller",
      });

      setActiveCall(incomingCall);
      setIncomingCall(null);
    } catch (error) {
      console.error("Error accepting call:", error);
      toast.error("Failed to accept call");
    }
  };

  const handleRejectCall = async () => {
    if (!incomingCall) return;

    try {
      // Reject the call via API
      await axios.post(
        `${server}/video-call/respond`,
        {
          callId: incomingCall.callId,
          response: "rejected",
        },
        { withCredentials: true }
      );

      stopRingtone();

      socket.emit("callStatusUpdate", {
        callId: incomingCall.callId,
        status: "rejected",
        senderId: seller._id,
        receiverId: incomingCall.customerId,
      });

      setIncomingCall(null);
      toast.info("Call rejected");
    } catch (error) {
      console.error("Error rejecting call:", error);
      toast.error("Failed to reject call");
    }
  };

  const handleEndCall = async () => {
    if (!activeCall) return;

    try {
      // End the call via API
      await axios.post(
        `${server}/video-call/end`,
        {
          callId: activeCall.callId,
        },
        { withCredentials: true }
      );

      socket.emit("leaveVideoCall", {
        callId: activeCall.callId,
        userId: seller._id,
        userType: "seller",
      });

      setActiveCall(null);
      setIncomingCall(null);
      stopRingtone();
      toast.info("Call ended");
    } catch (error) {
      console.error("Error ending call:", error);
      toast.error("Failed to end call");
    }
  };

  // Don't render anything if seller not logged in or user is active
  if (!seller || user) {
    return null;
  }

  return (
    <>
      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-4">
                <i className="fas fa-phone-alt text-4xl text-green-500 mb-2"></i>
                <h3 className="text-xl font-semibold">Incoming Call</h3>
              </div>

              <div className="mb-4">
                <p className="text-gray-600">
                  <strong>{incomingCall.customerName}</strong> is calling
                </p>
                {incomingCall.productName && (
                  <p className="text-sm text-gray-500 mt-1">
                    About: {incomingCall.productName}
                  </p>
                )}
                {incomingCall.orderNumber && (
                  <p className="text-sm text-gray-500 mt-1">
                    Order: {incomingCall.orderNumber}
                  </p>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleRejectCall}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  <i className="fas fa-phone-slash mr-2"></i>
                  Decline
                </button>
                <button
                  onClick={handleAcceptCall}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  <i className="fas fa-phone mr-2"></i>
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Call Interface */}
      {activeCall && (
        <div className="fixed inset-0 bg-black z-50">
          <VideoCallInterface
            call={activeCall}
            socket={socket}
            userId={seller._id}
            userType="seller"
            onEndCall={handleEndCall}
          />
        </div>
      )}
    </>
  );
};

export default SellerVideoCall;
