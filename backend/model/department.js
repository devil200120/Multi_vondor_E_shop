const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter department name"],
    unique: true,
    trim: true,
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  
  description: {
    type: String,
    maxLength: [500, "Description cannot exceed 500 characters"],
  },
  
  icon: {
    url: {
      type: String,
    },
    public_id: {
      type: String,
    },
  },
  
  image: {
    url: {
      type: String,
    },
    public_id: {
      type: String,
    },
  },
  
  // Categories associated with this department
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  
  // Display settings
  displayOrder: {
    type: Number,
    default: 0,
  },
  
  showOnHomepage: {
    type: Boolean,
    default: true,
  },
  
  color: {
    type: String,
    default: '#000000',
  },
  
  // Mall map settings
  mapPosition: {
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
    floor: {
      type: Number,
      default: 1,
    },
  },
  
  isActive: {
    type: Boolean,
    default: true,
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

// Auto-generate slug from name
departmentSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  this.updatedAt = Date.now();
  next();
});

// Index for performance
departmentSchema.index({ slug: 1 });
departmentSchema.index({ displayOrder: 1, isActive: 1 });

module.exports = mongoose.model("Department", departmentSchema);
