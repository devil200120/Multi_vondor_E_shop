const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email!"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [4, "Password should be greater than 4 characters"],
    select: false,
  },
  phoneNumber: {
    type: Number,
  },
  addresses: [
    {
      country: {
        type: String,
      },
      city: {
        type: String,
      },
      address1: {
        type: String,
      },
      address2: {
        type: String,
      },
      zipCode: {
        type: Number,
      },
      addressType: {
        type: String,
      },
      latitude: {
        type: String,
      },
      longitude: {
        type: String,
      },
    },
  ],
  role: {
    type: String,
    enum: ['User', 'Supplier', 'Admin', 'SubAdmin', 'Manager'],
    default: "User",
  },
  // Permissions for SubAdmin and Manager roles
  // Leave undefined to use role-based defaults from rolePermissions.js
  permissions: {
    // Approval permissions (for SubAdmin)
    canApproveVendors: { type: Boolean },
    canApproveProducts: { type: Boolean },
    canApproveAds: { type: Boolean },
    canModerateReviews: { type: Boolean },
    
    // Operational permissions (for Manager)
    canManageOrders: { type: Boolean },
    canManageProducts: { type: Boolean },
    canManageCoupons: { type: Boolean },
    canManageCategories: { type: Boolean },
    canManageUsers: { type: Boolean },
    canManageVendors: { type: Boolean },
    canViewAnalytics: { type: Boolean },
    canManageContent: { type: Boolean },
    
    // Setup/Settings permissions (denied for Manager)
    canAccessSetup: { type: Boolean },
  },
  avatar: {
    type: {
      url: {
        type: String,
        required: false,
      },
      public_id: {
        type: String,
        required: false,
      },
    },
    required: false,
    default: null,
  },
  // Ban system fields
  isBanned: {
    type: Boolean,
    default: false,
  },
  banReason: {
    type: String,
    default: null,
  },
  bannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  bannedAt: {
    type: Date,
    default: null,
  },
  roleChangedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  resetPasswordToken: String,
  resetPasswordTime: Date,
});

//  Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// jwt token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
