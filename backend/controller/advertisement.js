const Advertisement = require("../model/advertisement");
const Shop = require("../model/shop");
const Product = require("../model/product");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");
const sendMail = require("../utils/sendMail");

// Get pricing information (public)
exports.getAdvertisementPricing = catchAsyncErrors(async (req, res, next) => {
  const pricing = Advertisement.getPricing();
  
  const pricingDetails = Object.keys(pricing).map(type => {
    const dimensions = {
      leaderboard: '728x120',
      top_sidebar_ad: '200x120',
      right_sidebar_top: '300x200',
      right_sidebar_middle: '300x200',
      right_sidebar_bottom: '300x200',
    };
    
    const slots = {
      leaderboard: 6,
      top_sidebar_ad: 6,
      right_sidebar_top: 6,
      right_sidebar_middle: 6,
      right_sidebar_bottom: 6,
    };
    
    return {
      adType: type,
      basePrice: pricing[type],
      dimensions: dimensions[type] || 'N/A',
      slots: slots[type] || null,
      durations: [
        { months: 1, discount: 0, label: '1 Month' },
        { months: 3, discount: 10, label: '3 Months' },
        { months: 6, discount: 15, label: '6 Months' },
        { months: 12, discount: 20, label: '12 Months' },
      ]
    };
  });
  
  res.status(200).json({
    success: true,
    pricing: pricingDetails,
  });
});

// Calculate price for an ad
exports.calculateAdvertisementPrice = catchAsyncErrors(async (req, res, next) => {
  const { adType, duration } = req.body;
  
  if (!adType || !duration) {
    return next(new ErrorHandler("Ad type and duration are required", 400));
  }
  
  const pricing = Advertisement.getPricing();
  const basePrice = pricing[adType];
  
  if (!basePrice) {
    return next(new ErrorHandler("Invalid ad type", 400));
  }
  
  // Check if this ad type is set to free mode for testing
  const plan = adPlansConfig?.plans?.find(p => p.adType === adType);
  const isFree = plan?.isFree || false;
  
  const discount = Advertisement.calculateDiscount(duration);
  const totalMonthlyPrice = basePrice * duration;
  const discountAmount = (totalMonthlyPrice * discount) / 100;
  const totalPrice = isFree ? 0 : totalMonthlyPrice - discountAmount;
  
  res.status(200).json({
    success: true,
    pricing: {
      adType,
      duration,
      basePrice,
      totalMonthlyPrice,
      discount,
      discountAmount,
      totalPrice,
      isFree,
    },
  });
});

// Get available slots for a specific ad type
exports.getAvailableSlots = catchAsyncErrors(async (req, res, next) => {
  const { adType } = req.params;
  const sellerId = req.seller?._id;
  
  // Ad types that have slots
  const slotTypes = ['leaderboard', 'top_sidebar', 'right_sidebar_top', 
                     'right_sidebar_middle', 'right_sidebar_bottom'];
  
  if (!slotTypes.includes(adType)) {
    return res.status(200).json({
      success: true,
      slots: null,
      message: 'This ad type does not have slots',
    });
  }
  
  // Get all PAID active/pending ads for this type (only count ads where payment is completed)
  const activeAds = await Advertisement.find({
    adType,
    status: { $in: ['active', 'pending'] },
    paymentStatus: 'completed', // Only count paid ads
    endDate: { $gt: new Date() },
  }).select('slotNumber shopId');
  
  const totalSlots = 6;
  const slotInfo = [];
  
  // Calculate ads per slot and check if seller already has ad in that slot
  for (let i = 1; i <= totalSlots; i++) {
    const adsInSlot = activeAds.filter(ad => ad.slotNumber === i);
    const sellerHasAdInSlot = sellerId 
      ? adsInSlot.some(ad => ad.shopId.toString() === sellerId.toString())
      : false;
    
    slotInfo.push({
      slot: i,
      adsCount: adsInSlot.length,
      sellerHasAd: sellerHasAdInSlot,
      available: !sellerHasAdInSlot, // Available if seller doesn't already have paid ad here
    });
  }
  
  // Available slots are those where seller doesn't already have a paid ad
  const availableSlots = slotInfo.filter(s => s.available).map(s => s.slot);
  
  res.status(200).json({
    success: true,
    totalSlots,
    slotInfo, // Detailed info for each slot
    availableSlots, // Simple array for backward compatibility
    totalActiveAds: activeAds.length,
    message: 'Multiple sellers can book same slot - ads rotate in carousel',
  });
});

