const mongoose = require("mongoose");

const legalPageSchema = new mongoose.Schema({
  pageType: {
    type: String,
    required: [true, "Page type is required"],
    enum: ['buyer-terms-of-service', 'seller-terms-of-service', 'privacy-policy', 'return-refund', 'shipping-policy', 'about-us'],
    unique: true,
  },
  title: {
    type: String,
    required: [true, "Page title is required"],
  },
  content: {
    type: String,
    required: [true, "Page content is required"],
  },
  contentType: {
    type: String,
    enum: ['html', 'markdown', 'plain-text'],
    default: 'html',
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  version: {
    type: Number,
    default: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  metaDescription: {
    type: String,
    maxLength: 160,
  },
  metaKeywords: {
    type: [String],
  },
  lastPublished: {
    type: Date,
    default: Date.now,
  },
  documentFile: {
    type: {
      filename: String,
      originalname: String,
      mimetype: String,
      size: Number,
      uploadDate: {
        type: Date,
        default: Date.now,
      },
      cloudinary: {
        url: String,
        public_id: String,
      },
    },
    required: false,
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

// Update the updatedAt field before saving
legalPageSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
legalPageSchema.index({ pageType: 1 });
legalPageSchema.index({ isActive: 1 });

module.exports = mongoose.model("LegalPage", legalPageSchema);