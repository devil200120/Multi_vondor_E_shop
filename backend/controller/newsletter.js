const express = require("express");
const Newsletter = require("../model/newsletter");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendMail = require("../utils/sendMail");

const router = express.Router();

// Subscribe to newsletter
router.post(
  "/subscribe",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        return next(new ErrorHandler("Please provide an email address", 400));
      }

      // Check if email already exists
      const existingSubscription = await Newsletter.findOne({ email });

      if (existingSubscription) {
        if (existingSubscription.isActive) {
          return next(new ErrorHandler("Email is already subscribed to our newsletter", 400));
        } else {
          // Reactivate subscription
          existingSubscription.isActive = true;
          existingSubscription.subscribedAt = Date.now();
          existingSubscription.unsubscribedAt = undefined;
          await existingSubscription.save();

          return res.status(200).json({
            success: true,
            message: "Successfully resubscribed to our newsletter!",
          });
        }
      }

      // Create new subscription
      const newsletter = await Newsletter.create({
        email,
      });

      // Send welcome email
      try {
        await sendMail({
          email: email,
          subject: "Welcome to Multi Vendor E-Shop Newsletter!",
          message: `Dear Subscriber,

Thank you for subscribing to our newsletter! 🎉

You'll now receive:
• Exclusive deals and discounts
• Early access to sales
• New product announcements
• Special offers just for subscribers

We're excited to have you as part of our community!

Best regards,
The Multi Vendor E-Shop Team

If you wish to unsubscribe, please contact our support team.`,
        });
      } catch (emailError) {
        console.log("Welcome email failed to send:", emailError.message);
        // Don't fail the subscription if email fails
      }

      res.status(201).json({
        success: true,
        message: "Successfully subscribed to our newsletter!",
        data: {
          email: newsletter.email,
          subscribedAt: newsletter.subscribedAt,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Unsubscribe from newsletter
router.post(
  "/unsubscribe",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        return next(new ErrorHandler("Please provide an email address", 400));
      }

      const subscription = await Newsletter.findOne({ email });

      if (!subscription) {
        return next(new ErrorHandler("Email not found in our newsletter list", 404));
      }

      if (!subscription.isActive) {
        return next(new ErrorHandler("Email is already unsubscribed", 400));
      }

      // Deactivate subscription
      subscription.isActive = false;
      subscription.unsubscribedAt = Date.now();
      await subscription.save();

      res.status(200).json({
        success: true,
        message: "Successfully unsubscribed from our newsletter",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get all active subscriptions (Admin only)
router.get(
  "/subscribers",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const subscribers = await Newsletter.find({ isActive: true }).sort({
        subscribedAt: -1,
      });

      res.status(200).json({
        success: true,
        count: subscribers.length,
        subscribers,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get newsletter statistics (Admin only)
router.get(
  "/stats",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const totalSubscribers = await Newsletter.countDocuments({ isActive: true });
      const totalUnsubscribed = await Newsletter.countDocuments({ isActive: false });
      const totalEmails = await Newsletter.countDocuments();

      // Get recent subscriptions (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentSubscriptions = await Newsletter.countDocuments({
        isActive: true,
        subscribedAt: { $gte: thirtyDaysAgo },
      });

      res.status(200).json({
        success: true,
        stats: {
          totalSubscribers,
          totalUnsubscribed,
          totalEmails,
          recentSubscriptions,
          subscriptionRate: totalEmails > 0 ? (totalSubscribers / totalEmails * 100).toFixed(2) : 0,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;