// Create advertisement (Vendor only)
exports.createAdvertisement = catchAsyncErrors(async (req, res, next) => {
  const {
    adType,
    slotNumber,
    title,
    description,
    duration,
    autoRenew,
    productId,
  } = req.body;
  
  // Verify shop exists and belongs to user
  const shop = await Shop.findById(req.seller._id);
  if (!shop) {
    return next(new ErrorHandler("Shop not found", 404));
  }
  
  // Note: Multiple sellers can book the same slot
  // Ads will rotate in a carousel (10 second intervals)
  const slotTypes = ['leaderboard', 'top_sidebar', 'right_sidebar_top', 
                     'right_sidebar_middle', 'right_sidebar_bottom'];
  
  // Only check for same shop duplicate in same slot (only block if they have a PAID ad)
  if (slotTypes.includes(adType) && slotNumber) {
    // Check for paid ads from same shop in same slot
    const existingPaidAd = await Advertisement.findOne({
      adType,
      slotNumber: parseInt(slotNumber),
      shopId: req.seller._id,
      status: { $in: ['active', 'pending'] },
      paymentStatus: 'completed', // Only block if payment was completed
      endDate: { $gt: new Date() },
    });
    
    if (existingPaidAd) {
      return next(new ErrorHandler(`You already have a paid active/pending ad in slot ${slotNumber}`, 400));
    }
    
    // Auto-cancel any unpaid ads from the same seller in the same slot
    await Advertisement.updateMany(
      {
        adType,
        slotNumber: parseInt(slotNumber),
        shopId: req.seller._id,
        status: 'awaiting_payment',
        paymentStatus: 'pending',
      },
      {
        $set: { status: 'cancelled', cancellationReason: 'Replaced by new ad creation' }
      }
    );
  }
  
  // Verify product belongs to vendor (for featured_product type)
  if (adType === 'featured_product' && productId) {
    const product = await Product.findById(productId);
    if (!product || product.shopId.toString() !== shop._id.toString()) {
      return next(new ErrorHandler("Product not found or doesn't belong to your shop", 404));
    }
  }
  
  // Handle media upload (image or video)
  let imageData = null;
  let videoData = null;
  let mediaType = 'image';
  
  if (req.file) {
    const isVideo = req.file.mimetype.startsWith('video/');
    mediaType = isVideo ? 'video' : 'image';
    
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'advertisements',
      resource_type: isVideo ? 'video' : 'image',
    });
    
    if (isVideo) {
      videoData = {
        url: result.url,
        public_id: result.public_id,
      };
    } else {
      imageData = {
        url: result.url,
        public_id: result.public_id,
      };
    }
  }
  
  // Generate link URL - to product if selected, otherwise to shop
  let linkUrl = `/shop/${shop._id}`;
  if (productId) {
    const product = await Product.findById(productId);
    if (product && product.shopId.toString() === shop._id.toString()) {
      linkUrl = `/product/${productId}`;
    }
  }
  
  // Calculate dates
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + parseInt(duration));
  
  // Create advertisement
  const advertisement = new Advertisement({
    shopId: shop._id,
    adType,
    slotNumber: slotNumber ? parseInt(slotNumber) : null,
    title,
    description,
    image: imageData,
    video: videoData,
    mediaType,
    linkUrl,
    productId: productId || null,
    duration: parseInt(duration),
    startDate,
    endDate,
    autoRenew: autoRenew !== undefined ? autoRenew : true,
  });
  
  // Calculate price
  advertisement.calculateTotalPrice();
  
  // Check if this ad type is in free mode
  const plan = adPlansConfig?.plans?.find(p => p.adType === adType);
  const isFree = plan?.isFree || false;
  
  // Check if seller has adPreApproval feature (Gold plan)
  const Subscription = require("../model/subscription");
  const subscription = await Subscription.findOne({
    shop: req.seller._id,
    status: { $in: ['active', 'pending'] },
  });
  
  const hasAdPreApproval = subscription?.features?.adPreApproval || false;
  
  if (isFree) {
    // Free mode - skip payment
    advertisement.paymentStatus = 'completed';
    advertisement.totalPrice = 0;
    advertisement.paymentMethod = 'free_testing';
    
    // If seller has Ad Pre-Approval (Gold plan), auto-approve
    if (hasAdPreApproval) {
      advertisement.status = 'active';
      advertisement.approvedAt = new Date();
      advertisement.approvalNote = 'Auto-approved (Gold Plan - Ad Pre-Approval feature)';
    } else {
      advertisement.status = 'pending'; // Still needs admin approval
    }
  }
  
  await advertisement.save();
  
  let message = "";
  if (isFree && hasAdPreApproval) {
    message = "Advertisement created successfully (FREE MODE + Auto-Approved). Your ad is now LIVE!";
  } else if (isFree) {
    message = "Advertisement created successfully (FREE MODE). Awaiting admin approval.";
  } else {
    message = "Advertisement created successfully. Awaiting payment.";
  }
  
  res.status(201).json({
    success: true,
    message,
    advertisement,
    isFree,
    autoApproved: isFree && hasAdPreApproval,
  });
});

