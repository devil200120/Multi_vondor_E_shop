const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  cart: {
    type: Array,
    required: true,
  },
  shippingAddress: {
    type: Object,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "Processing",
  },
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String
    }
  }],
  trackingNumber: {
    type: String
  },
  courierPartner: {
    type: String
  },
  estimatedDelivery: {
    type: Date
  },
  paymentInfo: {
    id: {
      type: String,
    },
    status: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  paidAt: {
    type: Date,
    default: Date.now(),
  },
  deliveredAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// Add initial status to history when order is created
orderSchema.pre('save', function(next) {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.status,
      timestamp: this.createdAt,
      note: 'Order placed successfully'
    });
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
