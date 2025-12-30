const express = require("express");
const router = express.Router();
const { isSeller, isAuthenticated, isAdmin, requirePermission } = require("../middleware/auth");
const { upload } = require("../multer");
const advertisementController = require("../controller/advertisement");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// Public routes
router.get("/pricing", advertisementController.getAdvertisementPricing);
router.post("/calculate-price", advertisementController.calculateAdvertisementPrice);
router.get("/available-slots/:adType", advertisementController.getAvailableSlots);
router.get("/active/:adType", advertisementController.getActiveAdvertisementsByType);
router.post("/track-view/:id", advertisementController.trackAdView);
router.post("/track-click/:id", advertisementController.trackAdClick);

// Vendor routes
router.post(
  "/create",
  isAuthenticated,
  isSeller,
  upload.single('image'),
  advertisementController.createAdvertisement
);

router.post(
  "/process-payment",
  isAuthenticated,
  isSeller,
  advertisementController.processAdvertisementPayment
);

router.get(
  "/vendor/my-ads",
  isAuthenticated,
  isSeller,
  advertisementController.getVendorAdvertisements
);

router.get(
  "/vendor/analytics/:id",
  isAuthenticated,
  isSeller,
  advertisementController.getAdvertisementAnalytics
);

router.put(
  "/vendor/cancel/:id",
  isAuthenticated,
  isSeller,
  advertisementController.cancelAdvertisement
);

router.post(
  "/vendor/renew/:id",
  isAuthenticated,
  isSeller,
  advertisementController.renewAdvertisement
);

router.put(
  "/vendor/auto-renew/:id",
  isAuthenticated,
  isSeller,
  advertisementController.updateAutoRenew
);

// Get single advertisement for editing
router.get(
  "/vendor/ad/:id",
  isAuthenticated,
  isSeller,
  advertisementController.getVendorAdvertisementById
);

// Update advertisement (before approval or if rejected)
router.put(
  "/vendor/update/:id",
  isAuthenticated,
  isSeller,
  upload.single('image'),
  advertisementController.updateAdvertisement
);

// Admin routes - View all ads (SubAdmin can also view for approval purposes)
router.get(
  "/admin/all",
  isAuthenticated,
  requirePermission('canApproveAds'),
  advertisementController.getAllAdvertisements
);

// Admin routes - Plan management (Admin only - setup/configuration)
router.get(
  "/admin/plans",
  isAuthenticated,
  isAdmin("Admin"),
  advertisementController.getAdPlans
);

router.put(
  "/admin/update-plan",
  isAuthenticated,
  isAdmin("Admin"),
  advertisementController.updateAdPlan
);

router.put(
  "/admin/toggle-plan/:adType",
  isAuthenticated,
  isAdmin("Admin"),
  advertisementController.toggleAdPlan
);

router.put(
  "/admin/toggle-free/:adType",
  isAuthenticated,
  isAdmin("Admin"),
  advertisementController.toggleFreePlan
);

router.put(
  "/admin/update-discounts",
  isAuthenticated,
  isAdmin("Admin"),
  advertisementController.updateDurationDiscounts
);

// Admin routes - Ad approval (SubAdmin can also approve/reject)
router.put(
  "/admin/approve/:id",
  isAuthenticated,
  requirePermission('canApproveAds'),
  advertisementController.approveAdvertisement
);

router.put(
  "/admin/reject/:id",
  isAuthenticated,
  requirePermission('canApproveAds'),
  advertisementController.rejectAdvertisement
);

module.exports = router;
