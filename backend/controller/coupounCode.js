const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const { isSeller } = require("../middleware/auth");
const CoupounCode = require("../model/coupounCode");
const router = express.Router();

// create coupoun code
router.post(
  "/create-coupon-code",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const isCoupounCodeExists = await CoupounCode.find({
        name: req.body.name,
      });

      if (isCoupounCodeExists.length !== 0) {
        return next(new ErrorHandler("Coupoun code already exists!", 400));
      }

      const coupounCode = await CoupounCode.create(req.body);

      res.status(201).json({
        success: true,
        coupounCode,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get all coupons of a shop
router.get(
  "/get-coupon/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const couponCodes = await CoupounCode.find({ shopId: req.seller.id });
      res.status(201).json({
        success: true,
        couponCodes,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// delete coupoun code of a shop
router.delete(
  "/delete-coupon/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const couponCode = await CoupounCode.findByIdAndDelete(req.params.id);

      if (!couponCode) {
        return next(new ErrorHandler("Coupon code dosen't exists!", 400));
      }
      res.status(201).json({
        success: true,
        message: "Coupon code deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get coupon code value by its name
router.get(
  "/get-coupon-value/:name",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const couponCode = await CoupounCode.findOne({ name: req.params.name });

      res.status(200).json({
        success: true,
        couponCode,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get available coupons for users based on cart
router.post(
  "/get-available-coupons",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { cart } = req.body;
      
      if (!cart || cart.length === 0) {
        return res.status(200).json({
          success: true,
          availableCoupons: [],
        });
      }

      // Get all shop IDs from cart
      const shopIds = [...new Set(cart.map(item => item.shopId))];
      
      // Calculate total amount for each shop
      const shopTotals = {};
      cart.forEach(item => {
        if (!shopTotals[item.shopId]) {
          shopTotals[item.shopId] = 0;
        }
        shopTotals[item.shopId] += item.qty * item.discountPrice;
      });

      // Find all coupons for these shops
      const allCoupons = await CoupounCode.find({ 
        shopId: { $in: shopIds } 
      }).populate('shopId', 'name');

      // Filter coupons based on minimum amount requirement
      const availableCoupons = allCoupons.filter(coupon => {
        const shopTotal = shopTotals[coupon.shopId] || 0;
        return !coupon.minAmount || shopTotal >= coupon.minAmount;
      }).map(coupon => ({
        _id: coupon._id,
        name: coupon.name,
        value: coupon.value,
        minAmount: coupon.minAmount,
        maxAmount: coupon.maxAmount,
        shopId: coupon.shopId,
        shopName: coupon.shopId?.name || 'Unknown Shop',
        applicableAmount: shopTotals[coupon.shopId] || 0,
        discountAmount: Math.min(
          coupon.value,
          coupon.maxAmount || coupon.value,
          (shopTotals[coupon.shopId] || 0) * (coupon.value / 100)
        )
      }));

      // Sort by discount amount (highest first)
      availableCoupons.sort((a, b) => b.discountAmount - a.discountAmount);

      res.status(200).json({
        success: true,
        availableCoupons,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

module.exports = router;
