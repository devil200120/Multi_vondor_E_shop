const VideoCall = require("../model/videoCall");
const User = require("../model/user");
const Shop = require("../model/shop");
const Order = require("../model/order");
const Conversation = require("../model/conversation");
const BlockedCustomer = require("../model/blockedCustomer");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { v4: uuidv4 } = require('uuid');
const axios = require("axios");

// Helper function to check if users are online via socket server
const checkOnlineStatus = async (userIds) => {
  try {
    const socketServerUrl = process.env.SOCKET_SERVER_URL 
    const response = await axios.get(`${socketServerUrl}/online-users`);
    const onlineUsers = response.data.users || [];
    const onlineUserIds = new Set(onlineUsers.map(u => u.userId));
    
    return userIds.map(userId => ({
      userId: userId,
      isOnline: onlineUserIds.has(userId.toString())
    }));
  } catch (error) {
    console.error("Failed to check online status:", error.message);
    // Return all users as offline if socket server is not reachable
    return userIds.map(userId => ({ userId, isOnline: false }));
  }
};

// Initiate a video call (can be called by both seller and customer)
const initiateVideoCall = catchAsyncErrors(async (req, res, next) => {
  try {
    const {
      
      customerId,
      sellerId,
      productId,
      orderId,
      conversationId,
      callType,
      notes,
      scheduledFor,
    } = req.body;

    let initiatorId, initiatedBy, targetId;

    // Determine who is initiating the call
    if (req.seller) {
      // Seller initiating call
      initiatorId = req.seller._id;
      initiatedBy = 'seller';
      targetId = customerId;

      // Validate customer exists
      const customer = await User.findById(customerId);
      if (!customer) {
        return next(new ErrorHandler("Customer not found", 404));
      }

      // Validate order if provided
      if (orderId) {
        const order = await Order.findById(orderId);
        if (!order) {
          return next(new ErrorHandler("Order not found", 404));
        }
        
        // Check if seller owns this order
        if (order.seller.toString() !== initiatorId.toString()) {
          return next(new ErrorHandler("You can only call customers for your orders", 403));
        }
      }
    } else if (req.user) {
      // Customer initiating call
      initiatorId = req.user._id;
      initiatedBy = 'customer';
      targetId = sellerId;

      // Validate seller exists
      const seller = await Shop.findById(sellerId);
      if (!seller) {
        return next(new ErrorHandler("Seller not found", 404));
      }

      // Check if customer is blocked by this seller
      const isBlocked = await BlockedCustomer.isCustomerBlocked(sellerId, initiatorId);
      if (isBlocked) {
        return next(new ErrorHandler("You are blocked from calling this seller", 403));
      }

      // For customer-initiated calls, validate product if provided
      if (productId) {
        const Product = require("../model/product");
        const product = await Product.findById(productId);
        if (!product) {
          return next(new ErrorHandler("Product not found", 404));
        }
        
        // Check if product belongs to the seller
        if (product.shop._id.toString() !== sellerId.toString()) {
          return next(new ErrorHandler("Product does not belong to this seller", 403));
        }
      }
    } else {
      return next(new ErrorHandler("Authentication required", 401));
    }

    // Generate unique call ID
    const callId = uuidv4();

    const videoCallData = {
      callId,
      seller: initiatedBy === 'seller' ? initiatorId : sellerId,
      customer: initiatedBy === 'customer' ? initiatorId : customerId,
      callType: callType || 'general_support',
      initiatedBy,
      notes: notes || '',
      isScheduled: !!scheduledFor,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      status: scheduledFor ? 'scheduled' : 'initiated',
    };

    if (orderId) videoCallData.orderId = orderId;
    if (conversationId) videoCallData.conversationId = conversationId;
    if (productId) videoCallData.productId = productId;

    const videoCall = await VideoCall.create(videoCallData);

    console.log('📞 [VideoCall] Created call record:', {
      callId: videoCall.callId,
      seller: videoCall.seller,
      customer: videoCall.customer,
      initiatedBy: videoCall.initiatedBy,
      productId: videoCall.productId,
      status: videoCall.status
    });

    // Populate the video call data
    await videoCall.populate('seller', 'name email avatar phoneNumber');
    await videoCall.populate('customer', 'name email avatar phoneNumber');
    if (orderId) await videoCall.populate('orderId', 'orderNumber totalPrice');
    if (productId) {
      const Product = require("../model/product");
      await videoCall.populate('productId', 'name images');
    }

    res.status(201).json({
      success: true,
      videoCall,
      message: scheduledFor ? "Video call scheduled successfully" : "Video call initiated successfully",
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Accept/Decline video call (Both customer and seller can respond)
const respondToVideoCall = catchAsyncErrors(async (req, res, next) => {
  try {
    const { callId, response, declineReason } = req.body; // Get callId from body
    
    const videoCall = await VideoCall.findOne({ callId });
    if (!videoCall) {
      return next(new ErrorHandler("Video call not found", 404));
    }

    // Check if user is authorized to respond to this call
    const isCustomer = req.user && videoCall.customer.toString() === req.user._id.toString();
    const isSeller = req.seller && videoCall.seller.toString() === req.seller._id.toString();
    
    if (!isCustomer && !isSeller) {
      return next(new ErrorHandler("Unauthorized to respond to this call", 403));
    }

    if (response === 'accepted') {
      videoCall.status = 'accepted';
      videoCall.startTime = new Date();
    } else if (response === 'declined') {
      videoCall.status = 'declined';
      videoCall.endTime = new Date();
      if (declineReason) {
        videoCall.notes += `\nDecline reason: ${declineReason}`;
      }
    }

    await videoCall.save();

    res.status(200).json({
      success: true,
      call: videoCall, // Changed from videoCall to call
      message: response === 'accepted' ? "Call accepted" : "Call declined",
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// End video call
const endVideoCall = catchAsyncErrors(async (req, res, next) => {
  try {
    const { callId, callQuality, notes, recordingUrl } = req.body;

    const videoCall = await VideoCall.findOne({ callId });
    if (!videoCall) {
      return next(new ErrorHandler("Video call not found", 404));
    }

    // Check if user is authorized to end this call
    const isCustomer = req.user && videoCall.customer.toString() === req.user._id.toString();
    const isSeller = req.seller && videoCall.seller.toString() === req.seller._id.toString();
    
    if (!isCustomer && !isSeller) {
      return next(new ErrorHandler("Unauthorized to end this call", 403));
    }

    videoCall.status = 'ended'; // Use 'ended' instead of 'completed' to match enum
    videoCall.endTime = new Date();
    
    // Calculate duration if we have both start and end times
    if (videoCall.startTime && videoCall.endTime) {
      const durationMs = videoCall.endTime - videoCall.startTime;
      videoCall.duration = Math.floor(durationMs / 1000); // Duration in seconds
    }
    
    if (callQuality) videoCall.analytics.callQuality = callQuality;
    if (notes) videoCall.notes += `\n${notes}`;
    if (recordingUrl) videoCall.recordingUrl = recordingUrl;

    await videoCall.save();

    res.status(200).json({
      success: true,
      call: videoCall, // Changed from videoCall to call
      message: "Video call ended successfully",
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get video call history for seller
const getSellerVideoCallHistory = catchAsyncErrors(async (req, res, next) => {
  try {
    const sellerId = req.params.sellerId || req.seller._id;
    const { page = 1, limit = 20, status, callType, dateFrom, dateTo } = req.query;

    // Verify the seller is requesting their own data
    if (req.seller._id.toString() !== sellerId.toString()) {
      return next(new ErrorHandler("Unauthorized access", 403));
    }

    let query = { seller: sellerId };

    if (status) query.status = status;
    if (callType) query.callType = callType;
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const videoCalls = await VideoCall.find(query)
      .populate('customer', 'name email avatar')
      .populate('orderId', 'orderNumber totalPrice products')
      .populate('productId', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log('📞 [VideoCall] Seller history query:', query);
    console.log('📞 [VideoCall] Found calls for seller:', videoCalls.length);
    videoCalls.forEach(call => {
      console.log('📞 [VideoCall] Call:', {
        callId: call.callId,
        initiatedBy: call.initiatedBy,
        status: call.status,
        customer: call.customer?.name,
        productId: call.productId?._id
      });
    });

    const total = await VideoCall.countDocuments(query);

    res.status(200).json({
      success: true,
      calls: videoCalls, // Changed from videoCalls to calls to match frontend
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get video call history for customer
const getCustomerVideoCallHistory = catchAsyncErrors(async (req, res, next) => {
  try {
    const customerId = req.params.customerId || req.user._id;
    const { page = 1, limit = 20, status } = req.query;

    // Verify the customer is requesting their own data
    if (req.user._id.toString() !== customerId.toString()) {
      return next(new ErrorHandler("Unauthorized access", 403));
    }

    let query = { customer: customerId };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const videoCalls = await VideoCall.find(query)
      .populate('seller', 'name email avatar')
      .populate('orderId', 'orderNumber totalPrice products')
      .populate('productId', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await VideoCall.countDocuments(query);

    res.status(200).json({
      success: true,
      calls: videoCalls, // Changed from videoCalls to calls to match frontend
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get customers eligible for video calls (seller's customers)
const getEligibleCustomers = catchAsyncErrors(async (req, res, next) => {
  try {
    const sellerId = req.params.sellerId || req.seller._id;
    const { search, type = 'orders' } = req.query;

    // Verify the seller is requesting their own data
    if (req.seller._id.toString() !== sellerId.toString()) {
      return next(new ErrorHandler("Unauthorized access", 403));
    }

    let customers = [];

    if (type === 'orders') {
      // Get customers who have ordered from this seller
      const orders = await Order.find({ shopId: sellerId })
        .populate('user', 'name email avatar phoneNumber')
        .sort({ createdAt: -1 });

      // Remove duplicates and create customer list with order info
      const customerMap = new Map();
      
      orders.forEach(order => {
        if (order.user) {
          const customerId = order.user._id.toString();
          if (!customerMap.has(customerId)) {
            customerMap.set(customerId, {
              _id: order.user._id,
              name: order.user.name,
              email: order.user.email,
              avatar: order.user.avatar,
              phoneNumber: order.user.phoneNumber,
              lastOrderId: order._id,
              lastOrderNumber: order.orderNumber,
              lastOrderDate: order.createdAt,
              lastOrderAmount: order.totalPrice,
              totalOrders: 1,
              totalSpent: order.totalPrice,
              isOnline: false, // Will be updated below
              recentOrders: [{
                _id: order._id,
                orderNumber: order.orderNumber,
                totalPrice: order.totalPrice,
                createdAt: order.createdAt,
                orderStatus: order.status
              }]
            });
          } else {
            const existing = customerMap.get(customerId);
            existing.totalOrders += 1;
            existing.totalSpent += order.totalPrice;
            existing.recentOrders.push({
              _id: order._id,
              orderNumber: order.orderNumber,
              totalPrice: order.totalPrice,
              createdAt: order.createdAt,
              orderStatus: order.status
            });
            // Update if this order is more recent
            if (order.createdAt > existing.lastOrderDate) {
              existing.lastOrderId = order._id;
              existing.lastOrderNumber = order.orderNumber;
              existing.lastOrderDate = order.createdAt;
              existing.lastOrderAmount = order.totalPrice;
            }
          }
        }
      });

      customers = Array.from(customerMap.values());
      // Sort recent orders and limit to 5 per customer
      customers.forEach(customer => {
        customer.recentOrders = customer.recentOrders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
      });
      
      // Update online status for all customers
      if (customers.length > 0) {
        const userIds = customers.map(c => c._id.toString());
        const onlineStatuses = await checkOnlineStatus(userIds);
        const onlineStatusMap = new Map(onlineStatuses.map(s => [s.userId, s.isOnline]));
        
        customers.forEach(customer => {
          customer.isOnline = onlineStatusMap.get(customer._id.toString()) || false;
        });
      }
    }

    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      customers = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm) ||
        (customer.phoneNumber && customer.phoneNumber.includes(searchTerm))
      );
    }

    res.status(200).json({
      success: true,
      customers,
      total: customers.length,
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get video call analytics for seller
const getVideoCallAnalytics = catchAsyncErrors(async (req, res, next) => {
  try {
    const sellerId = req.seller._id;
    const { dateFrom, dateTo } = req.query;

    let dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.createdAt.$lte = new Date(dateTo);
    }

    const baseQuery = { seller: sellerId, ...dateFilter };

    // Get analytics data
    const [
      totalCalls,
      acceptedCalls,
      declinedCalls,
      endedCalls,
      averageDuration,
      callsByType,
      callsByStatus,
    ] = await Promise.all([
      VideoCall.countDocuments(baseQuery),
      VideoCall.countDocuments({ ...baseQuery, status: 'accepted' }),
      VideoCall.countDocuments({ ...baseQuery, status: 'declined' }),
      VideoCall.countDocuments({ ...baseQuery, status: 'ended' }),
      VideoCall.aggregate([
        { $match: { ...baseQuery, status: 'ended', duration: { $gt: 0 } } },
        { $group: { _id: null, avgDuration: { $avg: "$duration" } } }
      ]),
      VideoCall.aggregate([
        { $match: baseQuery },
        { $group: { _id: "$callType", count: { $sum: 1 } } }
      ]),
      VideoCall.aggregate([
        { $match: baseQuery },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
    ]);

    const analytics = {
      totalCalls,
      acceptedCalls,
      declinedCalls,
      endedCalls,
      averageDuration: averageDuration[0]?.avgDuration || 0,
      acceptanceRate: totalCalls > 0 ? ((acceptedCalls / totalCalls) * 100).toFixed(2) : 0,
      completionRate: acceptedCalls > 0 ? ((endedCalls / acceptedCalls) * 100).toFixed(2) : 0,
      callsByType: callsByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      callsByStatus: callsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };

    res.status(200).json({
      success: true,
      analytics,
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get seller information for customer-initiated calls
const getSellerInfo = catchAsyncErrors(async (req, res, next) => {
  try {
    const { sellerId } = req.params;

    const seller = await Shop.findById(sellerId).select('name email avatar phoneNumber');
    if (!seller) {
      return next(new ErrorHandler("Seller not found", 404));
    }

    res.status(200).json({
      success: true,
      seller,
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get product seller information
const getProductSellerInfo = catchAsyncErrors(async (req, res, next) => {
  try {
    const { productId } = req.params;

    const Product = require("../model/product");
    const product = await Product.findById(productId);
    
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // For seller products, get the actual seller shop info
    let sellerInfo;
    if (product.isSellerProduct && product.sellerShop) {
      sellerInfo = await Shop.findById(product.sellerShop).select('name email avatar phoneNumber');
    } else {
      // For platform products, use the shop info
      sellerInfo = await Shop.findById(product.shop._id).select('name email avatar phoneNumber');
    }

    if (!sellerInfo) {
      return next(new ErrorHandler("Seller information not found", 404));
    }

    res.status(200).json({
      success: true,
      seller: sellerInfo,
      product: {
        _id: product._id,
        name: product.name,
        images: product.images,
        isSellerProduct: product.isSellerProduct
      }
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Block a customer from calling the seller
const blockCustomer = catchAsyncErrors(async (req, res, next) => {
  try {
    const { customerId, reason, notes, callId } = req.body;
    const sellerId = req.seller._id;

    // Validate customer exists
    const customer = await User.findById(customerId);
    if (!customer) {
      return next(new ErrorHandler("Customer not found", 404));
    }

    // Check if customer is already blocked
    const existingBlock = await BlockedCustomer.findOne({
      seller: sellerId,
      customer: customerId,
      isActive: true
    });

    if (existingBlock) {
      return next(new ErrorHandler("Customer is already blocked", 400));
    }

    // Create blocking record
    const blockData = {
      seller: sellerId,
      customer: customerId,
      reason: reason || 'other',
      notes: notes || '',
      blockedBy: sellerId,
      lastCallId: callId
    };

    const blockedCustomer = await BlockedCustomer.create(blockData);
    await blockedCustomer.populate('customer', 'name email avatar');

    console.log(`📞 [VideoCall] Customer ${customerId} blocked by seller ${sellerId}`);

    res.status(201).json({
      success: true,
      message: "Customer blocked successfully",
      blockedCustomer
    });

  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return next(new ErrorHandler("Customer is already blocked", 400));
    }
    return next(new ErrorHandler(error.message, 500));
  }
});

// Unblock a customer
const unblockCustomer = catchAsyncErrors(async (req, res, next) => {
  try {
    const { customerId } = req.body;
    const sellerId = req.seller._id;

    // Find and update the blocking record
    const blockedCustomer = await BlockedCustomer.findOneAndUpdate(
      {
        seller: sellerId,
        customer: customerId,
        isActive: true
      },
      {
        isActive: false,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('customer', 'name email avatar');

    if (!blockedCustomer) {
      return next(new ErrorHandler("Customer is not blocked", 404));
    }

    console.log(`📞 [VideoCall] Customer ${customerId} unblocked by seller ${sellerId}`);

    res.status(200).json({
      success: true,
      message: "Customer unblocked successfully",
      unblockedCustomer: blockedCustomer
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get blocked customers list for seller
const getBlockedCustomers = catchAsyncErrors(async (req, res, next) => {
  try {
    const sellerId = req.seller._id;
    const { page = 1, limit = 20 } = req.query;

    const result = await BlockedCustomer.getBlockedCustomers(sellerId, { page, limit });

    res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Check if customer is blocked
const checkCustomerBlocked = catchAsyncErrors(async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const sellerId = req.seller._id;

    const isBlocked = await BlockedCustomer.isCustomerBlocked(sellerId, customerId);

    res.status(200).json({
      success: true,
      isBlocked,
      customerId,
      sellerId
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

module.exports = {
  initiateVideoCall,
  respondToVideoCall,
  endVideoCall,
  getSellerVideoCallHistory,
  getCustomerVideoCallHistory,
  getEligibleCustomers,
  getVideoCallAnalytics,
  getSellerInfo,
  getProductSellerInfo,
  blockCustomer,
  unblockCustomer,
  getBlockedCustomers,
  checkCustomerBlocked,
};