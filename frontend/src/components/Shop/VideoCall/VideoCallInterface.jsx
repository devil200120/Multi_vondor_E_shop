import React, { useRef, useEffect, useState } from "react";
import { toast } from "react-toastify";

const VideoCallInterface = ({ call, socket, userId, userType, onEndCall }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [participantCount, setParticipantCount] = useState(1);
  const [mediaInitialized, setMediaInitialized] = useState(false);

  console.log("🎥 [VideoCall] Component props:", {
    call,
    userId,
    userType,
    hasSocket: !!socket,
  });

  // Drag functionality state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [localVideoPosition, setLocalVideoPosition] = useState({
    x:
      typeof window !== "undefined"
        ? Math.max(0, window.innerWidth - 200 - 16)
        : 200, // Start from right side
    y: 16, // Start from top
  });

  // WebRTC Configuration
  const pcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ],
    iceCandidatePoolSize: 10,
  };

  // Drag event handlers
  const handleDragStart = (e) => {
    const isTouch = e.type === "touchstart";
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    setIsDragging(true);
    setDragOffset({
      x: clientX - localVideoPosition.x,
      y: clientY - localVideoPosition.y,
    });

    if (e.preventDefault) {
      e.preventDefault();
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Add global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e) => {
        const clientX = e.clientX;
        const clientY = e.clientY;

        const newX = clientX - dragOffset.x;
        const newY = clientY - dragOffset.y;

        // Boundary constraints
        const videoWidth = 192; // w-48 = 192px
        const videoHeight = 144; // h-36 = 144px
        const maxX = window.innerWidth - videoWidth;
        const maxY = window.innerHeight - videoHeight - 120; // Account for controls at bottom

        setLocalVideoPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      };

      const handleMouseUp = () => handleDragEnd();

      const handleTouchMove = (e) => {
        const clientX = e.touches[0].clientX;
        const clientY = e.touches[0].clientY;

        const newX = clientX - dragOffset.x;
        const newY = clientY - dragOffset.y;

        // Boundary constraints
        const videoWidth = 192; // w-48 = 192px
        const videoHeight = 144; // h-36 = 144px
        const maxX = window.innerWidth - videoWidth;
        const maxY = window.innerHeight - videoHeight - 120; // Account for controls at bottom

        setLocalVideoPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });

        e.preventDefault();
      };

      const handleTouchEnd = () => handleDragEnd();

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, dragOffset]);

  useEffect(() => {
    initializeWebRTC();
    const cleanupTimer = startTimer();

    // Socket event listeners
    socket.on("userJoinedCall", handleUserJoined);
    socket.on("userLeftCall", handleUserLeft);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("callEnded", handleCallEnded);
    socket.on("participantAudioToggle", handleParticipantAudioToggle);
    socket.on("participantVideoToggle", handleParticipantVideoToggle);
    socket.on("screenShareStarted", handleScreenShareStarted);
    socket.on("screenShareStopped", handleScreenShareStopped);

    // Set up a timeout to start offer creation if needed
    const offerTimeout = setTimeout(() => {
      if (
        userType === "seller" &&
        peerConnectionRef.current &&
        peerConnectionRef.current.connectionState === "new"
      ) {
        createOffer();
      }
    }, 3000);

    return () => {
      cleanup();
      if (cleanupTimer) cleanupTimer();
      clearTimeout(offerTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call.callId]);

  const initializeWebRTC = async () => {
    try {
      console.log("🚀 [VideoCall] Initializing WebRTC...");

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log("🎥 [VideoCall] Got media stream:", stream);
      console.log("🎥 [VideoCall] Audio tracks:", stream.getAudioTracks());
      console.log("🎥 [VideoCall] Video tracks:", stream.getVideoTracks());

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Set initial states based on track availability
      const audioTracks = stream.getAudioTracks();
      const videoTracks = stream.getVideoTracks();

      if (audioTracks.length > 0) {
        setIsAudioEnabled(audioTracks[0].enabled);
        console.log(
          "🎤 [VideoCall] Initial audio state:",
          audioTracks[0].enabled
        );
      }

      if (videoTracks.length > 0) {
        setIsVideoEnabled(videoTracks[0].enabled);
        console.log(
          "📹 [VideoCall] Initial video state:",
          videoTracks[0].enabled
        );
      }

      setMediaInitialized(true);
      console.log("✅ [VideoCall] Media initialization completed");

      // Create peer connection
      peerConnectionRef.current = new RTCPeerConnection(pcConfig);

      // Add local stream tracks
      stream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        const [remoteStream] = event.streams;

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            callId: call.callId,
            candidate: event.candidate,
            senderId: userId,
          });
        }
      };

      // Monitor connection state
      peerConnectionRef.current.onconnectionstatechange = () => {
        const state = peerConnectionRef.current.connectionState;
        setConnectionStatus(state);

        if (state === "connected") {
          toast.success("Connected to call");
        } else if (state === "disconnected" || state === "failed") {
          toast.error("Connection lost");
        }
      };

      // Monitor ICE connection state
      peerConnectionRef.current.oniceconnectionstatechange = () => {
        const iceState = peerConnectionRef.current.iceConnectionState;

        if (iceState === "failed" || iceState === "disconnected") {
          // Optionally attempt ICE restart
          peerConnectionRef.current.restartIce();
        }
      };

      // Monitor ICE gathering state
      peerConnectionRef.current.onicegatheringstatechange = () => {
        // ICE gathering state monitoring for debugging if needed
      };

      setConnectionStatus("ready");
    } catch (error) {
      console.error("Error initializing WebRTC:", error);
      toast.error("Failed to access camera/microphone");
    }
  };

  const startTimer = () => {
    const startTime = new Date();
    const timer = setInterval(() => {
      const elapsed = Math.floor((new Date() - startTime) / 1000);
      setCallDuration(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  };

  const handleUserJoined = (data) => {
    setParticipantCount(data.participantCount);
    toast.info(`${data.userType} joined the call`);

    // Create offer when both participants are present
    // Seller should create offer when customer joins
    if (userType === "seller" && data.userType === "customer") {
      setTimeout(() => createOffer(), 1000); // Small delay to ensure both sides are ready
    }
  };

  const handleUserLeft = (data) => {
    setParticipantCount(data.participantCount);
    toast.info("Participant left the call");
  };

  const createOffer = async () => {
    try {
      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await peerConnectionRef.current.setLocalDescription(offer);

      // Send offer to the other participant
      const targetUserId =
        userType === "seller"
          ? call.customer?._id || call.customerId
          : call.seller?._id || call.sellerId;

      socket.emit("offer", {
        callId: call.callId,
        offer,
        senderId: userId,
        receiverId: targetUserId,
      });
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const handleOffer = async (data) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      );

      const answer = await peerConnectionRef.current.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await peerConnectionRef.current.setLocalDescription(answer);

      socket.emit("answer", {
        callId: call.callId,
        answer,
        senderId: userId,
        receiverId: data.senderId,
      });
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  const handleAnswer = async (data) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };

  const handleIceCandidate = async (data) => {
    try {
      // Only add ICE candidate if we have a remote description
      if (peerConnectionRef.current.remoteDescription) {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      }
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  };

  const handleCallEnded = () => {
    cleanup();
    onEndCall();
  };

  const handleParticipantAudioToggle = (data) => {
    toast.info(
      `Participant ${data.isAudioEnabled ? "enabled" : "disabled"} audio`
    );
  };

  const handleParticipantVideoToggle = (data) => {
    toast.info(
      `Participant ${data.isVideoEnabled ? "enabled" : "disabled"} video`
    );
  };

  const handleScreenShareStarted = (data) => {
    toast.info("Participant started screen sharing");
  };

  const handleScreenShareStopped = (data) => {
    toast.info("Participant stopped screen sharing");
  };

  const toggleAudio = () => {
    console.log("🎤 [VideoCall] Toggle audio clicked");
    console.log(
      "🎤 [VideoCall] localStreamRef.current:",
      localStreamRef.current
    );

    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      console.log("🎤 [VideoCall] Audio track:", audioTrack);

      if (audioTrack) {
        const newAudioState = !audioTrack.enabled;
        audioTrack.enabled = newAudioState;
        setIsAudioEnabled(newAudioState);

        console.log("🎤 [VideoCall] Audio toggled to:", newAudioState);

        if (socket) {
          socket.emit("toggleAudio", {
            callId: call.callId,
            userId,
            isAudioEnabled: newAudioState,
          });
        }
      } else {
        console.error("🎤 [VideoCall] No audio track found");
        toast.error("Audio track not available");
      }
    } else {
      console.error("🎤 [VideoCall] No local stream available");
      toast.error("Media stream not available");
    }
  };

  const toggleVideo = () => {
    console.log("📹 [VideoCall] Toggle video clicked");
    console.log(
      "📹 [VideoCall] localStreamRef.current:",
      localStreamRef.current
    );

    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      console.log("📹 [VideoCall] Video track:", videoTrack);

      if (videoTrack) {
        const newVideoState = !videoTrack.enabled;
        videoTrack.enabled = newVideoState;
        setIsVideoEnabled(newVideoState);

        console.log("📹 [VideoCall] Video toggled to:", newVideoState);

        if (socket) {
          socket.emit("toggleVideo", {
            callId: call.callId,
            userId,
            isVideoEnabled: newVideoState,
          });
        }
      } else {
        console.error("📹 [VideoCall] No video track found");
        toast.error("Video track not available");
      }
    } else {
      console.error("📹 [VideoCall] No local stream available");
      toast.error("Media stream not available");
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        // Replace video track with screen share
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");

        if (sender) {
          await sender.replaceTrack(videoTrack);
        }

        setIsScreenSharing(true);
        socket.emit("startScreenShare", {
          callId: call.callId,
          userId,
        });

        // Handle screen share end
        videoTrack.onended = () => {
          stopScreenShare();
        };
      } else {
        stopScreenShare();
      }
    } catch (error) {
      console.error("Error toggling screen share:", error);
      toast.error("Failed to start screen sharing");
    }
  };

  const stopScreenShare = async () => {
    try {
      // Get camera stream back
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      const videoTrack = cameraStream.getVideoTracks()[0];

      const sender = peerConnectionRef.current
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");

      if (sender) {
        await sender.replaceTrack(videoTrack);
      }

      // Update local video
      localStreamRef.current.getVideoTracks().forEach((track) => track.stop());
      localStreamRef.current.removeTrack(
        localStreamRef.current.getVideoTracks()[0]
      );
      localStreamRef.current.addTrack(videoTrack);

      setIsScreenSharing(false);
      socket.emit("stopScreenShare", {
        callId: call.callId,
        userId,
      });
    } catch (error) {
      console.error("Error stopping screen share:", error);
    }
  };

  const cleanup = () => {
    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Remove socket listeners
    socket.off("userJoinedCall");
    socket.off("userLeftCall");
    socket.off("offer");
    socket.off("answer");
    socket.off("ice-candidate");
    socket.off("callEnded");
    socket.off("participantAudioToggle");
    socket.off("participantVideoToggle");
    socket.off("screenShareStarted");
    socket.off("screenShareStopped");
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Video Call</h3>
          <span className="text-sm text-gray-300">
            {formatDuration(callDuration)}
          </span>
          <span
            className={`px-2 py-1 rounded text-xs ${
              connectionStatus === "connected"
                ? "bg-green-600"
                : connectionStatus === "connecting"
                ? "bg-yellow-600"
                : "bg-red-600"
            }`}
          >
            {connectionStatus}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300">
            {participantCount} participant{participantCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative">
        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          muted={false}
          controls={false}
          className="w-full h-full object-cover"
        />

        {/* Show placeholder when no remote video */}
        {connectionStatus !== "connected" && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <div className="text-center text-white">
              <i className="fas fa-user-circle text-8xl mb-4 opacity-50"></i>
              <p className="text-lg">
                {connectionStatus === "connecting"
                  ? "Connecting..."
                  : "Waiting for participant"}
              </p>
            </div>
          </div>
        )}

        {/* Local Video (Picture-in-Picture) - Draggable */}
        <div
          className={`absolute w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white ${
            isDragging ? "cursor-grabbing shadow-2xl" : "cursor-grab"
          }`}
          style={{
            left: `${localVideoPosition.x}px`,
            top: `${localVideoPosition.y}px`,
            zIndex: 20,
            userSelect: "none",
            touchAction: "none",
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover pointer-events-none"
          />
        </div>

        {/* Call Info Overlay */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
          <p className="text-sm">
            {userType === "seller" ? "Customer" : "Seller"}:{" "}
            {userType === "seller"
              ? call.customer?.name || call.customerName || "Unknown"
              : call.seller?.name || call.sellerName || "Unknown"}
          </p>
          {call.orderId?.orderNumber && (
            <p className="text-xs text-gray-300">
              Order: {call.orderId.orderNumber}
            </p>
          )}
          {call.orderNumber && (
            <p className="text-xs text-gray-300">Order: {call.orderNumber}</p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 p-6 z-10">
        <div className="flex justify-center items-center space-x-6 max-w-md mx-auto">
          {/* Audio Toggle */}
          <div className="flex flex-col items-center">
            <button
              onClick={toggleAudio}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors text-white ${
                isAudioEnabled
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-red-600 hover:bg-red-700"
              }`}
              title={isAudioEnabled ? "Mute" : "Unmute"}
            >
              <i
                className={`fas ${
                  isAudioEnabled ? "fa-microphone" : "fa-microphone-slash"
                } text-xl`}
              ></i>
            </button>
            <span className="text-xs text-white mt-2 font-medium">Mute</span>
          </div>

          {/* Video Toggle */}
          <div className="flex flex-col items-center">
            <button
              onClick={toggleVideo}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors text-white ${
                isVideoEnabled
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-red-600 hover:bg-red-700"
              }`}
              title={isVideoEnabled ? "Turn off video" : "Turn on video"}
            >
              <i
                className={`fas ${
                  isVideoEnabled ? "fa-video" : "fa-video-slash"
                } text-xl`}
              ></i>
            </button>
            <span className="text-xs text-white mt-2 font-medium">
              Video Off
            </span>
          </div>

          {/* Screen Share */}
          <div className="flex flex-col items-center">
            <button
              onClick={toggleScreenShare}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors text-white ${
                isScreenSharing
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
              title={isScreenSharing ? "Stop sharing" : "Share screen"}
            >
              <i className="fas fa-desktop text-xl"></i>
            </button>
            <span className="text-xs text-white mt-2 font-medium">Share</span>
          </div>

          {/* End Call */}
          <div className="flex flex-col items-center">
            <button
              onClick={onEndCall}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors text-white"
              title="End call"
            >
              <i className="fas fa-phone-slash text-xl"></i>
            </button>
            <span className="text-xs text-white mt-2 font-medium">
              End Call
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallInterface;
