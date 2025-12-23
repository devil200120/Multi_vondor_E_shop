import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import VideoCallInterface from "../Shop/VideoCall/VideoCallInterface";
import { useSocket } from "../../contexts/SocketContext";

const CustomerVideoCall = () => {
  const { user } = useSelector((state) => state.user);
  const { seller } = useSelector((state) => state.seller);
  const { socket } = useSocket();
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Don't show customer video call interface if user is currently acting as a seller
    if (!user || seller || !socket) {
      console.log(
        "🚫 [Customer] Not showing customer video call - no user, seller active, or no socket"
      );
      return;
    }

    console.log(
      "✅ [Customer] Initializing customer video call for user:",
      user._id
    );

    // Add user to socket
    socket.emit("addUser", user._id);

    // Listen for incoming calls
    socket.on("incomingVideoCall", (callData) => {
      console.log("📞 [Customer] Received incoming call:", callData);
      console.log("📞 [Customer] Current user ID:", user._id);
      console.log("📞 [Customer] Call customer ID:", callData.customerId);
      console.log("📞 [Customer] Call seller ID:", callData.sellerId);

      // Convert to strings for comparison
      const currentUserId = user._id.toString();
      const targetCustomerId = callData.customerId?.toString();

      // Only show incoming call if:
      // 1. This user is the target customer (seller is calling this customer)
      // 2. OR this user is the target seller (customer is calling this seller, but we handle this in seller component)

      // For customer component, only handle calls where this user is the target customer
      if (targetCustomerId && currentUserId === targetCustomerId) {
        console.log("✅ [Customer] Call is for this customer from seller");
        setIncomingCall(callData);
        playRingtone();
        showNotification(`Incoming call from ${callData.sellerName}`, {
          body: callData.productName
            ? `About: ${callData.productName}`
            : "Seller calling",
          icon: "/favicon.ico",
        });
      } else {
        console.log("❌ [Customer] Call is not for this customer, ignoring");
        console.log(
          "📞 [Customer] Expected customer:",
          currentUserId,
          "Got:",
          targetCustomerId
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
  }, [user, seller, socket]);

  useEffect(() => {
    if (user) {
      fetchCallHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchCallHistory = async () => {
    try {
      const response = await axios.get(
        `${server}/video-call/customer-history/${user?._id}`,
        { withCredentials: true }
      );
      setCallHistory(response.data.calls);
    } catch (error) {
      console.error("Error fetching call history:", error);
    }
  };

  const playRingtone = () => {
    // Create audio element for ringtone
    const audio = document.createElement("audio");
    audio.src = "/sounds/ringtone.mp3"; // Add ringtone file to public/sounds/
    audio.loop = true;
    audio.play().catch(console.error);
    audio.id = "ringtone";
    document.body.appendChild(audio);
  };

  const stopRingtone = () => {
    const audio = document.getElementById("ringtone");
    if (audio) {
      audio.pause();
      audio.remove();
    }
  };

  const showNotification = (title, options) => {
    if (Notification.permission === "granted") {
      new Notification(title, options);
    } else if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, options);
        }
      });
    }
  };

  const acceptCall = async () => {
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
        userId: user._id,
        userType: "customer",
      });

      toast.success("Call accepted");
    } catch (error) {
      toast.error("Failed to accept call");
    }
  };

  const declineCall = async () => {
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

      // Emit socket event to notify seller that call was declined
      if (socket && incomingCall) {
        socket.emit("callStatusUpdate", {
          callId: incomingCall.callId,
          status: "declined",
          userId: user._id,
          userType: "customer",
        });
      }

      setIncomingCall(null);
      toast.info("Call declined");
    } catch (error) {
      toast.error("Failed to decline call");
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
          userId: user._id,
        });

        setActiveCall(null);
        fetchCallHistory(); // Refresh history
      } catch (error) {
        console.error("Error ending call:", error);
      }
    }
  };

  // If there's an active call, show the video interface
  if (activeCall) {
    return (
      <VideoCallInterface
        call={activeCall}
        socket={socket}
        userId={user._id}
        userType="customer"
        onEndCall={endCall}
      />
    );
  }

  // Don't render anything if user is acting as seller or no user
  if (!user || seller) {
    return null;
  }

  return (
    <>
      {/* Incoming Call Notification */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
            {/* Seller Avatar */}
            <div className="mb-6">
              <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <i className="fas fa-store text-white text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Incoming Video Call
              </h3>
              <p className="text-lg text-gray-600 mb-1">
                {incomingCall.sellerName}
              </p>
              <p className="text-sm text-gray-500">{incomingCall.shopName}</p>
              {incomingCall.orderNumber && (
                <p className="text-xs text-blue-600 mt-2">
                  Regarding Order: #{incomingCall.orderNumber}
                </p>
              )}
            </div>

            {/* Call Controls */}
            <div className="flex justify-center space-x-6">
              <button
                onClick={declineCall}
                className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
              >
                <i className="fas fa-phone-slash text-xl"></i>
              </button>
              <button
                onClick={acceptCall}
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

      {/* Call History Widget (only show if user has call history) */}
      {callHistory.length > 0 && (
        <div
          className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border z-50 transition-all duration-300 ${
            isMinimized ? "w-12 h-12" : "w-80 max-h-96"
          }`}
        >
          {isMinimized ? (
            <button
              onClick={() => setIsMinimized(false)}
              className="w-full h-full flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <i className="fas fa-video"></i>
            </button>
          ) : (
            <div></div>
          )}
        </div>
      )}
    </>
  );
};

export default CustomerVideoCall;