// Process advertisement payment
exports.processAdvertisementPayment = catchAsyncErrors(async (req, res, next) => {
  const { advertisementId, paymentId, paymentMethod } = req.body;
  
  const advertisement = await Advertisement.findById(advertisementId);
  
  if (!advertisement) {
    return next(new ErrorHandler("Advertisement not found", 404));
  }
  
  // Verify ownership
  if (advertisement.shopId.toString() !== req.seller._id.toString()) {
    return next(new ErrorHandler("Unauthorized", 403));
  }
  
  // Check if seller has adPreApproval feature (Gold plan)
  const Subscription = require("../model/subscription");
  const subscription = await Subscription.findOne({
    shop: req.seller._id,
    status: { $in: ['active', 'pending'] },
  });
  
  const hasAdPreApproval = subscription?.features?.adPreApproval || false;
  
  // Update payment status
  advertisement.paymentStatus = 'completed';
  advertisement.paymentId = paymentId;
  advertisement.paymentMethod = paymentMethod;
  
  // If seller has Ad Pre-Approval (Gold plan), auto-approve the ad
  if (hasAdPreApproval) {
    advertisement.status = 'active';
    advertisement.approvedAt = new Date();
    advertisement.approvalNote = 'Auto-approved (Gold Plan - Ad Pre-Approval feature)';
  } else {
    advertisement.status = 'pending'; // Pending admin approval
  }
  
  await advertisement.save();
  
  // Send notification to admin if not auto-approved
  // TODO: Implement admin notification
  
  const message = hasAdPreApproval
    ? "Payment processed successfully. Advertisement is now LIVE (Gold Plan - Auto-Approved)!"
    : "Payment processed successfully. Advertisement pending admin approval.";
  
  res.status(200).json({
    success: true,
    message,
    advertisement,
    autoApproved: hasAdPreApproval,
  });
});

// Approve advertisement (Admin only)
exports.approveAdvertisement = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  const advertisement = await Advertisement.findById(id);
  
  if (!advertisement) {
    return next(new ErrorHandler("Advertisement not found", 404));
  }
  
  // Check if payment is completed before allowing approval
  if (advertisement.paymentStatus !== 'completed') {
    return next(new ErrorHandler("Cannot approve - Payment not completed. Current status: " + advertisement.paymentStatus, 400));
  }
  
  advertisement.status = 'active';
  advertisement.approvedBy = req.user._id;
  advertisement.approvedAt = new Date();
  
  await advertisement.save();
  
  // Send confirmation email to vendor
  const shop = await Shop.findById(advertisement.shopId);
  if (shop && shop.email) {
    await sendMail({
      email: shop.email,
      subject: "Advertisement Approved",
      message: `Your advertisement "${advertisement.title}" has been approved and is now live!`,
    });
  }
  
  res.status(200).json({
    success: true,
    message: "Advertisement approved successfully",
    advertisement,
  });
});

