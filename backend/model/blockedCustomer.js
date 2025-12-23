const mongoose = require("mongoose");

const blockedCustomerSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  blockedAt: {
    type: Date,
    default: Date.now,
  },
  reason: {
    type: String,
    enum: ['spam_calls', 'inappropriate_behavior', 'abusive_language', 'other'],
    default: 'other',
  },
  notes: {
    type: String,
    default: "",
  },
  lastCallId: {
    type: String,
    ref: 'VideoCall',
    required: false, // The call ID that led to the block
  },
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true, // The seller who blocked the customer
  },
  isActive: {
    type: Boolean,
    default: true, // Allow unblocking by setting to false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
blockedCustomerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compound index to ensure one block record per seller-customer pair
blockedCustomerSchema.index({ seller: 1, customer: 1 }, { unique: true });

// Index for better performance
blockedCustomerSchema.index({ seller: 1, isActive: 1, createdAt: -1 });
blockedCustomerSchema.index({ customer: 1, isActive: 1 });

// Static method to check if customer is blocked by seller
blockedCustomerSchema.statics.isCustomerBlocked = async function(sellerId, customerId) {
  try {
    const blockedRecord = await this.findOne({
      seller: sellerId,
      customer: customerId,
      isActive: true
    });
    return !!blockedRecord;
  } catch (error) {
    console.error('Error checking if customer is blocked:', error);
    return false;
  }
};

// Static method to get blocked customers for a seller
blockedCustomerSchema.statics.getBlockedCustomers = async function(sellerId, options = {}) {
  try {
    const { page = 1, limit = 20 } = options;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const blockedCustomers = await this.find({
      seller: sellerId,
      isActive: true
    })
    .populate('customer', 'name email avatar phoneNumber')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await this.countDocuments({
      seller: sellerId,
      isActive: true
    });

    return {
      blockedCustomers,
      total,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      }
    };
  } catch (error) {
    console.error('Error getting blocked customers:', error);
    throw error;
  }
};

module.exports = mongoose.model("BlockedCustomer", blockedCustomerSchema);