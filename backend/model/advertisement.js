const mongoose = require("mongoose");

const advertisementSchema = new mongoose.Schema({
  // Vendor Information
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: [true, "Shop ID is required"],
  },
  
  // Ad Type & Placement
  adType: {
    type: String,
    enum: [
      'leaderboard',           // 728x120
      'top_sidebar',           // 200x120
      'right_sidebar_top',     // 300x200
      'right_sidebar_middle',  // 300x200
      'right_sidebar_bottom',  // 300x200
      'featured_store',
      'featured_product',
      'newsletter_inclusion',
      'editorial_writeup'
    ],
    required: [true, "Ad type is required"],
  },
  
  // Slot Number (for banner types with multiple slots)
  slotNumber: {
    type: Number,
    min: 1,
    max: 6,
    default: null, // null for non-banner ads
  },
  
  // Ad Content
  title: {
    type: String,
    required: [true, "Ad title is required"],
    maxLength: [100, "Title cannot exceed 100 characters"],
  },
  
  description: {
    type: String,
    maxLength: [500, "Description cannot exceed 500 characters"],
  },
  
  // Image ad (required for banner types)
  image: {
    url: {
      type: String,
    },
    public_id: {
      type: String,
    },
  },
  
  // Video ad (alternative to image for banner types)
  video: {
    url: {
      type: String,
    },
    public_id: {
      type: String,
    },
  },
  
  // Media type - image or video
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image',
  },
  
  // Image dimensions validation
  imageSize: {
    width: Number,
    height: Number,
  },
  
  // Link - must link to vendor store or product
  linkUrl: {
    type: String,
    required: [true, "Link URL is required"],
    validate: {
      validator: async function(url) {
        // Validate that URL links to vendor's store or a product
        const Shop = mongoose.model('Shop');
        const Product = mongoose.model('Product');
        const shop = await Shop.findById(this.shopId);
        if (!shop) return false;
        
        // URL can be shop link or product link
        if (url.includes(`/shop/${shop._id}`) || url.includes(`shop=${shop._id}`)) {
          return true;
        }
        
        // Check if it's a product link and the product belongs to this shop
        const productMatch = url.match(/\/product\/([a-f0-9]{24})/i);
        if (productMatch) {
          const productId = productMatch[1];
          const product = await Product.findById(productId);
          if (product && product.shopId.toString() === shop._id.toString()) {
            return true;
          }
        }
        
        return false;
      },
      message: 'Ad link must point to vendor store or vendor product only'
    }
  },
  
  // Featured Product (for featured_product ad type)
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: function() {
      return this.adType === 'featured_product';
    },
  },
  
  // Duration & Pricing
  duration: {
    type: Number,
    enum: [1, 3, 6, 12], // months
    required: [true, "Duration is required"],
  },
  
  basePrice: {
    type: Number,
    required: [true, "Base price is required"],
  },
  
  discount: {
    type: Number,
    default: 0, // percentage
  },
  
  totalPrice: {
    type: Number,
    required: [true, "Total price is required"],
  },
  
  // Dates
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
  },
  
  endDate: {
    type: Date,
    required: [true, "End date is required"],
  },
  
  // Auto-renewal
  autoRenew: {
    type: Boolean,
    default: true,
  },
  
  // Status
  status: {
    type: String,
    enum: ['awaiting_payment', 'pending', 'active', 'expired', 'cancelled', 'rejected'],
    default: 'awaiting_payment',
  },
  
  // Admin approval
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  
  approvedAt: {
    type: Date,
    default: null,
  },
  
  rejectionReason: {
    type: String,
    default: null,
  },
  
  // Payment
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  
  paymentId: {
    type: String,
  },
  
  paymentMethod: {
    type: String,
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0,
  },
  
  clicks: {
    type: Number,
    default: 0,
  },
  
  clickThroughRate: {
    type: Number,
    default: 0,
  },
  
  // Rotation settings (for banner ads)
  rotationOrder: {
    type: Number,
    default: 0,
  },
  
  lastDisplayedAt: {
    type: Date,
    default: null,
  },
  
  // Notifications
  expiryWarningEmailed: {
    type: Boolean,
    default: false,
  },
  
  // Renewal history
  renewalHistory: [{
    renewedAt: Date,
    duration: Number,
    price: Number,
    paymentId: String,
  }],
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for performance
advertisementSchema.index({ shopId: 1, status: 1 });
advertisementSchema.index({ adType: 1, status: 1, startDate: 1 });
advertisementSchema.index({ status: 1, endDate: 1 });
advertisementSchema.index({ adType: 1, slotNumber: 1, status: 1 });

// Pre-save middleware
advertisementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate CTR
  if (this.views > 0) {
    this.clickThroughRate = (this.clicks / this.views) * 100;
  }
  
  // Validate image dimensions based on ad type
  if (this.imageSize && this.imageSize.width && this.imageSize.height) {
    const validSizes = {
      'leaderboard': { width: 728, height: 120 },
      'top_sidebar': { width: 200, height: 120 },
      'right_sidebar_top': { width: 300, height: 200 },
      'right_sidebar_middle': { width: 300, height: 200 },
      'right_sidebar_bottom': { width: 300, height: 200 },
    };
    
    if (validSizes[this.adType]) {
      const expected = validSizes[this.adType];
      if (this.imageSize.width !== expected.width || this.imageSize.height !== expected.height) {
        return next(new Error(`Image dimensions must be ${expected.width}x${expected.height} for ${this.adType}`));
      }
    }
  }
  
  next();
});

// Static method to get pricing
advertisementSchema.statics.getPricing = function() {
  return {
    leaderboard: 600,
    top_sidebar: 200,
    right_sidebar_top: 300,
    right_sidebar_middle: 250,
    right_sidebar_bottom: 200,
    featured_store: 100,
    featured_product: 50,
    newsletter_inclusion: 100,
    editorial_writeup: 300,
  };
};

// Static method to calculate discount
advertisementSchema.statics.calculateDiscount = function(duration) {
  const discounts = {
    1: 0,   // 0% discount
    3: 10,  // 10% discount
    6: 15,  // 15% discount
    12: 20, // 20% discount
  };
  return discounts[duration] || 0;
};

// Method to calculate total price
advertisementSchema.methods.calculateTotalPrice = function() {
  const Advertisement = mongoose.model('Advertisement');
  const pricing = Advertisement.getPricing();
  const basePrice = pricing[this.adType];
  
  if (!basePrice) {
    throw new Error(`Invalid ad type: ${this.adType}`);
  }
  
  this.basePrice = basePrice;
  const discount = Advertisement.calculateDiscount(this.duration);
  this.discount = discount;
  
  const totalMonthlyPrice = basePrice * this.duration;
  const discountAmount = (totalMonthlyPrice * discount) / 100;
  this.totalPrice = totalMonthlyPrice - discountAmount;
  
  return this.totalPrice;
};

// Method to check if ad is expired
advertisementSchema.methods.isExpired = function() {
  return this.endDate < new Date();
};

// Method to check if ad is about to expire (within 7 days)
advertisementSchema.methods.isExpiringSoon = function() {
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  return this.endDate <= sevenDaysFromNow && this.endDate > new Date();
};

module.exports = mongoose.model("Advertisement", advertisementSchema);
