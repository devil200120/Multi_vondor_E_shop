const mongoose = require("mongoose");

const pincodeSchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: [true, "Pincode is required"],
    unique: true,
    trim: true,
    match: [/^\d{6}$/, "Pincode must be 6 digits"],
  },
  state: {
    type: String,
    required: [true, "State is required"],
    trim: true,
  },
  deliveryAvailable: {
    type: Boolean,
    default: true,
  },
  estimatedDeliveryDays: {
    type: Number,
    default: 7,
    min: 1,
    max: 30,
  },
  shippingCharge: {
    type: Number,
    default: 50, // Default shipping charge
    min: 0,
  },
  cashOnDelivery: {
    type: Boolean,
    default: true,
  },
  expressDelivery: {
    type: Boolean,
    default: false,
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

// Serviceable areas schema for managing delivery zones
const serviceableAreaSchema = new mongoose.Schema({
  state: {
    type: String,
    required: [true, "State is required"],
    trim: true,
  },
  districts: [{
    type: String,
    trim: true,
  }],
  deliveryAvailable: {
    type: Boolean,
    default: true,
  },
  defaultDeliveryDays: {
    type: Number,
    default: 7,
  },
  defaultShippingCharge: {
    type: Number,
    default: 50,
  },
  cashOnDelivery: {
    type: Boolean,
    default: true,
  },
  expressDelivery: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster searches
pincodeSchema.index({ pincode: 1 });
pincodeSchema.index({ state: 1 });
pincodeSchema.index({ deliveryAvailable: 1 });

serviceableAreaSchema.index({ state: 1 });
serviceableAreaSchema.index({ deliveryAvailable: 1 });

// Update the updatedAt field before saving
pincodeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to check delivery availability
pincodeSchema.statics.checkDeliveryAvailability = function(pincode) {
  return this.findOne({ 
    pincode: pincode, 
    deliveryAvailable: true 
  });
};

// Static method to get delivery info
pincodeSchema.statics.getDeliveryInfo = function(pincode) {
  return this.findOne({ pincode: pincode });
};

// Static method for serviceable areas to check if state/district is serviceable
serviceableAreaSchema.statics.isServiceable = function(state, district = null) {
  const query = { state: state, deliveryAvailable: true };
  if (district) {
    query.districts = { $in: [district] };
  }
  return this.findOne(query);
};

const Pincode = mongoose.model("Pincode", pincodeSchema);
const ServiceableArea = mongoose.model("ServiceableArea", serviceableAreaSchema);

module.exports = { Pincode, ServiceableArea };