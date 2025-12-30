const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema({
  // Branding/SEO Settings (for browser tab, favicon, etc.)
  branding: {
    favicon: {
      type: String,
      default: "/WANTTA (7).png"
    },
    faviconPublicId: {
      type: String,
      default: null
    },
    appleTouchIcon: {
      type: String,
      default: "/logo192.png"
    },
    appleTouchIconPublicId: {
      type: String,
      default: null
    },
    themeColor: {
      type: String,
      default: "#000000"
    },
    metaDescription: {
      type: String,
      default: "Your trusted online marketplace for all your shopping needs"
    },
    siteTitle: {
      type: String,
      default: "Wanttar"
    }
  },
  // Currency Settings
  currency: {
    code: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "JPY", "CNY", "KYD", "AED", "SGD", "MXN", "BRL", "ZAR", "NZD", "CHF", "HKD", "SEK", "NOK", "DKK"]
    },
    symbol: {
      type: String,
      default: "$"
    },
    name: {
      type: String,
      default: "US Dollar"
    },
    position: {
      type: String,
      enum: ["before", "after"],
      default: "before"
    },
    decimalPlaces: {
      type: Number,
      default: 2,
      min: 0,
      max: 4
    },
    thousandsSeparator: {
      type: String,
      default: ","
    },
    decimalSeparator: {
      type: String,
      default: "."
    }
  },
  footerAddress: {
    streetAddress: {
      type: String,
      required: true,
      default: "5-25, 15th main road, 3rd stage, 4th block, Basaveswaranagar"
    },
    landmark: {
      type: String,
      default: "near Guru sagar hotel"
    },
    city: {
      type: String,
      required: true,
      default: "Bangalore"
    },
    postalCode: {
      type: String,
      required: true,
      default: "560079"
    },
    phone: {
      type: String,
      required: true,
      default: "+91 7349727270"
    },
    email: {
      type: String,
      required: true,
      default: "support@wanttar.in"
    }
  },
  companyInfo: {
    name: {
      type: String,
      default: "Wanttar"
    },
    description: {
      type: String,
      default: "Your trusted online marketplace"
    },
    website: {
      type: String,
      default: "https://www.wanttar.in"
    }
  },
  socialMedia: {
    facebook: {
      type: String,
      default: ""
    },
    twitter: {
      type: String,
      default: ""
    },
    instagram: {
      type: String,
      default: ""
    },
    linkedin: {
      type: String,
      default: ""
    },
    youtube: {
      type: String,
      default: ""
    }
  },
  businessHours: {
    weekdays: {
      type: String,
      default: "Monday - Friday: 9:00 AM - 6:00 PM"
    },
    weekends: {
      type: String,
      default: "Saturday - Sunday: 10:00 AM - 4:00 PM"
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true
});

// Ensure only one active settings document exists
siteSettingsSchema.pre('save', async function(next) {
  if (this.isActive) {
    await mongoose.model('SiteSettings').updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);