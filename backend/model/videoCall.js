const mongoose = require("mongoose");

const videoCallSchema = new mongoose.Schema({
  callId: {
    type: String,
    required: true,
    unique: true,
  },
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
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false, // Optional if call is related to an order
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false, // Optional if call is related to a specific product
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: false, // Optional if call is related to a conversation
  },
  callType: {
    type: String,
    enum: ['order_support', 'product_inquiry', 'general_support', 'sales'],
    required: true,
  },
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'accepted', 'declined', 'ended', 'missed', 'failed'],
    default: 'initiated',
  },
  initiatedBy: {
    type: String,
    enum: ['seller', 'customer'],
    required: true,
  },
  startTime: {
    type: Date,
    default: null,
  },
  endTime: {
    type: Date,
    default: null,
  },
  duration: {
    type: Number, // in seconds
    default: 0,
  },
  callQuality: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    required: false,
  },
  notes: {
    type: String,
    default: "",
  },
  recordingUrl: {
    type: String,
    default: null,
  },
  scheduledFor: {
    type: Date,
    default: null, // For scheduled calls
  },
  isScheduled: {
    type: Boolean,
    default: false,
  },
  metadata: {
    customerLocation: String,
    sellerLocation: String,
    deviceInfo: {
      customer: String,
      seller: String,
    },
    networkInfo: {
      customer: String,
      seller: String,
    },
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
videoCallSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate duration when call ends
videoCallSchema.methods.calculateDuration = function() {
  if (this.startTime && this.endTime) {
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  }
  return this.duration;
};

// Index for better performance
videoCallSchema.index({ seller: 1, createdAt: -1 });
videoCallSchema.index({ customer: 1, createdAt: -1 });
videoCallSchema.index({ status: 1, createdAt: -1 });
videoCallSchema.index({ callId: 1 });

module.exports = mongoose.model("VideoCall", videoCallSchema);