// Reject advertisement (Admin only)
exports.rejectAdvertisement = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  const advertisement = await Advertisement.findById(id);
  
  if (!advertisement) {
    return next(new ErrorHandler("Advertisement not found", 404));
  }
  
  advertisement.status = 'rejected';
  advertisement.rejectionReason = reason;
  advertisement.paymentStatus = 'refunded'; // Initiate refund
  
  await advertisement.save();
  
  // Send notification email to vendor
  const shop = await Shop.findById(advertisement.shopId);
  if (shop && shop.email) {
    await sendMail({
      email: shop.email,
      subject: "Advertisement Rejected",
      message: `Your advertisement "${advertisement.title}" has been rejected. Reason: ${reason}. A refund has been initiated.`,
    });
  }
  
  res.status(200).json({
    success: true,
    message: "Advertisement rejected and refund initiated",
    advertisement,
  });
});

// Get single advertisement by ID (Vendor)
exports.getVendorAdvertisementById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  const advertisement = await Advertisement.findOne({
    _id: id,
    shopId: req.seller._id,
  }).populate('productId', 'name images');
  
  if (!advertisement) {
    return next(new ErrorHandler("Advertisement not found", 404));
  }
  
  res.status(200).json({
    success: true,
    advertisement,
  });
});

// Update advertisement (Vendor - only pending or rejected ads can be edited)
exports.updateAdvertisement = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, autoRenew } = req.body;
  
  const advertisement = await Advertisement.findOne({
    _id: id,
    shopId: req.seller._id,
  });
  
  if (!advertisement) {
    return next(new ErrorHandler("Advertisement not found", 404));
  }
  
  // Only allow editing of pending or rejected ads
  if (!['pending', 'rejected'].includes(advertisement.status)) {
    return next(new ErrorHandler(
      "Only pending or rejected advertisements can be edited. Active ads cannot be modified.",
      400
    ));
  }
  
  // Update fields
  if (title) advertisement.title = title;
  if (description !== undefined) advertisement.description = description;
  if (autoRenew !== undefined) advertisement.autoRenew = autoRenew;
  
  // Handle media update (image or video)
  if (req.file) {
    const isVideo = req.file.mimetype.startsWith('video/');
    
    // Delete old media from cloudinary if exists
    if (advertisement.image?.public_id) {
      await deleteFromCloudinary(advertisement.image.public_id);
    }
    if (advertisement.video?.public_id) {
      await deleteFromCloudinary(advertisement.video.public_id, 'video');
    }
    
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'advertisements',
      resource_type: isVideo ? 'video' : 'image',
    });
    
    if (isVideo) {
      advertisement.video = {
        url: result.url,
        public_id: result.public_id,
      };
      advertisement.image = { url: null, public_id: null };
      advertisement.mediaType = 'video';
    } else {
      advertisement.image = {
        url: result.url,
        public_id: result.public_id,
      };
      advertisement.video = { url: null, public_id: null };
      advertisement.mediaType = 'image';
    }
  }
  
  // If ad was rejected, set back to pending for re-review
  if (advertisement.status === 'rejected') {
    advertisement.status = 'pending';
    advertisement.rejectionReason = null;
  }
  
  await advertisement.save();
  
  res.status(200).json({
    success: true,
    message: advertisement.status === 'pending' 
      ? "Advertisement updated successfully. It will be reviewed by admin."
      : "Advertisement updated successfully.",
    advertisement,
  });
});

