const mongoose = require("mongoose");

const videoBannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter video banner title"],
    maxLength: [100, "Title cannot exceed 100 characters"]
  },
  description: {
    type: String,
    maxLength: [500, "Description cannot exceed 500 characters"]
  },
  videoUrl: {
    type: String,
    required: [true, "Please provide video URL"],
  },
  thumbnailUrl: {
    type: String,
    required: [true, "Please provide thumbnail image URL"],
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, "Please select a target product"]
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: false, // Explicitly set as not required
    default: null // null means admin created
  },
  isActive: {
    type: Boolean,
    default: false, // Always default to false, set to true only when approved
    validate: {
      validator: function(v) {
        // Skip validation during updates if approval status is being modified simultaneously
        if (!this.isNew && this.isModified('approvalStatus')) {
          return true;
        }
        // If approvalStatus is not approved, isActive must be false
        if (this.approvalStatus !== 'approved' && v === true) {
          return false;
        }
        return true;
      },
      message: 'Banner can only be active when approval status is approved'
    }
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null // null means no expiry
  },
  clickCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  targetAudience: {
    type: String,
    enum: ['all', 'new_users', 'existing_users'],
    default: 'all'
  },
  createdBy: {
    type: String,
    enum: ['admin', 'seller'],
    required: true
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending', // Always default to pending, override in controller for admin
    validate: {
      validator: function(v) {
        // Additional validation: if createdBy is seller, must be pending initially
        if (this.createdBy === 'seller' && this.isNew && v !== 'pending') {
          return false;
        }
        return true;
      },
      message: 'Seller-created banners must start with pending status'
    }
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
videoBannerSchema.index({ isActive: 1, approvalStatus: 1, priority: -1 });
videoBannerSchema.index({ shopId: 1 });
videoBannerSchema.index({ productId: 1 });

// Pre-save hook to enforce business logic
videoBannerSchema.pre('save', function(next) {
  // Enforce seller banners start as pending and inactive (only for new documents)
  if (this.createdBy === 'seller' && this.isNew) {
    if (this.approvalStatus !== 'pending') {
      this.approvalStatus = 'pending';
    }
    if (this.isActive !== false) {
      this.isActive = false;
    }
  }
  
  // Enforce business rule: only approved banners can be active (skip during simultaneous updates)
  if (!this.isModified('approvalStatus') && this.approvalStatus !== 'approved' && this.isActive === true) {
    this.isActive = false;
  }
  
  // Auto-activate approved banners (unless explicitly set to false)
  if (this.approvalStatus === 'approved' && this.isActive === false && !this.isModified('isActive')) {
    this.isActive = true;
  }
  
  next();
});

module.exports = mongoose.model("VideoBanner", videoBannerSchema);