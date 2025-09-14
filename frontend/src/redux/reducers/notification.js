import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  pagination: null,
};

export const notificationReducer = createReducer(initialState, {
  // Get all notifications
  getAllNotificationsRequest: (state) => {
    state.isLoading = true;
    state.error = null;
  },
  getAllNotificationsSuccess: (state, action) => {
    state.isLoading = false;
    state.notifications = action.payload.notifications;
    state.unreadCount = action.payload.unreadCount;
    state.pagination = action.payload.pagination;
    state.error = null;
  },
  getAllNotificationsFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // Get unread count
  getUnreadCountSuccess: (state, action) => {
    state.unreadCount = action.payload;
  },
  getUnreadCountFailed: (state, action) => {
    state.error = action.payload;
  },

  // Mark notification as read
  markNotificationAsReadSuccess: (state, action) => {
    const { notificationId } = action.payload;
    const notification = state.notifications.find(n => n._id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date().toISOString();
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    }
  },
  markNotificationAsReadFailed: (state, action) => {
    state.error = action.payload;
  },

  // Mark all notifications as read
  markAllNotificationsAsReadSuccess: (state) => {
    state.notifications.forEach(notification => {
      if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
      }
    });
    state.unreadCount = 0;
  },
  markAllNotificationsAsReadFailed: (state, action) => {
    state.error = action.payload;
  },

  // Delete notification
  deleteNotificationSuccess: (state, action) => {
    const notificationId = action.payload;
    const notification = state.notifications.find(n => n._id === notificationId);
    if (notification && !notification.isRead) {
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    }
    state.notifications = state.notifications.filter(n => n._id !== notificationId);
  },
  deleteNotificationFailed: (state, action) => {
    state.error = action.payload;
  },

  // Delete all notifications
  deleteAllNotificationsSuccess: (state) => {
    state.notifications = [];
    state.unreadCount = 0;
  },
  deleteAllNotificationsFailed: (state, action) => {
    state.error = action.payload;
  },

  // Create notification
  createNotificationRequest: (state) => {
    state.isLoading = true;
    state.error = null;
  },
  createNotificationSuccess: (state, action) => {
    state.isLoading = false;
    state.notifications.unshift(action.payload);
    if (!action.payload.isRead) {
      state.unreadCount += 1;
    }
  },
  createNotificationFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // Clear errors
  clearNotificationErrors: (state) => {
    state.error = null;
  },
});