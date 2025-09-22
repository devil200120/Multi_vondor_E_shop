const express = require("express");
const router = express.Router();
const Banner = require("../model/banner");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAdmin, isAuthenticated } = require("../middleware/auth");
const { upload } = require("../multer");
const { uploadImageToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");

// Get active banner content
router.get(
  "/get-banner",
  catchAsyncErrors(async (req, res, next) => {
    try {
      let banner = await Banner.findOne({ isActive: true });
      
      // If no banner exists, create default one
      if (!banner) {
        banner = await Banner.create({});
      }

      res.status(200).json({
        success: true,
        banner,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update banner content (Admin only)
router.put(
  "/update-banner",
  isAuthenticated,
  isAdmin("Admin"),
  upload.single('image'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        title,
        subtitle,
        description,
        buttonText,
        secondaryButtonText,
        customerCount,
        customerLabel,
        productCount,
        productLabel,
        satisfactionCount,
        satisfactionLabel
      } = req.body;

      let banner = await Banner.findOne({ isActive: true });
      
      // If no banner exists, create one
      if (!banner) {
        banner = new Banner();
      }

      // Update banner fields
      if (title) banner.title = title;
      if (subtitle) banner.subtitle = subtitle;
      if (description) banner.description = description;
      if (buttonText) banner.buttonText = buttonText;
      if (secondaryButtonText) banner.secondaryButtonText = secondaryButtonText;

      // Update image if uploaded
      if (req.file) {
        try {
          // Delete old image from Cloudinary if exists
          if (banner.image && banner.image.public_id) {
            console.log('Deleting old banner image from Cloudinary:', banner.image.public_id);
            await deleteFromCloudinary(banner.image.public_id);
          }
          
          // Upload new image to Cloudinary
          console.log('Uploading new banner image to Cloudinary:', req.file.originalname);
          const result = await uploadImageToCloudinary(req.file.path, {
            folder: 'banners',
            resource_type: 'image'
          });
          
          banner.image = {
            url: result.url,
            public_id: result.public_id
          };
          console.log('Banner image uploaded successfully to Cloudinary:', result.public_id);
        } catch (uploadError) {
          console.error('Error uploading banner image to Cloudinary:', uploadError);
          return next(new ErrorHandler(`Failed to upload image: ${uploadError.message}`, 500));
        }
      }

      // Update stats
      if (customerCount) banner.stats.customers.count = customerCount;
      if (customerLabel) banner.stats.customers.label = customerLabel;
      if (productCount) banner.stats.products.count = productCount;
      if (productLabel) banner.stats.products.label = productLabel;
      if (satisfactionCount) banner.stats.satisfaction.count = satisfactionCount;
      if (satisfactionLabel) banner.stats.satisfaction.label = satisfactionLabel;

      await banner.save();

      res.status(200).json({
        success: true,
        message: "Banner updated successfully!",
        banner,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get banner content for admin (includes all fields)
router.get(
  "/admin/get-banner",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      let banner = await Banner.findOne({ isActive: true });
      
      // If no banner exists, create default one
      if (!banner) {
        banner = await Banner.create({});
      }

      res.status(200).json({
        success: true,
        banner,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Reset banner to default (Admin only)
router.post(
  "/reset-banner",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Delete current banner
      await Banner.deleteMany({});
      
      // Create new default banner
      const banner = await Banner.create({});

      res.status(200).json({
        success: true,
        message: "Banner reset to default successfully!",
        banner,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;