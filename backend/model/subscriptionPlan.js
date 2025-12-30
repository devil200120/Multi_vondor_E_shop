const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema({
  planKey: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  monthlyPrice: {
    type: Number,
    required: true,
  },
  maxProducts: {
    type: Number,
    required: true,
  },
  features: {
    businessProfile: { type: Boolean, default: true },
    logo: { type: Boolean, default: true },
    pdfUpload: { type: Boolean, default: true },
    imagesPerProduct: { type: Number, default: 3 },
    videoOption: { type: Boolean, default: false },
    contactSeller: { type: Boolean, default: false },
    htmlCssEditor: { type: Boolean, default: false },
    adPreApproval: { type: Boolean, default: false },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
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
subscriptionPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
