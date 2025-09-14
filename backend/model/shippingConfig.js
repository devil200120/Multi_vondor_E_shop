const mongoose = require("mongoose");

const shippingConfigSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
    unique: true
  },
  // Pricing configuration
  baseRate: {
    type: Number,
    required: true,
    default: 50, // Base shipping rate in rupees
    min: 0
  },
  perKmRate: {
    type: Number,
    required: true,
    default: 5, // Rate per kilometer in rupees
    min: 0
  },
  // Distance thresholds and rates
  freeShippingThreshold: {
    type: Number,
    default: 999, // Free shipping for orders above this amount
    min: 0
  },
  maxDeliveryDistance: {
    type: Number,
    default: 100, // Maximum delivery distance in km
    min: 1
  },
  // Time-based pricing
  peakHourMultiplier: {
    type: Number,
    default: 1.2, // 20% extra during peak hours
    min: 1.0
  },
  peakHours: [{
    start: {
      type: String,
      required: true
    },
    end: {
      type: String,
      required: true
    }
  }],
  // Weight-based pricing
  weightBasedPricing: {
    enabled: {
      type: Boolean,
      default: false
    },
    baseWeight: {
      type: Number,
      default: 1, // Base weight in kg
      min: 0.1
    },
    additionalWeightRate: {
      type: Number,
      default: 10, // Additional rate per kg
      min: 0
    }
  },
  // Express delivery
  expressDelivery: {
    enabled: {
      type: Boolean,
      default: true
    },
    multiplier: {
      type: Number,
      default: 1.5, // 50% extra for express delivery
      min: 1.0
    }
  },
  // Supplier location
  location: {
    address: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    pincode: {
      type: String,
      required: true
    }
  },
  // Service areas
  serviceAreas: [{
    pincode: String,
    area: String,
    district: String,
    customRate: Number // Override rate for specific areas
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
shippingConfigSchema.index({ shopId: 1 });
shippingConfigSchema.index({ "serviceAreas.pincode": 1 });

module.exports = mongoose.model("ShippingConfig", shippingConfigSchema);