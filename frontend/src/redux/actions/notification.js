import axios from "axios";
import { server } from "../../server";

// Get all notifications
export const getAllNotifications = (page = 1, limit = 20) => async (dispatch) => {
  try {
    dispatch({
      type: "getAllNotificationsRequest",
    });

    const { data } = await axios.get(
      `${server}/notification/admin-notifications?page=${page}&limit=${limit}`,
      { withCredentials: true }
    );

    dispatch({
      type: "getAllNotificationsSuccess",
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: "getAllNotificationsFailed",
      payload: error.response?.data?.message || "Failed to fetch notifications",
    });
  }
};

// Get unread count
export const getUnreadCount = () => async (dispatch) => {
  try {
    const { data } = await axios.get(
      `${server}/notification/unread-count`,
      { withCredentials: true }
    );

    dispatch({
      type: "getUnreadCountSuccess",
      payload: data.unreadCount,
    });
  } catch (error) {
    dispatch({
      type: "getUnreadCountFailed",
      payload: error.response?.data?.message || "Failed to fetch unread count",
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = (notificationId) => async (dispatch) => {
  try {
    const { data } = await axios.put(
      `${server}/notification/mark-read/${notificationId}`,
      {},
      { withCredentials: true }
    );

    dispatch({
      type: "markNotificationAsReadSuccess",
      payload: { notificationId, notification: data.notification },
    });
  } catch (error) {
    dispatch({
      type: "markNotificationAsReadFailed",
      payload: error.response?.data?.message || "Failed to mark as read",
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = () => async (dispatch) => {
  try {
    await axios.put(
      `${server}/notification/mark-all-read`,
      {},
      { withCredentials: true }
    );

    dispatch({
      type: "markAllNotificationsAsReadSuccess",
    });
  } catch (error) {
    dispatch({
      type: "markAllNotificationsAsReadFailed",
      payload: error.response?.data?.message || "Failed to mark all as read",
    });
  }
};

// Delete notification
export const deleteNotification = (notificationId) => async (dispatch) => {
  try {
    await axios.delete(
      `${server}/notification/delete/${notificationId}`,
      { withCredentials: true }
    );

    dispatch({
      type: "deleteNotificationSuccess",
      payload: notificationId,
    });
  } catch (error) {
    dispatch({
      type: "deleteNotificationFailed",
      payload: error.response?.data?.message || "Failed to delete notification",
    });
  }
};

// Delete all notifications
export const deleteAllNotifications = () => async (dispatch) => {
  try {
    await axios.delete(
      `${server}/notification/delete-all`,
      { withCredentials: true }
    );

    dispatch({
      type: "deleteAllNotificationsSuccess",
    });
  } catch (error) {
    dispatch({
      type: "deleteAllNotificationsFailed",
      payload: error.response?.data?.message || "Failed to delete all notifications",
    });
  }
};

// Create notification (admin only)
export const createNotification = (notificationData) => async (dispatch) => {
  try {
    dispatch({
      type: "createNotificationRequest",
    });

    const { data } = await axios.post(
      `${server}/notification/create`,
      notificationData,
      { withCredentials: true }
    );

    dispatch({
      type: "createNotificationSuccess",
      payload: data.notification,
    });
  } catch (error) {
    dispatch({
      type: "createNotificationFailed",
      payload: error.response?.data?.message || "Failed to create notification",
    });
  }
};

// Clear errors
export const clearNotificationErrors = () => async (dispatch) => {
  dispatch({
    type: "clearNotificationErrors",
  });
};