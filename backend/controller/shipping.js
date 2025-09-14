const express = require("express");
const { isAuthenticated, isSeller } = require("../middleware/auth");
const ShippingConfig = require("../model/shippingConfig");
const DynamicShippingService = require("../utils/DynamicShippingService");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");

const router = express.Router();
const shippingService = new DynamicShippingService();

// Get shipping configuration for a shop
router.get(
  "/config/:shopId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId } = req.params;
      
      const config = await ShippingConfig.findOne({ shopId }).populate('shopId', 'name address');
      
      if (!config) {
        return next(new ErrorHandler("Shipping configuration not found", 404));
      }

      res.status(200).json({
        success: true,
        config
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Create or update shipping configuration (Seller only)
router.post(
  "/config",
  isAuthenticated,
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId } = req.body;
      
      // Verify the seller owns this shop
      if (req.seller.id !== shopId) {
        return next(new ErrorHandler("Not authorized to modify this shop's shipping config", 403));
      }

      const existingConfig = await ShippingConfig.findOne({ shopId });
      
      if (existingConfig) {
        // Update existing configuration
        Object.assign(existingConfig, req.body);
        await existingConfig.save();
        
        res.status(200).json({
          success: true,
          message: "Shipping configuration updated successfully",
          config: existingConfig
        });
      } else {
        // Create new configuration
        const newConfig = await ShippingConfig.create(req.body);
        
        res.status(201).json({
          success: true,
          message: "Shipping configuration created successfully",
          config: newConfig
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Calculate shipping cost for an order
router.post(
  "/calculate",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        shopId,
        userId,
        userLocation,
        orderValue,
        totalWeight,
        isExpress,
        orderId
      } = req.body;

      // Validate required fields
      if (!shopId || !userLocation || !orderValue) {
        return next(new ErrorHandler("Missing required fields: shopId, userLocation, orderValue", 400));
      }

      // Validate user location
      if (!userLocation.latitude || !userLocation.longitude || !userLocation.pincode) {
        return next(new ErrorHandler("Complete user location (latitude, longitude, pincode) is required", 400));
      }

      const result = await shippingService.calculateShippingCost({
        shopId,
        userId,
        userLocation,
        orderValue,
        totalWeight,
        isExpress,
        orderId
      });

      if (!result.success) {
        return next(new ErrorHandler(result.error, 400));
      }

      res.status(200).json({
        success: true,
        ...result.data
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get shipping estimates for multiple suppliers
router.post(
  "/estimates",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        shopIds,
        userLocation,
        orderValue,
        totalWeight,
        isExpress
      } = req.body;

      if (!shopIds || !Array.isArray(shopIds) || shopIds.length === 0) {
        return next(new ErrorHandler("shopIds array is required", 400));
      }

      if (!userLocation || !orderValue) {
        return next(new ErrorHandler("userLocation and orderValue are required", 400));
      }

      const estimates = await shippingService.getMultiSupplierEstimates({
        shopIds,
        userLocation,
        orderValue,
        totalWeight,
        isExpress
      });

      res.status(200).json({
        success: true,
        estimates
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get shipping calculation history for a user
router.get(
  "/history/:userId",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      // Verify user access
      if (req.user.id !== userId) {
        return next(new ErrorHandler("Not authorized to view this history", 403));
      }

      const history = await ShippingCalculation.find({ userId })
        .populate('shopId', 'name address')
        .sort({ calculatedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await ShippingCalculation.countDocuments({ userId });

      res.status(200).json({
        success: true,
        history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update service areas for a shop (Seller only)
router.put(
  "/service-areas/:shopId",
  isAuthenticated,
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId } = req.params;
      const { serviceAreas } = req.body;

      // Verify the seller owns this shop
      if (req.seller.id !== shopId) {
        return next(new ErrorHandler("Not authorized to modify this shop's service areas", 403));
      }

      const config = await ShippingConfig.findOne({ shopId });
      if (!config) {
        return next(new ErrorHandler("Shipping configuration not found", 404));
      }

      config.serviceAreas = serviceAreas;
      await config.save();

      res.status(200).json({
        success: true,
        message: "Service areas updated successfully",
        serviceAreas: config.serviceAreas
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get delivery estimate without calculating cost
router.post(
  "/estimate-time",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId, userLocation } = req.body;

      const config = await ShippingConfig.findOne({ shopId });
      if (!config) {
        return next(new ErrorHandler("Shipping configuration not found", 404));
      }

      // Just calculate delivery time, not cost
      const distanceData = await shippingService.calculateDistance(
        config.location,
        userLocation
      );

      res.status(200).json({
        success: true,
        estimatedDeliveryTime: distanceData.durationInTraffic || distanceData.duration,
        distance: distanceData.distance
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
