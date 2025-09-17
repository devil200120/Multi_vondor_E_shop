const express = require("express");
const router = express.Router();
const Banner = require("../model/banner");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAdmin, isAuthenticated } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Please upload only image files'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

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
        banner.image = `/${req.file.filename}`;
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