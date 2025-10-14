const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your product name!"],
  },
  description: {
    type: String,
    required: [true, "Please enter your product description!"],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "Please select a product category!"],
  },
  tags: {
    type: String,
  },
  isSellerProduct: {
    type: Boolean,
    default: false,
  },
  sellerShop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: false,
  },
  originalPrice: {
    type: Number,
  },
  discountPrice: {
    type: Number,
    required: [true, "Please enter your product price!"],
  },
  stock: {
    type: Number,
    required: [true, "Please enter your product stock!"],
  },
  images: [
    {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
  ],
  videos: [
    {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
  ],

  reviews: [
    {
      user: {
        type: Object,
      },
      rating: {
        type: Number,
      },
      comment: {
        type: String,
      },
      productId: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  ratings: {
    type: Number,
  },
  shopId: {
    type: String,
    required: true,
  },
  shop: {
    type: Object,
    required: true,
  },
  sold_out: {
    type: Number,
    default: 0,
  },
  // Supplier-specific shipping configuration
  shipping: {
    // Basic shipping rate set by supplier
    baseShippingRate: {
      type: Number,
      default: 0, // 0 means use shop's default shipping config
      min: 0
    },
    // Free shipping threshold for this product
    freeShippingThreshold: {
      type: Number,
      default: null, // null means use shop's default
      min: 0
    },
    // Weight for shipping calculation
    weight: {
      type: Number,
      default: 1, // Weight in kg
      min: 0.1
    },
    // Dimensions for shipping calculation
    dimensions: {
      length: { type: Number, default: 10 }, // cm
      width: { type: Number, default: 10 },  // cm
      height: { type: Number, default: 5 },  // cm
    },
    // Express delivery availability
    expressDeliveryAvailable: {
      type: Boolean,
      default: true
    },
    // Estimated delivery days
    estimatedDeliveryDays: {
      min: { type: Number, default: 2 },
      max: { type: Number, default: 7 }
    },
    // Shipping restrictions
    restrictions: {
      // Pincodes where this product cannot be shipped
      excludePincodes: [String],
      // Special handling required
      requiresSpecialHandling: {
        type: Boolean,
        default: false
      },
      // Additional charges for special handling
      specialHandlingCharge: {
        type: Number,
        default: 0
      }
    }
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Product", productSchema);
