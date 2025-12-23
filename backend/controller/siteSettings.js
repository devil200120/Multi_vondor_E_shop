const express = require("express");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const SiteSettings = require("../model/siteSettings");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const router = express.Router();

// Get current site settings (public route)
router.get(
  "/get-site-settings",
  catchAsyncErrors(async (req, res, next) => {
    try {
      let settings = await SiteSettings.findOne({ isActive: true });
      
      // If no settings exist, create default settings
      if (!settings) {
        settings = new SiteSettings({});
        await settings.save();
      }

      res.status(200).json({
        success: true,
        settings
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Get site settings for editing
router.get(
  "/admin/get-site-settings",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      let settings = await SiteSettings.findOne({ isActive: true })
        .populate('lastUpdatedBy', 'name email');
      
      if (!settings) {
        settings = new SiteSettings({});
        await settings.save();
      }

      res.status(200).json({
        success: true,
        settings
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Update site settings
router.put(
  "/admin/update-site-settings",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        footerAddress,
        companyInfo,
        socialMedia,
        businessHours
      } = req.body;

      let settings = await SiteSettings.findOne({ isActive: true });
      
      if (!settings) {
        settings = new SiteSettings({});
      }

      // Update footer address
      if (footerAddress) {
        settings.footerAddress = {
          ...settings.footerAddress,
          ...footerAddress
        };
      }

      // Update company info
      if (companyInfo) {
        settings.companyInfo = {
          ...settings.companyInfo,
          ...companyInfo
        };
      }

      // Update social media
      if (socialMedia) {
        settings.socialMedia = {
          ...settings.socialMedia,
          ...socialMedia
        };
      }

      // Update business hours
      if (businessHours) {
        settings.businessHours = {
          ...settings.businessHours,
          ...businessHours
        };
      }

      settings.lastUpdatedBy = req.user._id;
      settings.isActive = true;

      await settings.save();

      await settings.populate('lastUpdatedBy', 'name email');

      res.status(200).json({
        success: true,
        message: "Site settings updated successfully",
        settings
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Reset to default settings
router.post(
  "/admin/reset-site-settings",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Delete existing settings
      await SiteSettings.deleteMany({});
      
      // Create new default settings
      const settings = new SiteSettings({
        lastUpdatedBy: req.user._id
      });
      
      await settings.save();
      await settings.populate('lastUpdatedBy', 'name email');

      res.status(200).json({
        success: true,
        message: "Site settings reset to default successfully",
        settings
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;