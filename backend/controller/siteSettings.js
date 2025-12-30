const express = require("express");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const SiteSettings = require("../model/siteSettings");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { clearCurrencyCache } = require("../utils/currencyFormatter");
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");
const { upload } = require("../multer");
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
        businessHours,
        currency,
        branding
      } = req.body;

      let settings = await SiteSettings.findOne({ isActive: true });
      
      if (!settings) {
        settings = new SiteSettings({});
      }

      // Update branding settings
      if (branding) {
        settings.branding = {
          ...settings.branding,
          ...branding
        };
      }

      // Update currency settings
      if (currency) {
        settings.currency = {
          ...settings.currency,
          ...currency
        };
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

      // Clear currency cache if currency settings were updated
      if (currency) {
        clearCurrencyCache();
      }

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
      
      // Clear currency cache after reset
      clearCurrencyCache();
      
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

// Admin: Upload branding image (favicon or apple touch icon)
router.post(
  "/admin/upload-branding-image",
  isAuthenticated,
  isAdmin("Admin"),
  upload.single("image"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { imageType } = req.body; // 'favicon' or 'appleTouchIcon'
      
      if (!req.file) {
        return next(new ErrorHandler("Please upload an image", 400));
      }

      if (!imageType || !['favicon', 'appleTouchIcon'].includes(imageType)) {
        return next(new ErrorHandler("Invalid image type. Must be 'favicon' or 'appleTouchIcon'", 400));
      }

      // Upload to Cloudinary
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'branding',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'ico', 'svg']
      });

      // Get current settings
      let settings = await SiteSettings.findOne({ isActive: true });
      
      if (!settings) {
        settings = new SiteSettings({});
      }

      // Delete old image from Cloudinary if exists
      const oldPublicId = settings.branding?.[`${imageType}PublicId`];
      if (oldPublicId) {
        try {
          await deleteFromCloudinary(oldPublicId, 'image');
        } catch (deleteError) {
          console.log('Failed to delete old branding image:', deleteError.message);
        }
      }

      // Update settings with new image URL
      if (!settings.branding) {
        settings.branding = {};
      }
      settings.branding[imageType] = result.url;
      settings.branding[`${imageType}PublicId`] = result.public_id;
      settings.lastUpdatedBy = req.user._id;

      await settings.save();

      res.status(200).json({
        success: true,
        message: `${imageType === 'favicon' ? 'Favicon' : 'Apple Touch Icon'} uploaded successfully`,
        url: result.url,
        publicId: result.public_id
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Delete branding image
router.delete(
  "/admin/delete-branding-image/:imageType",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { imageType } = req.params;

      if (!['favicon', 'appleTouchIcon'].includes(imageType)) {
        return next(new ErrorHandler("Invalid image type", 400));
      }

      let settings = await SiteSettings.findOne({ isActive: true });
      
      if (!settings) {
        return next(new ErrorHandler("Settings not found", 404));
      }

      // Delete from Cloudinary
      const publicId = settings.branding?.[`${imageType}PublicId`];
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId, 'image');
        } catch (deleteError) {
          console.log('Failed to delete from Cloudinary:', deleteError.message);
        }
      }

      // Reset to default
      if (settings.branding) {
        settings.branding[imageType] = imageType === 'favicon' ? '/WANTTA (7).png' : '/logo192.png';
        settings.branding[`${imageType}PublicId`] = null;
      }
      
      settings.lastUpdatedBy = req.user._id;
      await settings.save();

      res.status(200).json({
        success: true,
        message: `${imageType === 'favicon' ? 'Favicon' : 'Apple Touch Icon'} deleted successfully`
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;