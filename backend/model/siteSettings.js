const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema({
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