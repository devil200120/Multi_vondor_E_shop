const mongoose = require("mongoose");

const shippingCalculationSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // Location data
  origin: {
    address: String,
    latitude: Number,
    longitude: Number,
    pincode: String
  },
  destination: {
    address: String,
    latitude: Number,
    longitude: Number,
    pincode: String
  },
  // Distance and time data from Google Maps
  distance: {
    value: Number, // Distance in meters
    text: String   // Human readable distance
  },
  duration: {
    value: Number, // Duration in seconds
    text: String   // Human readable duration
  },
  durationInTraffic: {
    value: Number, // Duration with traffic in seconds
    text: String   // Human readable duration with traffic
  },
  // Shipping calculation breakdown
  calculation: {
    baseRate: Number,
    distanceRate: Number,
    peakHourMultiplier: Number,
    weightMultiplier: Number,
    expressMultiplier: Number,
    customAreaRate: Number,
    subtotal: Number,
    finalAmount: Number
  },
  // Order details
  orderValue: Number,
  totalWeight: Number,
  isExpress: {
    type: Boolean,
    default: false
  },
  isPeakHour: {
    type: Boolean,
    default: false
  },
  isFreeShipping: {
    type: Boolean,
    default: false
  },
  // API response cache
  googleMapsResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  calculatedAt: {
    type: Date,
    default: Date.now
  },
  // TTL for cache (24 hours)
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // 24 hours in seconds
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
shippingCalculationSchema.index({ orderId: 1 });
shippingCalculationSchema.index({ shopId: 1, userId: 1 });
shippingCalculationSchema.index({ calculatedAt: 1 });
shippingCalculationSchema.index({ expiresAt: 1 });

module.exports = mongoose.model("ShippingCalculation", shippingCalculationSchema);