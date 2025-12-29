const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema({
  seller: {
    type: Object,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "Processing",
    enum: ["Processing", "succeed", "failed", "payout_initiated", "payout_completed", "payout_failed"]
  },
  // PhonePe Payout Integration Fields
  payoutTransactionId: {
    type: String,
    default: null,
  },
  payoutMethod: {
    type: String,
    enum: ["bank", "upi", "paypal", "manual"],
    default: "manual"
  },
  paypalPayoutBatchId: {
    type: String,
    default: null,
  },
  paypalPayoutItemId: {
    type: String,
    default: null,
  },
  payoutStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending"
  },
  payoutError: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Withdraw", withdrawSchema);