// Get all advertisements (Admin)
exports.getAllAdvertisements = catchAsyncErrors(async (req, res, next) => {
  const { status, adType, page = 1, limit = 20 } = req.query;
  
  const query = {};
  if (status) query.status = status;
  if (adType) query.adType = adType;
  
  const advertisements = await Advertisement.find(query)
    .populate('shopId', 'name email avatar')
    .populate('productId', 'name images')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const count = await Advertisement.countDocuments(query);
  
  res.status(200).json({
    success: true,
    advertisements,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    total: count,
  });
});

// Get vendor's advertisements
exports.getVendorAdvertisements = catchAsyncErrors(async (req, res, next) => {
  const advertisements = await Advertisement.find({ shopId: req.seller._id })
    .populate('productId', 'name images')
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    advertisements,
  });
});

// Get active advertisements for display (public)
exports.getActiveAdvertisementsByType = catchAsyncErrors(async (req, res, next) => {
  const { adType } = req.params;
  
  const advertisements = await Advertisement.find({
    adType,
    status: 'active',
    startDate: { $lte: new Date() },
    endDate: { $gt: new Date() },
  })
  .populate('shopId', 'name avatar')
  .populate('productId', 'name images price')
  .sort({ rotationOrder: 1 });
  
  res.status(200).json({
    success: true,
    advertisements,
    rotationInterval: 10000, // 10 seconds
  });
});

// Track ad view
exports.trackAdView = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  await Advertisement.findByIdAndUpdate(id, {
    $inc: { views: 1 },
    lastDisplayedAt: new Date(),
  });
  
  res.status(200).json({
    success: true,
  });
});

// Track ad click
exports.trackAdClick = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  await Advertisement.findByIdAndUpdate(id, {
    $inc: { clicks: 1 },
  });
  
  res.status(200).json({
    success: true,
  });
});

// Get ad analytics (Vendor)
exports.getAdvertisementAnalytics = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  const advertisement = await Advertisement.findOne({
    _id: id,
    shopId: req.seller._id,
  });
  
  if (!advertisement) {
    return next(new ErrorHandler("Advertisement not found", 404));
  }
  
  res.status(200).json({
    success: true,
    analytics: {
      views: advertisement.views,
      clicks: advertisement.clicks,
      clickThroughRate: advertisement.clickThroughRate.toFixed(2) + '%',
      daysRemaining: Math.ceil((advertisement.endDate - new Date()) / (1000 * 60 * 60 * 24)),
      status: advertisement.status,
    },
  });
});

// Cancel advertisement (Vendor)
exports.cancelAdvertisement = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  const advertisement = await Advertisement.findOne({
    _id: id,
    shopId: req.seller._id,
  });
  
  if (!advertisement) {
    return next(new ErrorHandler("Advertisement not found", 404));
  }
  
  if (advertisement.status === 'cancelled' || advertisement.status === 'expired') {
    return next(new ErrorHandler("Advertisement is already cancelled or expired", 400));
  }
  
  advertisement.status = 'cancelled';
  advertisement.autoRenew = false;
  await advertisement.save();
  
  res.status(200).json({
    success: true,
    message: "Advertisement cancelled successfully",
  });
});

