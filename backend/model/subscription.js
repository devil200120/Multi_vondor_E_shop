const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
  plan: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'revenue-share'],
    required: true,
  },
  // Plan Features
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
  // Pricing
  monthlyPrice: {
    type: Number,
    required: true,
  },
  billingCycle: {
    type: String,
    enum: ['monthly', '3-months', '6-months', '12-months'],
    default: 'monthly',
  },
  discountPercent: {
    type: Number,
    default: 0,
  },
  finalPrice: {
    type: Number,
    required: true,
  },
  // Status
  status: {
    type: String,
    enum: ['pending', 'active', 'expired', 'cancelled', 'suspended'],
    default: 'pending',
  },
  // Dates
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  nextBillingDate: {
    type: Date,
  },
  // Payment tracking
  paymentMethod: {
    type: String,
    default: 'paypal',
  },
  paypalSubscriptionId: {
    type: String,
  },
  lastPaymentDate: {
    type: Date,
  },
  lastPaymentAmount: {
    type: Number,
  },
  // History
  paymentHistory: [
    {
      amount: Number,
      date: { type: Date, default: Date.now },
      status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' },
      transactionId: String,
      billingPeriodStart: Date,
      billingPeriodEnd: Date,
    }
  ],
  // Cancellation
  cancellationRequested: {
    type: Boolean,
    default: false,
  },
  cancellationDate: {
    type: Date,
  },
  cancellationReason: {
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
subscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return (this.status === 'active' || this.status === 'pending') && this.endDate > new Date();
};

// Method to check if subscription is expiring soon (within 7 days)
subscriptionSchema.methods.isExpiringSoon = function() {
  if (this.status !== 'active') return false;
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  return this.endDate <= sevenDaysFromNow;
};

module.exports = mongoose.model("Subscription", subscriptionSchema);
