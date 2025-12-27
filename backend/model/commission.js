const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
  // Transaction details
  totalAmount: {
    type: Number,
    required: true,
  },
  // Commission breakdown
  platformCommissionPercent: {
    type: Number,
    default: 10, // 10% to MoC
  },
  platformCommissionAmount: {
    type: Number,
    required: true,
  },
  vendorAmount: {
    type: Number,
    required: true, // 90% to vendor
  },
  // Minimum monthly payment
  minimumMonthlyPayment: {
    type: Number,
    default: 25, // $25 minimum per month
  },
  isMinimumPaymentApplied: {
    type: Boolean,
    default: false,
  },
  // Payment status
  vendorPaymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed'],
    default: 'pending',
  },
  platformPaymentStatus: {
    type: String,
    enum: ['pending', 'collected', 'failed'],
    default: 'pending',
  },
  // Refund handling
  refundStatus: {
    type: String,
    enum: ['none', 'partial', 'full'],
    default: 'none',
  },
  refundAmount: {
    type: Number,
    default: 0,
  },
  refundDate: {
    type: Date,
  },
  // Payment dates
  transactionDate: {
    type: Date,
    default: Date.now,
  },
  vendorPaymentDate: {
    type: Date,
  },
  platformPaymentDate: {
    type: Date,
  },
  // PayPal transaction IDs
  paypalOrderId: {
    type: String,
  },
  paypalPayerId: {
    type: String,
  },
  vendorPayoutId: {
    type: String,
  },
  // Notes
  notes: {
    type: String,
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

// Update timestamp on save
commissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to calculate commission split
commissionSchema.statics.calculateCommission = function(totalAmount) {
  const platformCommissionPercent = 10;
  const platformCommissionAmount = (totalAmount * platformCommissionPercent) / 100;
  const vendorAmount = totalAmount - platformCommissionAmount;
  
  return {
    totalAmount,
    platformCommissionPercent,
    platformCommissionAmount,
    vendorAmount,
  };
};

module.exports = mongoose.model("Commission", commissionSchema);