// Renew advertisement (Vendor)
exports.renewAdvertisement = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { duration, autoRenew } = req.body;
  
  const originalAd = await Advertisement.findOne({
    _id: id,
    shopId: req.seller._id,
  });
  
  if (!originalAd) {
    return next(new ErrorHandler("Advertisement not found", 404));
  }
  
  // Check if ad can be renewed (expired or cancelled)
  if (!['expired', 'cancelled'].includes(originalAd.status)) {
    return next(new ErrorHandler("Only expired or cancelled ads can be renewed", 400));
  }
  
  // Calculate new price
  const pricing = Advertisement.getPricing();
  const basePrice = pricing[originalAd.adType];
  const discount = Advertisement.calculateDiscount(parseInt(duration));
  const totalMonthlyPrice = basePrice * parseInt(duration);
  const discountAmount = (totalMonthlyPrice * discount) / 100;
  const totalPrice = totalMonthlyPrice - discountAmount;
  
  // Check if this ad type is in free mode
  const plan = adPlansConfig?.plans?.find(p => p.adType === originalAd.adType);
  const isFree = plan?.isFree || false;
  
  // Check if seller has adPreApproval feature (Gold plan)
  const Subscription = require("../model/subscription");
  const subscription = await Subscription.findOne({
    shop: req.seller._id,
    status: { $in: ['active', 'pending'] },
  });
  
  const hasAdPreApproval = subscription?.features?.adPreApproval || false;
  
  // Calculate dates
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + parseInt(duration));
  
  // Determine status based on free mode and pre-approval
  let adStatus = 'awaiting_payment';
  let paymentStatus = 'pending';
  let paymentMethod = undefined;
  
  if (isFree) {
    paymentStatus = 'completed';
    paymentMethod = 'free_testing';
    
    if (hasAdPreApproval) {
      adStatus = 'active'; // Auto-approved for Gold plan
    } else {
      adStatus = 'pending'; // Needs admin approval
    }
  }
  
  // Build the renewed ad data - only include video/image if they exist
  const renewedAdData = {
    shopId: originalAd.shopId,
    adType: originalAd.adType,
    slotNumber: originalAd.slotNumber,
    title: originalAd.title,
    description: originalAd.description,
    mediaType: originalAd.mediaType || 'image',
    linkUrl: originalAd.linkUrl,
    duration: parseInt(duration),
    basePrice: basePrice,
    discount: discount,
    totalPrice: isFree ? 0 : totalPrice,
    startDate,
    endDate,
    autoRenew: autoRenew !== undefined ? autoRenew : originalAd.autoRenew,
    status: adStatus,
    paymentStatus: paymentStatus,
    paymentMethod: paymentMethod,
  };
  
  // Add approval note if auto-approved
  if (isFree && hasAdPreApproval) {
    renewedAdData.approvedAt = new Date();
    renewedAdData.approvalNote = 'Auto-approved (Gold Plan - Ad Pre-Approval feature)';
  }
  
  // Only add image if it exists and has url
  if (originalAd.image && originalAd.image.url) {
    renewedAdData.image = originalAd.image;
  }
  
  // Only add video if it exists and has url
  if (originalAd.video && originalAd.video.url) {
    renewedAdData.video = originalAd.video;
  }
  
  // Only add productId if it exists
  if (originalAd.productId) {
    renewedAdData.productId = originalAd.productId;
  }
  
  // Create a NEW advertisement (renewal creates a fresh ad with same content)
  const renewedAd = new Advertisement(renewedAdData);
  
  await renewedAd.save();
  
  let message = "";
  if (isFree && hasAdPreApproval) {
    message = "Advertisement renewed successfully (FREE MODE + Auto-Approved). Your ad is now LIVE!";
  } else if (isFree) {
    message = "Advertisement renewed successfully (FREE MODE). Awaiting admin approval.";
  } else {
    message = "Advertisement renewed. Please complete payment.";
  }
  
  res.status(200).json({
    success: true,
    message,
    advertisement: renewedAd,
    isFree,
    autoApproved: isFree && hasAdPreApproval,
  });
});

// Update auto-renew setting (Vendor)
exports.updateAutoRenew = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { autoRenew } = req.body;
  
  const advertisement = await Advertisement.findOne({
    _id: id,
    shopId: req.seller._id,
  });
  
  if (!advertisement) {
    return next(new ErrorHandler("Advertisement not found", 404));
  }
  
  advertisement.autoRenew = autoRenew;
  await advertisement.save();
  
  res.status(200).json({
    success: true,
    message: `Auto-renewal ${autoRenew ? 'enabled' : 'disabled'} successfully`,
  });
});

