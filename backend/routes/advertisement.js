const express = require("express");
const router = express.Router();
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
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

// Admin routes
router.get(
  "/admin/all",
  isAuthenticated,
  isAdmin("Admin"),
  advertisementController.getAllAdvertisements
);

router.put(
  "/admin/approve/:id",
  isAuthenticated,
  isAdmin("Admin"),
  advertisementController.approveAdvertisement
);

router.put(
  "/admin/reject/:id",
  isAuthenticated,
  isAdmin("Admin"),
  advertisementController.rejectAdvertisement
);

module.exports = router;
