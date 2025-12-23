const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter banner title!"],
    default: "Best Collection for"
  },
  subtitle: {
    type: String,
    required: [true, "Please enter banner subtitle!"],
    default: "Home Decoration"
  },
  description: {
    type: String,
    required: [true, "Please enter banner description!"],
    default: "Discover our curated collection of premium home decor items that transform your space into a beautiful sanctuary."
  },
  image: {
    url: {
      type: String,
      required: [true, "Please provide banner image URL!"],
      default: "https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg"
    },
    public_id: {
      type: String,
      default: ""
    }
  },
  // Sliding images array for sliding mode
  images: [{
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: ""
    },
    description: {
      type: String,
      default: ""
    }
  }],
  displayMode: {
    type: String,
    enum: ['single', 'sliding'],
    default: 'single'
  },
  autoSlideInterval: {
    type: Number,
    default: 5000 // 5 seconds
  },
  transitionEffect: {
    type: String,
    enum: ['fade', 'slide', 'zoom'],
    default: 'slide'
  },
  buttonText: {
    type: String,
    default: "Shop Now"
  },
  secondaryButtonText: {
    type: String,
    default: "View Collections"
  },
  stats: {
    customers: {
      count: {
        type: String,
        default: "10K+"
      },
      label: {
        type: String,
        default: "Happy Customers"
      }
    },
    products: {
      count: {
        type: String,
        default: "5K+"
      },
      label: {
        type: String,
        default: "Products"
      }
    },
    satisfaction: {
      count: {
        type: String,
        default: "99%"
      },
      label: {
        type: String,
        default: "Satisfaction"
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
bannerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Banner", bannerSchema);