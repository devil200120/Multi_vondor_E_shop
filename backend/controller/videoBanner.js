const VideoBanner = require("../model/videoBanner");
const Product = require("../model/product");
const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

// Create video banner (Admin or Seller)
const createVideoBanner = catchAsyncErrors(async (req, res, next) => {
  try {
    const {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      productId,
      priority,
      startDate,
      endDate,
      targetAudience
    } = req.body;

    // Determine if user is admin or seller
    const isAdminUser = req.isAdmin === true || (req.user && req.user.role === "Admin");
    const isSellerUser = req.isSeller === true || (req.user && req.user.role === "Seller") || !!req.seller;
    
    // Safety check: cannot be both admin and seller
    if (isAdminUser && isSellerUser) {
      return next(new ErrorHandler("Authentication error: conflicting roles", 500));
    }
    
    if (!isAdminUser && !isSellerUser) {
      console.log("Role validation failed:");
      console.log("req.isAdmin:", req.isAdmin);
      console.log("req.isSeller:", req.isSeller);
      console.log("req.user:", req.user);
      console.log("req.seller:", !!req.seller);
      return next(new ErrorHandler("Invalid user role for video banner creation", 403));
    }
    
    const createdBy = isAdminUser ? "admin" : "seller";

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // For sellers, ensure they own the product
    let shopId = null;
    if (!isAdminUser) {
      // Handle both seller authentication methods
      let shop;
      if (req.seller) {
        // Direct seller authentication
        shop = req.seller;
      } else if (req.user && req.user.seller) {
        // User with seller role
        const sellerId = typeof req.user.seller === 'object' ? req.user.seller._id : req.user.seller;
        shop = await Shop.findById(sellerId);
      }
      
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }
      
      // Check product ownership using shopId field
      const productShopId = product.shopId || (product.shop && product.shop._id) || product.shop;
      const currentShopId = shop._id.toString();
      
      console.log('Product Shop ID:', productShopId);
      console.log('Current Shop ID:', currentShopId);
      console.log('Product object shop field:', product.shop);
      console.log('Product shopId field:', product.shopId);
      
      if (!productShopId || productShopId.toString() !== currentShopId) {
        return next(new ErrorHandler("You can only create banners for your own products", 403));
      }
      shopId = shop._id;
    } else {
      // For admin-created banners, use the product's shop if it exists
      if (product.shop) {
        shopId = typeof product.shop === 'object' ? product.shop._id : product.shop;
      } else if (product.shopId) {
        shopId = product.shopId;
      }
    }

    const videoBannerData = {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      productId,
      priority: isAdminUser ? (priority || 1) : 1,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      targetAudience: targetAudience || 'all',
      createdBy,
      // CRITICAL FIX: Force pending for sellers, approved only for admin
      approvalStatus: isAdminUser ? 'approved' : 'pending',
      isActive: isAdminUser ? true : false // Sellers' banners start as inactive until approved
    };

    // ADDITIONAL VALIDATION: Double-check seller banners are pending
    if (createdBy === "seller" && videoBannerData.approvalStatus !== 'pending') {
      videoBannerData.approvalStatus = 'pending';
      videoBannerData.isActive = false;
    }

    // Only add shopId if it's a valid ObjectId string
    if (shopId && mongoose.Types.ObjectId.isValid(shopId)) {
      videoBannerData.shopId = shopId;
    }

    // FINAL SAFETY CHECK: Absolutely ensure sellers get pending status
    if (createdBy === "seller") {
      videoBannerData.approvalStatus = 'pending';
      videoBannerData.isActive = false;
    }

    const videoBanner = await VideoBanner.create(videoBannerData);

    // Populate product details for response
    await videoBanner.populate('productId', 'name images discountPrice originalPrice');
    if (videoBanner.shopId) {
      await videoBanner.populate('shopId', 'name');
    }

    res.status(201).json({
      success: true,
      videoBanner,
      message: isAdminUser ? 
        "Video banner created and activated successfully" : 
        "Video banner created and submitted for admin approval"
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get all active video banners for homepage
const getActiveVideoBanners = catchAsyncErrors(async (req, res, next) => {
  try {
    const currentDate = new Date();
    
    console.log("=== DEBUGGING ACTIVE VIDEO BANNERS ===");
    console.log("Current date:", currentDate);
    
    // First, let's see ALL video banners regardless of status
    const allBanners = await VideoBanner.find({})
      .populate('productId', 'name images discountPrice originalPrice shopId category')
      .populate('shopId', 'name');
    
    console.log("Total video banners in DB:", allBanners.length);
    allBanners.forEach((banner, index) => {
      console.log(`Banner ${index + 1}:`, {
        id: banner._id,
        title: banner.title,
        createdBy: banner.createdBy,
        shopId: banner.shopId?._id || 'null',
        isActive: banner.isActive,
        approvalStatus: banner.approvalStatus,
        startDate: banner.startDate,
        endDate: banner.endDate,
        hasProduct: !!banner.productId
      });
    });
    
    // Now let's apply the filters step by step
    const activeQuery = {
      isActive: true,
      approvalStatus: 'approved',
      $or: [
        { endDate: null },
        { endDate: { $gte: currentDate } }
      ],
      startDate: { $lte: currentDate }
    };
    
    console.log("Active query:", JSON.stringify(activeQuery, null, 2));
    
    const videoBanners = await VideoBanner.find(activeQuery)
      .populate('productId', 'name images discountPrice originalPrice shopId category')
      .populate('shopId', 'name')
      .sort({ priority: -1, createdAt: -1 })
      .limit(10);

    console.log("Video banners matching active query:", videoBanners.length);
    
    const filteredBanners = videoBanners.filter(banner => banner.productId);
    console.log("After filtering for valid products:", filteredBanners.length);
    
    console.log("=== END DEBUG ===");

    res.status(200).json({
      success: true,
      videoBanners: filteredBanners
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get all video banners for admin (with pending approvals)
const getAllVideoBanners = catchAsyncErrors(async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status && status !== 'all') {
      query.approvalStatus = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const videoBanners = await VideoBanner.find(query)
      .populate('productId', 'name images discountPrice originalPrice')
      .populate('shopId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await VideoBanner.countDocuments(query);

    res.status(200).json({
      success: true,
      videoBanners,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get seller's video banners
const getMyVideoBanners = catchAsyncErrors(async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Handle both seller and admin authentication
    let shopId;
    if (req.seller) {
      // Direct seller authentication
      shopId = req.seller._id;
    } else if (req.user && req.user.seller) {
      // User with seller role
      const shop = await Shop.findById(req.user.seller);
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }
      shopId = shop._id;
    } else {
      return next(new ErrorHandler("Shop not found", 404));
    }

    const videoBanners = await VideoBanner.find({ shopId: shopId })
      .populate('productId', 'name images discountPrice originalPrice')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await VideoBanner.countDocuments({ shopId: shopId });

    res.status(200).json({
      success: true,
      videoBanners,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get video banner by ID
const getVideoBannerById = catchAsyncErrors(async (req, res, next) => {
  try {
    const videoBanner = await VideoBanner.findById(req.params.id)
      .populate('productId', 'name images discountPrice originalPrice description category')
      .populate('shopId', 'name email');

    if (!videoBanner) {
      return next(new ErrorHandler("Video banner not found", 404));
    }

    res.status(200).json({
      success: true,
      videoBanner
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Update video banner
const updateVideoBanner = catchAsyncErrors(async (req, res, next) => {
  try {
    const bannerId = req.params.id;
    const videoBanner = await VideoBanner.findById(bannerId);

    if (!videoBanner) {
      return next(new ErrorHandler("Video banner not found", 404));
    }

    // Check authorization
    const isAdminUser = req.user.role === "Admin";
    if (!isAdminUser && videoBanner.shopId.toString() !== req.user.seller.toString()) {
      return next(new ErrorHandler("You can only update your own video banners", 403));
    }

    const updatedData = { ...req.body };

    console.log("=== UPDATE VIDEO BANNER DEBUG ===");
    console.log("Banner ID:", bannerId);
    console.log("Current banner status:", videoBanner.approvalStatus);
    console.log("Current banner isActive:", videoBanner.isActive);
    console.log("Update data:", updatedData);
    console.log("Is Admin:", isAdminUser);

    // If seller is updating, reset approval status (unless admin is updating)
    if (!isAdminUser) {
      updatedData.approvalStatus = 'pending';
      updatedData.isActive = false;
    }

    // Remove validation conflicts - let the pre-save hook handle it
    const updatedBanner = await VideoBanner.findByIdAndUpdate(
      bannerId,
      updatedData,
      { 
        new: true, 
        runValidators: false // Disable field validators to avoid conflicts
      }
    )
      .populate('productId', 'name images discountPrice originalPrice')
      .populate('shopId', 'name');

    console.log("Updated banner status:", updatedBanner.approvalStatus);
    console.log("Updated banner isActive:", updatedBanner.isActive);
    console.log("=== END UPDATE DEBUG ===");

    res.status(200).json({
      success: true,
      videoBanner: updatedBanner,
      message: "Video banner updated successfully"
    });

  } catch (error) {
    console.error("Update error:", error);
    return next(new ErrorHandler(error.message, 500));
  }
});

// Delete video banner
const deleteVideoBanner = catchAsyncErrors(async (req, res, next) => {
  try {
    const bannerId = req.params.id;
    const videoBanner = await VideoBanner.findById(bannerId);

    if (!videoBanner) {
      return next(new ErrorHandler("Video banner not found", 404));
    }

    // Check authorization
    const isAdminUser = req.user.role === "Admin";
    if (!isAdminUser && videoBanner.shopId.toString() !== req.user.seller.toString()) {
      return next(new ErrorHandler("You can only delete your own video banners", 403));
    }

    await VideoBanner.findByIdAndDelete(bannerId);

    res.status(200).json({
      success: true,
      message: "Video banner deleted successfully"
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Approve video banner (Admin only)
const approveVideoBanner = catchAsyncErrors(async (req, res, next) => {
  try {
    const bannerId = req.params.id;
    
    console.log("=== APPROVING VIDEO BANNER ===");
    console.log("Banner ID:", bannerId);
    console.log("Admin user:", req.user._id);
    
    const videoBanner = await VideoBanner.findByIdAndUpdate(
      bannerId,
      {
        approvalStatus: 'approved',
        isActive: true, // CRITICAL: Activate the banner when approved
        approvedAt: new Date(),
        approvedBy: req.user._id
      },
      { new: true }
    )
      .populate('productId', 'name images')
      .populate('shopId', 'name');

    if (!videoBanner) {
      return next(new ErrorHandler("Video banner not found", 404));
    }

    console.log("Video banner approved successfully");
    console.log("Final status:", videoBanner.approvalStatus);
    console.log("Final isActive:", videoBanner.isActive);
    console.log("=== END APPROVAL ===");

    res.status(200).json({
      success: true,
      videoBanner,
      message: "Video banner approved and activated successfully"
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Reject video banner (Admin only)
const rejectVideoBanner = catchAsyncErrors(async (req, res, next) => {
  try {
    const bannerId = req.params.id;
    const { rejectionReason } = req.body;
    
    console.log("=== REJECTING VIDEO BANNER ===");
    console.log("Banner ID:", bannerId);
    console.log("Rejection reason:", rejectionReason);
    
    const videoBanner = await VideoBanner.findByIdAndUpdate(
      bannerId,
      {
        approvalStatus: 'rejected',
        isActive: false, // Ensure rejected banners are inactive
        rejectionReason,
        rejectedAt: new Date(),
        rejectedBy: req.user._id
      },
      { new: true }
    )
      .populate('productId', 'name images')
      .populate('shopId', 'name');

    if (!videoBanner) {
      return next(new ErrorHandler("Video banner not found", 404));
    }

    console.log("Video banner rejected successfully");
    console.log("=== END REJECTION ===");

    res.status(200).json({
      success: true,
      videoBanner,
      message: "Video banner rejected successfully"
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Record view
const recordView = catchAsyncErrors(async (req, res, next) => {
  try {
    const bannerId = req.params.id;
    
    await VideoBanner.findByIdAndUpdate(
      bannerId,
      { $inc: { views: 1 } }
    );

    res.status(200).json({
      success: true,
      message: "View recorded"
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Record click
const recordClick = catchAsyncErrors(async (req, res, next) => {
  try {
    const bannerId = req.params.id;
    
    await VideoBanner.findByIdAndUpdate(
      bannerId,
      { $inc: { clicks: 1 } }
    );

    res.status(200).json({
      success: true,
      message: "Click recorded"
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get banner analytics (Admin only)
const getBannerAnalytics = catchAsyncErrors(async (req, res, next) => {
  try {
    const totalBanners = await VideoBanner.countDocuments();
    const activeBanners = await VideoBanner.countDocuments({ isActive: true, approvalStatus: 'approved' });
    const pendingBanners = await VideoBanner.countDocuments({ approvalStatus: 'pending' });
    const rejectedBanners = await VideoBanner.countDocuments({ approvalStatus: 'rejected' });
    
    // Calculate total views and clicks
    const viewsResult = await VideoBanner.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);
    
    const clicksResult = await VideoBanner.aggregate([
      { $group: { _id: null, totalClicks: { $sum: "$clicks" } } }
    ]);
    
    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;
    const totalClicks = clicksResult.length > 0 ? clicksResult[0].totalClicks : 0;
    
    res.status(200).json({
      success: true,
      analytics: {
        totalBanners,
        activeBanners,
        pendingBanners,
        rejectedBanners,
        totalViews,
        totalClicks
      }
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Upload video/thumbnail files to Cloudinary
const uploadVideoBannerFiles = catchAsyncErrors(async (req, res, next) => {
  try {
    const results = {};
    
    // Handle video upload
    if (req.files && req.files.video && req.files.video[0]) {
      const videoFile = req.files.video[0];
      
      const videoResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: "video",
            folder: "video-banners/videos",
            transformation: [
              { quality: "auto", format: "mp4" },
              { duration: 30 } // Limit video to 30 seconds
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(videoFile.buffer);
      });
      
      results.videoUrl = videoResult.secure_url;
    }
    
    // Handle thumbnail upload
    if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
      const thumbnailFile = req.files.thumbnail[0];
      
      const thumbnailResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: "video-banners/thumbnails",
            transformation: [
              { width: 1920, height: 1080, crop: "fill", quality: "auto" }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(thumbnailFile.buffer);
      });
      
      results.thumbnailUrl = thumbnailResult.secure_url;
    }
    
    if (Object.keys(results).length === 0) {
      return next(new ErrorHandler("No files uploaded", 400));
    }
    
    res.status(200).json({
      success: true,
      message: "Files uploaded successfully",
      urls: results
    });
    
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Update banner approval status (generic function for approve/reject)
const updateBannerApproval = catchAsyncErrors(async (req, res, next) => {
  try {
    const { approvalStatus, rejectionReason } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected'];
    
    if (!validStatuses.includes(approvalStatus)) {
      return next(new ErrorHandler("Invalid approval status", 400));
    }

    const videoBanner = await VideoBanner.findById(req.params.id);

    if (!videoBanner) {
      return next(new ErrorHandler("Video banner not found", 404));
    }

    console.log("=== UPDATING BANNER APPROVAL ===");
    console.log("Current status:", videoBanner.approvalStatus);
    console.log("New status:", approvalStatus);

    videoBanner.approvalStatus = approvalStatus;
    
    // Set isActive based on approval status
    if (approvalStatus === 'approved') {
      videoBanner.isActive = true;
      videoBanner.approvedBy = req.user.id;
      videoBanner.approvedAt = Date.now();
    } else if (approvalStatus === 'rejected') {
      videoBanner.isActive = false;
      videoBanner.rejectedBy = req.user.id;
      videoBanner.rejectedAt = Date.now();
      if (rejectionReason) {
        videoBanner.rejectionReason = rejectionReason;
      }
    } else if (approvalStatus === 'pending') {
      videoBanner.isActive = false; // Pending banners should be inactive
    }

    await videoBanner.save();

    console.log("Final status:", videoBanner.approvalStatus);
    console.log("Final isActive:", videoBanner.isActive);
    console.log("=== END UPDATE ===");

    res.status(200).json({
      success: true,
      message: `Video banner ${approvalStatus} successfully`,
      videoBanner
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

module.exports = {
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
};