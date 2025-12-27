const express = require("express");
const router = express.Router();
const Commission = require("../model/commission");
const Shop = require("../model/shop");
const Order = require("../model/order");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");

// Create commission record after order payment
router.post(
  "/create-commission",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { orderId, shopId, totalAmount, paypalOrderId, paypalPayerId } = req.body;

      // Calculate commission split
      const commissionData = Commission.calculateCommission(totalAmount);

      const commission = await Commission.create({
        order: orderId,
        shop: shopId,
        totalAmount: commissionData.totalAmount,
        platformCommissionPercent: commissionData.platformCommissionPercent,
        platformCommissionAmount: commissionData.platformCommissionAmount,
        vendorAmount: commissionData.vendorAmount,
        paypalOrderId,
        paypalPayerId,
      });

      // Update shop's available balance (for revenue-share model)
      const shop = await Shop.findById(shopId);
      if (shop.subscriptionPlan === 'revenue-share') {
        shop.availableBalance += commissionData.vendorAmount;
        shop.revenueShare.currentMonthRevenue += commissionData.platformCommissionAmount;
        await shop.save();
      }

      res.status(201).json({
        success: true,
        commission,
        vendorAmount: commissionData.vendorAmount,
        platformCommission: commissionData.platformCommissionAmount,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get seller's commission history
router.get(
  "/seller/my-commissions",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const commissions = await Commission.find({ shop: req.seller._id })
        .populate('order', 'orderNumber createdAt totalPrice')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalCommissions = await Commission.countDocuments({ shop: req.seller._id });

      // Calculate totals
      const stats = await Commission.aggregate([
        { $match: { shop: req.seller._id } },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: '$vendorAmount' },
            totalPlatformCommission: { $sum: '$platformCommissionAmount' },
            totalSales: { $sum: '$totalAmount' },
            pendingPayouts: {
              $sum: {
                $cond: [{ $eq: ['$vendorPaymentStatus', 'pending'] }, '$vendorAmount', 0]
              }
            },
          },
        },
      ]);

      res.status(200).json({
        success: true,
        commissions,
        totalCommissions,
        totalPages: Math.ceil(totalCommissions / limit),
        currentPage: page,
        stats: stats[0] || {
          totalEarnings: 0,
          totalPlatformCommission: 0,
          totalSales: 0,
          pendingPayouts: 0,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get monthly revenue share status (for revenue-share sellers)
router.get(
  "/seller/revenue-share-status",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.seller._id);

      if (shop.subscriptionPlan !== 'revenue-share') {
        return next(new ErrorHandler('This endpoint is only for revenue-share sellers', 400));
      }

      // Get current month's commission
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const monthlyStats = await Commission.aggregate([
        {
          $match: {
            shop: req.seller._id,
            transactionDate: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            platformCommission: { $sum: '$platformCommissionAmount' },
            yourEarnings: { $sum: '$vendorAmount' },
          },
        },
      ]);

      const minimumPayment = shop.revenueShare.monthlyMinimum || 25;
      const currentCommission = shop.revenueShare.currentMonthRevenue || 0;
      const remainingToMinimum = Math.max(0, minimumPayment - currentCommission);

      res.status(200).json({
        success: true,
        monthlyStats: monthlyStats[0] || {
          totalRevenue: 0,
          platformCommission: 0,
          yourEarnings: 0,
        },
        minimumMonthlyPayment: minimumPayment,
        currentMonthCommission: currentCommission,
        isPaid: shop.revenueShare.isPaid,
        remainingToMinimum,
        dueDate: endOfMonth,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Handle refund/chargeback
router.post(
  "/handle-refund",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { orderId, refundAmount, refundType } = req.body;

      const commission = await Commission.findOne({ order: orderId });
      if (!commission) {
        return next(new ErrorHandler('Commission record not found', 404));
      }

      commission.refundStatus = refundType; // 'partial' or 'full'
      commission.refundAmount = refundAmount;
      commission.refundDate = new Date();
      await commission.save();

      // Deduct from shop's available balance
      const shop = await Shop.findById(commission.shop);
      const vendorRefundAmount = (refundAmount * 90) / 100; // Vendor's share of refund
      shop.availableBalance -= vendorRefundAmount;
      
      // If revenue-share, also deduct from monthly revenue
      if (shop.subscriptionPlan === 'revenue-share') {
        const platformRefund = (refundAmount * 10) / 100;
        shop.revenueShare.currentMonthRevenue -= platformRefund;
      }
      
      await shop.save();

      res.status(200).json({
        success: true,
        message: 'Refund processed successfully',
        commission,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Get all commissions
router.get(
  "/admin/all-commissions",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const commissions = await Commission.find()
        .populate('shop', 'name email subscriptionPlan')
        .populate('order', 'orderNumber createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalCommissions = await Commission.countDocuments();

      // Calculate platform revenue
      const platformStats = await Commission.aggregate([
        {
          $group: {
            _id: null,
            totalPlatformRevenue: { $sum: '$platformCommissionAmount' },
            totalVendorPayouts: { $sum: '$vendorAmount' },
            totalSales: { $sum: '$totalAmount' },
          },
        },
      ]);

      res.status(200).json({
        success: true,
        commissions,
        totalCommissions,
        totalPages: Math.ceil(totalCommissions / limit),
        currentPage: page,
        platformStats: platformStats[0] || {
          totalPlatformRevenue: 0,
          totalVendorPayouts: 0,
          totalSales: 0,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Mark vendor payment as paid
router.put(
  "/admin/mark-payment-paid/:commissionId",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { vendorPayoutId } = req.body;

      const commission = await Commission.findById(req.params.commissionId);
      if (!commission) {
        return next(new ErrorHandler('Commission record not found', 404));
      }

      commission.vendorPaymentStatus = 'paid';
      commission.vendorPaymentDate = new Date();
      commission.vendorPayoutId = vendorPayoutId;
      await commission.save();

      res.status(200).json({
        success: true,
        message: 'Payment marked as paid',
        commission,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