// In-memory storage for ad plans (can be moved to database for persistence)
let adPlansConfig = {
  plans: [
    { adType: "leaderboard", name: "Leaderboard", size: "728x120", slots: 6, basePrice: 600, position: "Top of homepage", visibility: "Very High", isActive: true, isFree: false },
    { adType: "top_sidebar", name: "Top Sidebar", size: "200x120", slots: 6, basePrice: 200, position: "Top sidebar", visibility: "High", isActive: true, isFree: false },
    { adType: "right_sidebar_top", name: "Right Sidebar Top", size: "300x200", slots: 6, basePrice: 300, position: "Right sidebar top", visibility: "High", isActive: true, isFree: false },
    { adType: "right_sidebar_middle", name: "Right Sidebar Middle", size: "300x200", slots: 6, basePrice: 250, position: "Right sidebar middle", visibility: "Medium", isActive: true, isFree: false },
    { adType: "right_sidebar_bottom", name: "Right Sidebar Bottom", size: "300x200", slots: 6, basePrice: 200, position: "Right sidebar bottom", visibility: "Medium", isActive: true, isFree: false },
    { adType: "featured_store", name: "Featured Store", size: "Store Card", slots: null, basePrice: 100, position: "Featured stores section", visibility: "Very High", isActive: true, isFree: false },
    { adType: "featured_product", name: "Featured Product", size: "Product Card", slots: null, basePrice: 50, position: "Featured products section", visibility: "Very High", isActive: true, isFree: false },
    { adType: "newsletter_inclusion", name: "Newsletter Inclusion", size: "Email Banner", slots: null, basePrice: 100, position: "Newsletter emails", visibility: "High", isActive: true, isFree: false },
    { adType: "editorial_writeup", name: "Editorial Write-up", size: "Article", slots: null, basePrice: 300, position: "Blog/Editorial section", visibility: "Very High", isActive: true, isFree: false },
  ],
  durationDiscounts: [
    { months: 1, discount: 0, label: "1 Month" },
    { months: 3, discount: 10, label: "3 Months" },
    { months: 6, discount: 15, label: "6 Months" },
    { months: 12, discount: 20, label: "12 Months" },
  ]
};

// Get ad plans (Admin)
exports.getAdPlans = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({
    success: true,
    plans: adPlansConfig.plans,
    durationDiscounts: adPlansConfig.durationDiscounts,
  });
});

// Update ad plan (Admin)
exports.updateAdPlan = catchAsyncErrors(async (req, res, next) => {
  const { adType, basePrice, slots, isActive } = req.body;
  
  const planIndex = adPlansConfig.plans.findIndex(p => p.adType === adType);
  
  if (planIndex === -1) {
    return next(new ErrorHandler("Ad plan not found", 404));
  }
  
  // Update the plan
  if (basePrice !== undefined) adPlansConfig.plans[planIndex].basePrice = basePrice;
  if (slots !== undefined) adPlansConfig.plans[planIndex].slots = slots;
  if (isActive !== undefined) adPlansConfig.plans[planIndex].isActive = isActive;
  
  res.status(200).json({
    success: true,
    message: "Ad plan updated successfully",
    plan: adPlansConfig.plans[planIndex],
  });
});

// Toggle ad plan active status (Admin)
exports.toggleAdPlan = catchAsyncErrors(async (req, res, next) => {
  const { adType } = req.params;
  const { isActive } = req.body;
  
  const planIndex = adPlansConfig.plans.findIndex(p => p.adType === adType);
  
  if (planIndex === -1) {
    return next(new ErrorHandler("Ad plan not found", 404));
  }
  
  adPlansConfig.plans[planIndex].isActive = isActive;
  
  res.status(200).json({
    success: true,
    message: `${adPlansConfig.plans[planIndex].name} ${isActive ? 'enabled' : 'disabled'} successfully`,
    plan: adPlansConfig.plans[planIndex],
  });
});

// Toggle ad plan free mode (Admin - for testing)
exports.toggleFreePlan = catchAsyncErrors(async (req, res, next) => {
  const { adType } = req.params;
  const { isFree } = req.body;
  
  const planIndex = adPlansConfig.plans.findIndex(p => p.adType === adType);
  
  if (planIndex === -1) {
    return next(new ErrorHandler("Ad plan not found", 404));
  }
  
  adPlansConfig.plans[planIndex].isFree = isFree;
  
  res.status(200).json({
    success: true,
    message: `${adPlansConfig.plans[planIndex].name} is now ${isFree ? 'FREE for testing' : 'PAID (normal mode)'}`,
    plan: adPlansConfig.plans[planIndex],
  });
});

