const express = require("express");
const router = express.Router();
const { isAuthenticated, isAdmin, isSeller } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const VideoBanner = require("../model/videoBanner");
const ErrorHandler = require("../utils/ErrorHandler");
const { upload } = require("../multer");
const {
  createVideoBanner,
  getAllVideoBanners,
  getActiveVideoBanners,
  getVideoBannerById,
  updateVideoBanner,
  deleteVideoBanner,
  approveVideoBanner,
  rejectVideoBanner,
  updateBannerApproval,
  getMyVideoBanners,
  recordView,
  recordClick,
  getBannerAnalytics,
  uploadVideoBannerFiles
} = require("../controller/videoBanner");

// Custom middleware to handle both admin and seller authentication
const isAdminOrSeller = catchAsyncErrors(async (req, res, next) => {
  const { token, seller_token } = req.cookies;
  
  let authenticationSuccessful = false;
  
  // First priority: Check for Admin through user token
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await User.findById(decoded.id);
      
      if (user && user.role === "Admin") {
        req.user = user;
        req.isAdmin = true;
        authenticationSuccessful = true;
      }
    } catch (error) {
      // Token verification failed, try seller token
    }
  }
  
  // Second priority: Check for Seller through seller_token (only if not already authenticated as admin)
  if (!authenticationSuccessful && seller_token) {
    try {
      const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);
      const shop = await Shop.findById(decoded.id);
      
      if (shop) {
        req.user = { 
          role: "Seller", 
          seller: shop._id,
          _id: shop._id,
          email: shop.email 
        };
        req.seller = shop;
        req.isSeller = true;
        authenticationSuccessful = true;
      }
    } catch (error) {
      // Seller token verification failed
    }
  }
  
  if (!authenticationSuccessful) {
    return res.status(401).json({
      success: false,
      message: "Please login to continue",
    });
  }
  
  next();
});

// Add required imports
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Shop = require("../model/shop");

// Upload video banner files (Admin or Seller)
router.post(
  "/upload-files",
  isAdminOrSeller,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  catchAsyncErrors(uploadVideoBannerFiles)
);

// Create a new video banner (Admin or Seller)
router.post(
  "/create-video-banner",
  isAdminOrSeller,
  catchAsyncErrors(createVideoBanner)
);

// Create a new video banner (Seller only - dedicated route)
router.post(
  "/seller/create-video-banner",
  isSeller,
  catchAsyncErrors(createVideoBanner)
);

// Get all video banners (Admin only)
router.get(
  "/admin-all-video-banners",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(getAllVideoBanners)
);

// Get active video banners (Public)
router.get(
  "/active-video-banners",
  catchAsyncErrors(getActiveVideoBanners)
);

// Get video banner by ID (Public)
router.get(
  "/video-banner/:id",
  catchAsyncErrors(getVideoBannerById)
);

// Get video banner by ID for editing (Seller or Admin)
router.get(
  "/get-video-banner/:id",
  isAdminOrSeller,
  catchAsyncErrors(getVideoBannerById)
);

// Update video banner (Admin or Owner)
router.put(
  "/update-video-banner/:id",
  isAuthenticated,
  catchAsyncErrors(updateVideoBanner)
);

// Update video banner (Seller only - dedicated route)
router.put(
  "/seller/update-video-banner/:id",
  isAdminOrSeller,
  catchAsyncErrors(updateVideoBanner)
);

// Delete video banner (Admin or Owner)
router.delete(
  "/delete-video-banner/:id",
  isAuthenticated,
  catchAsyncErrors(deleteVideoBanner)
);

// Approve video banner (Admin only)
router.put(
  "/approve-video-banner/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(approveVideoBanner)
);

// Reject video banner (Admin only)
router.put(
  "/reject-video-banner/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(rejectVideoBanner)
);

// Update banner approval status (Admin only)
router.put(
  "/update-banner-approval/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(updateBannerApproval)
);

// Get single video banner for seller editing
router.get(
  "/seller/get-video-banner/:id",
  isAdminOrSeller,
  catchAsyncErrors(getVideoBannerById)
);

// Update video banner for seller
router.put(
  "/seller/update-video-banner/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const bannerId = req.params.id;
      const updateData = req.body;
      
      console.log("=== SELLER UPDATE VIDEO BANNER ===");
      console.log("Banner ID:", bannerId);
      console.log("Seller:", req.seller._id);
      console.log("Update data:", updateData);
      
      // Find the banner and check ownership
      const existingBanner = await VideoBanner.findById(bannerId);
      if (!existingBanner) {
        return next(new ErrorHandler("Video banner not found", 404));
      }
      
      // Check if seller owns this banner
      if (existingBanner.shopId.toString() !== req.seller._id.toString()) {
        return next(new ErrorHandler("Access denied. You can only update your own banners", 403));
      }
      
      // Sellers can only update certain fields
      const allowedFields = ['title', 'description', 'thumbnail', 'videoFile', 'productId'];
      const filteredUpdate = {};
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredUpdate[field] = updateData[field];
        }
      });
      
      // When seller updates, set status back to pending (except if admin already approved)
      if (existingBanner.approvalStatus === 'rejected') {
        filteredUpdate.approvalStatus = 'pending';
        filteredUpdate.rejectionReason = undefined;
        filteredUpdate.rejectedAt = undefined;
        filteredUpdate.rejectedBy = undefined;
      }
      
      console.log("Filtered update data:", filteredUpdate);
      
      const updatedBanner = await VideoBanner.findByIdAndUpdate(
        bannerId,
        filteredUpdate,
        { new: true, runValidators: false }
      ).populate('productId', 'name images').populate('shopId', 'name');
      
      console.log("Banner updated successfully");
      console.log("=== END SELLER UPDATE ===");
      
      res.status(200).json({
        success: true,
        videoBanner: updatedBanner,
        message: "Video banner updated successfully"
      });
      
    } catch (error) {
      console.error("Seller update error:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get my video banners (Seller only)
router.get(
  "/my-video-banners",
  isSeller,
  catchAsyncErrors(getMyVideoBanners)
);

// Record view (Public)
router.post(
  "/record-view/:id",
  catchAsyncErrors(recordView)
);

// Record click (Public)
router.post(
  "/record-click/:id",
  catchAsyncErrors(recordClick)
);

// Get banner analytics (Admin only)
router.get(
  "/banner-analytics",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(getBannerAnalytics)
);

// Get video banners by shop ID (Public)
router.get(
  "/shop/:shopId/video-banners",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get active video banners for this shop
      const currentDate = new Date();
      const query = {
        shopId: shopId,
        isActive: true,
        approvalStatus: 'approved',
        $or: [
          { endDate: null },
          { endDate: { $gte: currentDate } }
        ],
        startDate: { $lte: currentDate }
      };

      const videoBanners = await VideoBanner.find(query)
        .populate('productId', 'name images discountPrice originalPrice shopId category')
        .populate('shopId', 'name')
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await VideoBanner.countDocuments(query);

      // Filter out banners without valid products
      const filteredBanners = videoBanners.filter(banner => banner.productId);

      res.status(200).json({
        success: true,
        videoBanners: filteredBanners,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        total: filteredBanners.length
      });

    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;