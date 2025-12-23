const socketIO = require("socket.io");
const http = require("http");
const express = require("express");
const cors = require("cors");
const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.io
const io = socketIO(server, {
  cors: {
    origin: [
      "http://localhost:3000", 
      "http://127.0.0.1:3000",
      "https://multi-vondor-e-shop-1.onrender.com",
      "https://multi-vondor-e-shop-2.onrender.com",
      "https://www.wanttar.in",
      "https://wanttar.in",
      "http://72.60.103.18:3000",
      "https://samrudhigroup.in"
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

require("dotenv").config({
  path: "./.env",
});

// Configure CORS for Express routes
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    "https://multi-vondor-e-shop-1.onrender.com",
    "https://multi-vondor-e-shop-2.onrender.com",
    "https://www.wanttar.in",
    "https://wanttar.in",
    "http://72.60.103.18:3000",
    "https://samrudhigroup.in"
  ],
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world from socket server!");
});

// Endpoint to get online users
app.get("/online-users", (req, res) => {
  res.json({
    success: true,
    users: users,
    count: users.length
  });
});

// Endpoint to get online users by type
app.get("/online-users/:userId", (req, res) => {
  const { userId } = req.params;
  const user = users.find(u => u.userId === userId);
  res.json({
    success: true,
    user: user || null,
    isOnline: !!user,
    allUsers: users.map(u => ({ userId: u.userId, socketId: u.socketId }))
  });
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (receiverId) => {
  return users.find((user) => user.userId === receiverId);
};

const getUserIdFromSocket = (socketId) => {
  const user = users.find((user) => user.socketId === socketId);
  return user ? user.userId : null;
};

// Define a message object with a seen property
const createMessage = ({ senderId, receiverId, text, images }) => ({
  senderId,
  receiverId,
  text,
  images,
  seen: false,
});

// Store order tracking data
let orderTracking = {};

// Store active video calls
let videoCalls = {};

io.on("connection", (socket) => {
  // when connect
  console.log(`User connected: ${socket.id}`);

  // take userId and socketId from user
  socket.on("addUser", (userId) => {
    console.log(`👤 [Socket] User connecting: ${userId} with socket: ${socket.id}`);
    addUser(userId, socket.id);
    io.emit("getUsers", users);
    console.log(`👥 [Socket] Total users online: ${users.length}`);
    console.log(`📋 [Socket] Current users:`, users.map(u => ({ userId: u.userId, socketId: u.socketId })));
    
    // Notify all sellers about user coming online
    io.emit("userOnlineStatusChanged", {
      userId,
      isOnline: true,
      timestamp: new Date()
    });
  });

  // send and get message
  const messages = {}; // Object to track messages sent to each user

  socket.on("sendMessage", ({ senderId, receiverId, text, images }) => {
    const message = createMessage({ senderId, receiverId, text, images });

    const user = getUser(receiverId);

    // Store the messages in the `messages` object
    if (!messages[receiverId]) {
      messages[receiverId] = [message];
    } else {
      messages[receiverId].push(message);
    }

    // send the message to the recevier
    io.to(user?.socketId).emit("getMessage", message);
  });

  socket.on("messageSeen", ({ senderId, receiverId, messageId }) => {
    const user = getUser(senderId);

    // update the seen flag for the message
    if (messages[senderId]) {
      const message = messages[senderId].find(
        (message) =>
          message.receiverId === receiverId && message.id === messageId
      );
      if (message) {
        message.seen = true;

        // send a message seen event to the sender
        io.to(user?.socketId).emit("messageSeen", {
          senderId,
          receiverId,
          messageId,
        });
      }
    }
  });

  // update and get last message
  socket.on("updateLastMessage", ({ lastMessage, lastMessagesId }) => {
    io.emit("getLastMessage", {
      lastMessage,
      lastMessagesId,
    });
  });

  // Real-time order tracking events
  socket.on("orderStatusChanged", ({ orderId, status, shopId, timestamp, type }) => {
    console.log(`Order ${orderId} status changed to: ${status}`);
    
    // Store tracking data
    orderTracking[orderId] = {
      status,
      shopId,
      timestamp,
      type: type || 'status'
    };

    // Broadcast to all users (customers and sellers)
    io.emit("orderStatusUpdate", {
      orderId,
      status,
      shopId,
      timestamp,
      type: type || 'status'
    });

    // Send specific update to customer if they're connected
    const customerUpdate = {
      orderId,
      status,
      message: `Your order status has been updated to: ${status}`,
      timestamp,
      type: 'customer_notification'
    };
    
    io.emit("customerOrderUpdate", customerUpdate);
  });

  // Join order tracking room
  socket.on("joinOrderTracking", ({ orderId, userId, userType }) => {
    socket.join(`order_${orderId}`);
    console.log(`${userType} ${userId} joined tracking for order ${orderId}`);
    
    // Send current tracking data if available
    if (orderTracking[orderId]) {
      socket.emit("orderStatusUpdate", orderTracking[orderId]);
    }
  });

  // Leave order tracking room
  socket.on("leaveOrderTracking", ({ orderId, userId }) => {
    socket.leave(`order_${orderId}`);
    console.log(`User ${userId} left tracking for order ${orderId}`);
  });

  // Delivery partner location updates
  socket.on("deliveryLocationUpdate", ({ orderId, location, estimatedTime }) => {
    const updateData = {
      orderId,
      location,
      estimatedTime,
      timestamp: new Date(),
      message: `Delivery partner is ${estimatedTime} minutes away`
    };

    // Broadcast to order tracking room
    io.to(`order_${orderId}`).emit("deliveryUpdate", updateData);
    
    console.log(`Delivery location updated for order ${orderId}`);
  });

  // Order timeline events
  socket.on("addOrderEvent", ({ orderId, event, description, timestamp }) => {
    const eventData = {
      orderId,
      event,
      description,
      timestamp: timestamp || new Date()
    };

    // Broadcast timeline event
    io.to(`order_${orderId}`).emit("orderTimelineUpdate", eventData);
    
    console.log(`New event added to order ${orderId}: ${event}`);
  });

  // Live delivery tracking events
  socket.on("joinDeliveryTracking", ({ orderId, userType }) => {
    socket.join(`delivery_${orderId}`);
    console.log(`${userType} joined delivery tracking for order ${orderId}`);
  });

  socket.on("leaveDeliveryTracking", ({ orderId }) => {
    socket.leave(`delivery_${orderId}`);
    console.log(`User left delivery tracking for order ${orderId}`);
  });

  // Broadcast delivery person location
  socket.on("deliveryLocationBroadcast", ({ orderId, location, speed, estimatedArrival }) => {
    const locationData = {
      orderId,
      location,
      speed,
      estimatedArrival,
      timestamp: new Date()
    };

    // Broadcast to all users tracking this delivery
    io.to(`delivery_${orderId}`).emit("deliveryLocationUpdate", locationData);
    io.to(`order_${orderId}`).emit("deliveryLocationUpdate", locationData);
    
    console.log(`Delivery location updated for order ${orderId}: ${JSON.stringify(location)}`);
  });

  // Delivery path tracking
  socket.on("deliveryPathUpdate", ({ orderId, location }) => {
    const pathData = {
      orderId,
      location,
      timestamp: new Date()
    };

    // Broadcast path update
    io.to(`delivery_${orderId}`).emit("deliveryPathUpdate", pathData);
    
    console.log(`Delivery path updated for order ${orderId}`);
  });

  // Video Call Events
  
  // Handle incoming video call notification
  socket.on("incomingVideoCall", (callData) => {
    console.log('📞 [Socket] Incoming call notification received:', callData.callId);
    console.log('📞 [Socket] Call data:', JSON.stringify(callData, null, 2));
    console.log('📞 [Socket] Socket ID:', socket.id);
    console.log('📞 [Socket] Current users online:', users.map(u => ({ userId: u.userId, socketId: u.socketId })));
    
    // Determine the target recipient
    let targetUserId;
    
    // For customer-initiated calls
    if (callData.customerId && callData.sellerId) {
      const senderId = getUserIdFromSocket(socket.id);
      console.log('📞 [Socket] Sender ID from socket:', senderId);
      
      if (senderId && senderId.toString() === callData.customerId.toString()) {
        // Customer is calling seller
        targetUserId = callData.sellerId;
        console.log('📞 [Socket] Customer calling seller, target:', targetUserId);
      } else if (senderId && senderId.toString() === callData.sellerId.toString()) {
        // Seller is calling customer  
        targetUserId = callData.customerId;
        console.log('📞 [Socket] Seller calling customer, target:', targetUserId);
      } else {
        // Fallback: try to determine from call data
        console.log('📞 [Socket] Could not match sender, using fallback logic');
        if (callData.customerId && !callData.orderNumber) {
          // Likely customer-initiated call
          targetUserId = callData.sellerId;
        } else {
          // Likely seller-initiated call
          targetUserId = callData.customerId;
        }
        console.log('📞 [Socket] Fallback target:', targetUserId);
      }
    }
    
    // Find the target user's socket
    if (targetUserId) {
      const targetUser = getUser(targetUserId);
      console.log('📞 [Socket] Looking for target user:', targetUserId);
      console.log('📞 [Socket] Found target user:', targetUser);
      
      if (targetUser && targetUser.socketId) {
        console.log('📞 [Socket] Sending call to target user socket:', targetUser.socketId);
        io.to(targetUser.socketId).emit('incomingVideoCall', callData);
        console.log('✅ [Socket] Call sent successfully to target user:', targetUserId);
      } else {
        console.log('❌ [Socket] Target user not found or offline:', targetUserId);
        console.log('📞 [Socket] Available users:', users.map(u => u.userId));
        
        // Emit back to sender that target is offline
        socket.emit('callTargetOffline', { 
          callId: callData.callId, 
          targetUserId: targetUserId,
          message: 'The seller is currently offline. Please try again later.'
        });
      }
    } else {
      console.log('❌ [Socket] Could not determine target user');
      console.log('📞 [Socket] Call data structure issue. CustomerId:', callData.customerId, 'SellerId:', callData.sellerId);
      
      // Emit error back to sender
      socket.emit('callError', {
        callId: callData.callId,
        message: 'Unable to determine call target'
      });
    }
  });

  socket.on("joinVideoCall", ({ callId, userId, userType }) => {
    socket.join(`call_${callId}`);
    console.log(`✅ [Socket] ${userType} ${userId} joined video call ${callId}`);
    
    // Add user to call tracking
    if (!videoCalls[callId]) {
      videoCalls[callId] = {
        participants: [],
        status: 'waiting',
        startTime: null
      };
    }
    
    // Check if user is already in the call to avoid duplicates
    const existingParticipant = videoCalls[callId].participants.find(p => p.userId === userId);
    if (!existingParticipant) {
      videoCalls[callId].participants.push({
        userId,
        socketId: socket.id,
        userType,
        joinTime: new Date()
      });
    }

    console.log(`📊 [Socket] Call ${callId} now has ${videoCalls[callId].participants.length} participants:`, 
      videoCalls[callId].participants.map(p => `${p.userType}:${p.userId}`));

    // Notify other participants in the call room
    socket.to(`call_${callId}`).emit("userJoinedCall", {
      callId,
      userId,
      userType,
      participantCount: videoCalls[callId].participants.length
    });

    // If we now have both participants, update call status
    if (videoCalls[callId].participants.length >= 2) {
      videoCalls[callId].status = 'active';
      if (!videoCalls[callId].startTime) {
        videoCalls[callId].startTime = new Date();
      }
      console.log(`🎉 [Socket] Call ${callId} is now active with both participants`);
    }
  });

  socket.on("leaveVideoCall", ({ callId, userId }) => {
    socket.leave(`call_${callId}`);
    console.log(`User ${userId} left video call ${callId}`);
    
    if (videoCalls[callId]) {
      videoCalls[callId].participants = videoCalls[callId].participants.filter(
        p => p.userId !== userId
      );
      
      // Notify other participants
      socket.to(`call_${callId}`).emit("userLeftCall", {
        callId,
        userId,
        participantCount: videoCalls[callId].participants.length
      });
      
      // End call if no participants left
      if (videoCalls[callId].participants.length === 0) {
        delete videoCalls[callId];
        io.to(`call_${callId}`).emit("callEnded", { callId });
      }
    }
  });

  // WebRTC Signaling
  socket.on("offer", ({ callId, offer, senderId, receiverId }) => {
    console.log(`📞 [Socket] Offer sent in call ${callId} from ${senderId} to ${receiverId}`);
    
    // Send to specific call room and also try to send directly to receiver
    socket.to(`call_${callId}`).emit("offer", {
      callId,
      offer,
      senderId,
      receiverId
    });
    
    // Also try to find the specific user and send directly
    const targetUser = getUser(receiverId);
    if (targetUser) {
      console.log(`📞 [Socket] Sending offer directly to user ${receiverId} at socket ${targetUser.socketId}`);
      io.to(targetUser.socketId).emit("offer", {
        callId,
        offer,
        senderId,
        receiverId
      });
    }
  });

  socket.on("answer", ({ callId, answer, senderId, receiverId }) => {
    console.log(`📨 [Socket] Answer sent in call ${callId} from ${senderId} to ${receiverId}`);
    
    // Send to specific call room and also try to send directly to receiver
    socket.to(`call_${callId}`).emit("answer", {
      callId,
      answer,
      senderId,
      receiverId
    });
    
    // Also try to find the specific user and send directly
    const targetUser = getUser(receiverId);
    if (targetUser) {
      console.log(`📨 [Socket] Sending answer directly to user ${receiverId} at socket ${targetUser.socketId}`);
      io.to(targetUser.socketId).emit("answer", {
        callId,
        answer,
        senderId,
        receiverId
      });
    }
  });

  socket.on("ice-candidate", ({ callId, candidate, senderId }) => {
    console.log(`🧊 [Socket] ICE candidate sent in call ${callId} from ${senderId}`);
    
    // Broadcast ICE candidate to all other participants in the call
    socket.to(`call_${callId}`).emit("ice-candidate", {
      callId,
      candidate,
      senderId
    });
  });

  // Call Status Updates
  socket.on("callStatusUpdate", ({ callId, status, userId, userType }) => {
    console.log(`Call ${callId} status updated to ${status} by ${userId} (${userType})`);
    
    if (videoCalls[callId]) {
      videoCalls[callId].status = status;
      if (status === 'active' && !videoCalls[callId].startTime) {
        videoCalls[callId].startTime = new Date();
      }
    }
    
    // Broadcast to all clients except the sender
    socket.broadcast.emit("callStatusUpdate", {
      callId,
      status,
      userId,
      userType,
      timestamp: new Date()
    });
    
    console.log(`Broadcasted call status update: ${status} to all other clients`);
  });

  socket.on("endVideoCall", ({ callId, userId, reason }) => {
    console.log(`Call ${callId} ended by ${userId}. Reason: ${reason}`);
    
    if (videoCalls[callId]) {
      const callData = {
        ...videoCalls[callId],
        endTime: new Date(),
        endedBy: userId,
        reason
      };
      
      // Notify all participants
      io.to(`call_${callId}`).emit("callEnded", {
        callId,
        endedBy: userId,
        reason,
        duration: callData.startTime ? 
          Math.floor((callData.endTime - callData.startTime) / 1000) : 0
      });
      
      // Clear call data
      delete videoCalls[callId];
    }
  });

  // Audio/Video Controls
  socket.on("toggleAudio", ({ callId, userId, isAudioEnabled }) => {
    socket.to(`call_${callId}`).emit("participantAudioToggle", {
      callId,
      userId,
      isAudioEnabled
    });
  });

  socket.on("toggleVideo", ({ callId, userId, isVideoEnabled }) => {
    socket.to(`call_${callId}`).emit("participantVideoToggle", {
      callId,
      userId,
      isVideoEnabled
    });
  });

  // Screen Sharing
  socket.on("startScreenShare", ({ callId, userId }) => {
    console.log(`Screen share started in call ${callId} by ${userId}`);
    socket.to(`call_${callId}`).emit("screenShareStarted", {
      callId,
      userId
    });
  });

  socket.on("stopScreenShare", ({ callId, userId }) => {
    console.log(`Screen share stopped in call ${callId} by ${userId}`);
    socket.to(`call_${callId}`).emit("screenShareStopped", {
      callId,
      userId
    });
  });

  // Call Quality Monitoring
  socket.on("callQualityReport", ({ callId, userId, quality }) => {
    console.log(`Call quality report for ${callId}: ${quality.score}`);
    // Could be used for analytics or alerting
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log(`👋 [Socket] User disconnected: socket ${socket.id}`);
    
    // Find the user who disconnected
    const disconnectedUser = users.find(user => user.socketId === socket.id);
    
    if (disconnectedUser) {
      console.log(`👋 [Socket] User ${disconnectedUser.userId} disconnected`);
    }
    
    removeUser(socket.id);
    console.log(`👥 [Socket] Total users online after disconnect: ${users.length}`);
    
    // Notify all sellers about user going offline
    if (disconnectedUser) {
      io.emit("userOnlineStatusChanged", {
        userId: disconnectedUser.userId,
        isOnline: false,
        timestamp: new Date()
      });
    }
    
    // Handle disconnection from active video calls
    Object.keys(videoCalls).forEach(callId => {
      const call = videoCalls[callId];
      const participantIndex = call.participants.findIndex(p => p.socketId === socket.id);
      
      if (participantIndex !== -1) {
        const participant = call.participants[participantIndex];
        call.participants.splice(participantIndex, 1);
        
        // Notify other participants
        socket.to(`call_${callId}`).emit("userLeftCall", {
          callId,
          userId: participant.userId,
          participantCount: call.participants.length,
          reason: "disconnected"
        });
        
        // End call if no participants left
        if (call.participants.length === 0) {
          delete videoCalls[callId];
          io.to(`call_${callId}`).emit("callEnded", { 
            callId, 
            reason: "all_participants_left" 
          });
        }
      }
    });
    
    io.emit("getUsers", users);
  });
});

server.listen(process.env.PORT || 4000, () => {
  console.log(`server is running on port ${process.env.PORT || 4000}`);
});