// Update duration discounts (Admin)
exports.updateDurationDiscounts = catchAsyncErrors(async (req, res, next) => {
  const { durationDiscounts } = req.body;
  
  if (!durationDiscounts || !Array.isArray(durationDiscounts)) {
    return next(new ErrorHandler("Invalid duration discounts format", 400));
  }
  
  adPlansConfig.durationDiscounts = durationDiscounts;
  
  res.status(200).json({
    success: true,
    message: "Duration discounts updated successfully",
    durationDiscounts: adPlansConfig.durationDiscounts,
  });
});

// Check for expiring ads and send warnings (Cron job function)
exports.checkExpiringAdvertisements = async () => {
  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const expiringAds = await Advertisement.find({
      status: 'active',
      endDate: { $lte: sevenDaysFromNow, $gt: new Date() },
      expiryWarningEmailed: false,
    }).populate('shopId', 'name email');
    
    for (const ad of expiringAds) {
      if (ad.shopId && ad.shopId.email) {
        const daysRemaining = Math.ceil((ad.endDate - new Date()) / (1000 * 60 * 60 * 24));
        
        await sendMail({
          email: ad.shopId.email,
          subject: "Advertisement Expiring Soon",
          message: `Your advertisement "${ad.title}" will expire in ${daysRemaining} days. ${ad.autoRenew ? 'It will be automatically renewed.' : 'Please renew to continue display.'}`,
        });
        
        ad.expiryWarningEmailed = true;
        await ad.save();
      }
    }
    
    console.log(`Sent expiry warnings for ${expiringAds.length} advertisements`);
  } catch (error) {
    console.error('Error checking expiring advertisements:', error);
  }
};

// Mark expired advertisements (Cron job function)
exports.markExpiredAdvertisements = async () => {
  try {
    const result = await Advertisement.updateMany(
      {
        status: 'active',
        endDate: { $lt: new Date() },
      },
      {
        $set: { status: 'expired' },
      }
    );
    
    console.log(`Marked ${result.modifiedCount} advertisements as expired`);
  } catch (error) {
    console.error('Error marking expired advertisements:', error);
  }
};

// Auto-renew advertisements (Cron job function)
exports.autoRenewAdvertisements = async () => {
  try {
    const expiredAdsWithAutoRenew = await Advertisement.find({
      status: 'expired',
      autoRenew: true,
    }).populate('shopId', 'name email');
    
    for (const ad of expiredAdsWithAutoRenew) {
      // Calculate renewal price
      const pricing = Advertisement.getPricing();
      const basePrice = pricing[ad.adType];
      const discount = Advertisement.calculateDiscount(ad.duration);
      const totalMonthlyPrice = basePrice * ad.duration;
      const discountAmount = (totalMonthlyPrice * discount) / 100;
      const totalPrice = totalMonthlyPrice - discountAmount;
      
      // TODO: Process payment through payment gateway
      // For now, we'll just extend the date
      
      const newEndDate = new Date();
      newEndDate.setMonth(newEndDate.getMonth() + ad.duration);
      
      ad.endDate = newEndDate;
      ad.status = 'active';
      ad.expiryWarningEmailed = false;
      
      ad.renewalHistory.push({
        renewedAt: new Date(),
        duration: ad.duration,
        price: totalPrice,
        paymentId: 'AUTO_RENEW_' + Date.now(),
      });
      
      await ad.save();
      
      // Send confirmation email
      if (ad.shopId && ad.shopId.email) {
        await sendMail({
          email: ad.shopId.email,
          subject: "Advertisement Auto-Renewed",
          message: `Your advertisement "${ad.title}" has been automatically renewed for ${ad.duration} month(s). Total: $${totalPrice}`,
        });
      }
    }
    
    console.log(`Auto-renewed ${expiredAdsWithAutoRenew.length} advertisements`);
  } catch (error) {
    console.error('Error auto-renewing advertisements:', error);
  }
};
