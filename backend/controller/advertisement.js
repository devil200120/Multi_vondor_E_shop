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
  
  const discount = Advertisement.calculateDiscount(duration);
  const totalMonthlyPrice = basePrice * duration;
  const discountAmount = (totalMonthlyPrice * discount) / 100;
  const totalPrice = totalMonthlyPrice - discountAmount;
  
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
    },
  });
});

// Get available slots for a specific ad type
exports.getAvailableSlots = catchAsyncErrors(async (req, res, next) => {
  const { adType } = req.params;
  
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
  
  // Get all active ads for this type
  const activeAds = await Advertisement.find({
    adType,
    status: 'active',
    endDate: { $gt: new Date() },
  }).select('slotNumber');
  
  const occupiedSlots = activeAds.map(ad => ad.slotNumber);
  const totalSlots = 6;
  const availableSlots = [];
  
  for (let i = 1; i <= totalSlots; i++) {
    if (!occupiedSlots.includes(i)) {
      availableSlots.push(i);
    }
  }
  
  res.status(200).json({
    success: true,
    totalSlots,
    occupiedSlots: occupiedSlots.length,
    availableSlots,
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
  
  // Check if slot is available (for banner types)
  const slotTypes = ['leaderboard', 'top_sidebar', 'right_sidebar_top', 
                     'right_sidebar_middle', 'right_sidebar_bottom'];
  
  if (slotTypes.includes(adType) && slotNumber) {
    const existingAd = await Advertisement.findOne({
      adType,
      slotNumber: parseInt(slotNumber),
      status: 'active',
      endDate: { $gt: new Date() },
    });
    
    if (existingAd) {
      return next(new ErrorHandler(`Slot ${slotNumber} is already occupied`, 400));
    }
  }
  
  // Verify product belongs to vendor (for featured_product type)
  if (adType === 'featured_product' && productId) {
    const product = await Product.findById(productId);
    if (!product || product.shopId.toString() !== shop._id.toString()) {
      return next(new ErrorHandler("Product not found or doesn't belong to your shop", 404));
    }
  }
  
  // Handle image upload
  let imageData = null;
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'advertisements',
      resource_type: 'image',
    });
    
    imageData = {
      url: result.url,
      public_id: result.public_id,
    };
  }
  
  // Generate link URL to vendor store
  const linkUrl = `/shop/${shop._id}`;
  
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
    linkUrl,
    productId: productId || null,
    duration: parseInt(duration),
    startDate,
    endDate,
    autoRenew: autoRenew !== undefined ? autoRenew : true,
  });
  
  // Calculate price
  advertisement.calculateTotalPrice();
  
  await advertisement.save();
  
  res.status(201).json({
    success: true,
    message: "Advertisement created successfully. Awaiting payment.",
    advertisement,
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
  
  // Update payment status
  advertisement.paymentStatus = 'completed';
  advertisement.paymentId = paymentId;
  advertisement.paymentMethod = paymentMethod;
  advertisement.status = 'pending'; // Pending admin approval
  
  await advertisement.save();
  
  // Send notification to admin
  // TODO: Implement admin notification
  
  res.status(200).json({
    success: true,
    message: "Payment processed successfully. Advertisement pending admin approval.",
    advertisement,
  });
});

// Approve advertisement (Admin only)
exports.approveAdvertisement = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  const advertisement = await Advertisement.findById(id);
  
  if (!advertisement) {
    return next(new ErrorHandler("Advertisement not found", 404));
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
  const { duration, paymentId, paymentMethod } = req.body;
  
  const advertisement = await Advertisement.findOne({
    _id: id,
    shopId: req.seller._id,
  });
  
  if (!advertisement) {
    return next(new ErrorHandler("Advertisement not found", 404));
  }
  
  // Calculate new price
  const pricing = Advertisement.getPricing();
  const basePrice = pricing[advertisement.adType];
  const discount = Advertisement.calculateDiscount(duration);
  const totalMonthlyPrice = basePrice * duration;
  const discountAmount = (totalMonthlyPrice * discount) / 100;
  const totalPrice = totalMonthlyPrice - discountAmount;
  
  // Extend end date
  const newEndDate = new Date(advertisement.endDate);
  newEndDate.setMonth(newEndDate.getMonth() + parseInt(duration));
  
  advertisement.endDate = newEndDate;
  advertisement.status = 'active';
  advertisement.duration = duration;
  advertisement.paymentStatus = 'completed';
  
  // Add to renewal history
  advertisement.renewalHistory.push({
    renewedAt: new Date(),
    duration,
    price: totalPrice,
    paymentId,
  });
  
  await advertisement.save();
  
  res.status(200).json({
    success: true,
    message: "Advertisement renewed successfully",
    advertisement,
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
