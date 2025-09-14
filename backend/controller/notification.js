const express = require("express");
const router = express.Router();
const Notification = require("../model/notification");
const { isAuthenticated, isAdmin, isSeller } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");

// Get all notifications for a user (with pagination)
router.get(
  "/get-notifications",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const notifications = await Notification.find({
        recipient: req.user.id,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("recipient", "name email");

      const unreadCount = await Notification.getUnreadCount(req.user.id);
      const totalCount = await Notification.countDocuments({
        recipient: req.user.id,
      });

      res.status(200).json({
        success: true,
        notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasMore: skip + notifications.length < totalCount,
        },
        unreadCount,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get admin notifications specifically
router.get(
  "/admin-notifications",
  isAuthenticated,
  isAdmin,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Get notifications for admin user or general admin notifications
      const notifications = await Notification.find({
        $or: [
          { recipient: req.user.id },
          { recipientType: "admin", recipient: { $exists: false } },
        ],
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const unreadCount = await Notification.countDocuments({
        $or: [
          { recipient: req.user.id, isRead: false },
          { recipientType: "admin", recipient: { $exists: false }, isRead: false },
        ],
      });

      const totalCount = await Notification.countDocuments({
        $or: [
          { recipient: req.user.id },
          { recipientType: "admin", recipient: { $exists: false } },
        ],
      });

      res.status(200).json({
        success: true,
        notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasMore: skip + notifications.length < totalCount,
        },
        unreadCount,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Mark notification as read
router.put(
  "/mark-read/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const notification = await Notification.findOne({
        _id: req.params.id,
        recipient: req.user.id,
      });

      if (!notification) {
        return next(new ErrorHandler("Notification not found", 404));
      }

      await notification.markAsRead();

      res.status(200).json({
        success: true,
        message: "Notification marked as read",
        notification,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Mark all notifications as read
router.put(
  "/mark-all-read",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      await Notification.markAllAsRead(req.user.id);

      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Delete notification
router.delete(
  "/delete/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        recipient: req.user.id,
      });

      if (!notification) {
        return next(new ErrorHandler("Notification not found", 404));
      }

      res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Delete all notifications
router.delete(
  "/delete-all",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      await Notification.deleteMany({ recipient: req.user.id });

      res.status(200).json({
        success: true,
        message: "All notifications deleted successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Create notification (for admin to send notifications)
router.post(
  "/create",
  isAuthenticated,
  isAdmin,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { recipientId, recipientType, type, title, message, data, actionUrl } = req.body;

      const notification = await Notification.createNotification({
        recipient: recipientId,
        recipientType,
        type,
        title,
        message,
        data,
        actionUrl,
      });

      res.status(201).json({
        success: true,
        message: "Notification created successfully",
        notification,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get unread count
router.get(
  "/unread-count",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const unreadCount = await Notification.getUnreadCount(req.user.id);

      res.status(200).json({
        success: true,
        unreadCount,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;