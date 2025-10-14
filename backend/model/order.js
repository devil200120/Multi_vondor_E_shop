const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    sparse: true // Allows existing orders without this field
  },
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
  shopId: {
    type: String,
    required: false,
  },
  shopName: {
    type: String,
    required: false,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  subTotalPrice: {
    type: Number,
    default: 0,
  },
  shippingPrice: {
    type: Number,
    default: 0,
  },
  discountPrice: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
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
  cancelledAt: {
    type: Date,
  },
  cancellationReason: {
    type: String,
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

// Auto-generate arithmetic order numbers for new orders
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    try {
      // Get the total count of existing orders
      const count = await this.constructor.countDocuments();
      
      // Generate order number with format: wanttar-00001, wanttar-00002, etc.
      this.orderNumber = `wanttar-${String(count + 1).padStart(5, '0')}`;
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("Order", orderSchema);
