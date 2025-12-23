const express = require("express");
const { isSeller, isAuthenticated } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const router = express.Router();

// Simple shipping configuration model (we'll store in existing models)
const Shop = require("../model/shop");

// Get simple shipping configuration for a shop (public access for customers)
router.get(
  "/simple-config/:shopId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId } = req.params;
      console.log("🔍 Getting shipping config for shop:", shopId);
      
      // Handle special case for admin-only products (not tagged to any supplier)
      if (shopId === "admin" || shopId === "Platform Admin") {
        console.log("🏛️ Admin-only product, using platform default shipping");
        const config = {
          baseShippingRate: 30,
          freeShippingThreshold: 999,
          isShippingEnabled: true
        };
        
        return res.status(200).json({
          success: true,
          config
        });
      }
      
      const shop = await Shop.findById(shopId);
      if (!shop) {
        console.log("❌ Shop not found:", shopId);
        return next(new ErrorHandler("Shop not found", 404));
      }

      console.log("🏪 Found shop:", shop.name);
      console.log("📦 Shop shipping config:", shop.simpleShippingConfig);

      // Return the shop's shipping config or prompt them to set it up
      let config = shop.simpleShippingConfig;
      
      // If shop doesn't have shipping config, use reasonable defaults but encourage setup
      if (!config || (!config.baseShippingRate && config.baseShippingRate !== 0)) {
        console.log("⚠️ Shop hasn't configured shipping rates yet, using temporary defaults");
        config = {
          baseShippingRate: 50, // Temporary default - shop should configure this
          freeShippingThreshold: 999, // Temporary default
          isShippingEnabled: true,
          needsConfiguration: true // Flag to indicate shop needs to set up shipping
        };
      } else {
        console.log("✅ Using shop's configured shipping rates:", config);
      }

      res.status(200).json({
        success: true,
        config
      });
    } catch (error) {
      console.log("❌ Error getting shipping config:", error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Save simple shipping configuration
router.post(
  "/simple-config",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId, baseShippingRate, freeShippingThreshold, isShippingEnabled } = req.body;

      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      // Update the shop with simple shipping configuration
      shop.simpleShippingConfig = {
        baseShippingRate: baseShippingRate !== undefined ? baseShippingRate : 50,
        freeShippingThreshold: freeShippingThreshold !== undefined ? freeShippingThreshold : 999,
        isShippingEnabled: isShippingEnabled !== false,
        updatedAt: new Date()
      };

      await shop.save();

      res.status(200).json({
        success: true,
        message: "Shipping configuration saved successfully",
        config: shop.simpleShippingConfig
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Calculate simple shipping cost for an order
router.post(
  "/calculate-simple",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId, orderTotal } = req.body;

      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      const config = shop.simpleShippingConfig || {
        baseShippingRate: 50,
        freeShippingThreshold: 999,
        isShippingEnabled: true
      };

      let shippingCost = 0;
      let isFreeShipping = false;

      if (!config.isShippingEnabled) {
        return res.status(200).json({
          success: true,
          shippingCost: 0,
          isFreeShipping: false,
          message: "Contact seller for delivery arrangements"
        });
      }

      if (orderTotal >= config.freeShippingThreshold) {
        shippingCost = 0;
        isFreeShipping = true;
      } else {
        shippingCost = config.baseShippingRate;
      }

      res.status(200).json({
        success: true,
        shippingCost,
        isFreeShipping,
        message: isFreeShipping ? "Free shipping applied!" : `Shipping charge: ₹${shippingCost}`
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
