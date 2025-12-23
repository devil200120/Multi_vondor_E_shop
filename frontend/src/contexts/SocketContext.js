import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const { user } = useSelector((state) => state.user);
  const { seller } = useSelector((state) => state.seller);

  useEffect(() => {
    // Store user/seller IDs to track changes
    const userId = user?._id;
    const sellerId = seller?._id;
    const currentUserId = sellerId || userId;
    
    // Only create socket connection if user or seller is authenticated
    if (currentUserId) {
      console.log('🔌 [Socket] Creating global socket connection for:', currentUserId);
      
      // Create socket connection
      const newSocket = io(
        process.env.REACT_APP_SOCKET_URL || "http://localhost:8000",
        {
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        }
      );

      setSocket(newSocket);

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('✅ [Socket] Connected with ID:', newSocket.id);
        setIsConnected(true);
        
        // Add user to online users
        newSocket.emit('addUser', currentUserId);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ [Socket] Disconnected');
        setIsConnected(false);
      });

      newSocket.on('getUsers', (users) => {
        console.log('👥 [Socket] Online users updated:', users.length);
        setOnlineUsers(users);
      });

      newSocket.on('userOnlineStatusChanged', (data) => {
        console.log('🟢 [Socket] User status changed:', data);
        // Handle user online/offline status changes
      });

      // Error handling
      newSocket.on('connect_error', (error) => {
        console.error('🔴 [Socket] Connection error:', error);
        setIsConnected(false);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('🔄 [Socket] Reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
        // Re-add user after reconnection
        newSocket.emit('addUser', currentUserId);
      });

      // Cleanup function
      return () => {
        console.log('🧹 [Socket] Cleaning up socket connection');
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
      };
    } else {
      // Clean up socket if no user is authenticated
      if (socket) {
        console.log('🧹 [Socket] No authenticated user, disconnecting socket');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, seller?._id]); // Only depend on user/seller IDs

  const value = {
    socket,
    onlineUsers,
    isConnected,
    currentUser: seller || user,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;