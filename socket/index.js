const socketIO = require("socket.io");
const http = require("http");
const express = require("express");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

require("dotenv").config({
  path: "./.env",
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world from socket server!");
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

io.on("connection", (socket) => {
  // when connect
  console.log(`User connected: ${socket.id}`);

  // take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
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

  //when disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

server.listen(process.env.PORT || 4000, () => {
  console.log(`server is running on port ${process.env.PORT || 4000}`);
});
