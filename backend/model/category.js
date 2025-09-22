const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter category name!"],
    trim: true,
    maxlength: [100, "Category name cannot exceed 100 characters"]
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, "Description cannot exceed 500 characters"],
    trim: true
  },
  image: {
    url: {
      type: String,
      default: ""
    },
    public_id: {
      type: String,
      default: ""
    }
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null
  },
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 3 // Limiting to 3 levels: Category -> Subcategory -> Sub-subcategory
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  productCount: {
    type: Number,
    default: 0
  },
  // SEO related fields
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [60, "Meta title cannot exceed 60 characters"]
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, "Meta description cannot exceed 160 characters"]
  },
  // For breadcrumb generation and hierarchy management
  path: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true
});

// Indexes for better performance
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ "name": "text", "description": "text" });

// Pre-save middleware to generate slug
categorySchema.pre("save", function(next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");
  }
  next();
});

// Pre-save middleware to set level and path
categorySchema.pre("save", async function(next) {
  if (this.parent) {
    try {
      const parentCategory = await this.constructor.findById(this.parent);
      if (parentCategory) {
        this.level = parentCategory.level + 1;
        this.path = parentCategory.path ? `${parentCategory.path}/${parentCategory.slug}` : parentCategory.slug;
      }
    } catch (error) {
      return next(error);
    }
  } else {
    this.level = 0;
    this.path = "";
  }
  next();
});

// Virtual for full path including current category
categorySchema.virtual("fullPath").get(function() {
  return this.path ? `${this.path}/${this.slug}` : this.slug;
});

// Virtual for checking if category has children
categorySchema.virtual("hasChildren", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
  count: true
});

// Instance method to get all ancestors
categorySchema.methods.getAncestors = async function() {
  const ancestors = [];
  let current = this;
  
  while (current.parent) {
    current = await this.constructor.findById(current.parent).populate("parent");
    if (current) {
      ancestors.unshift(current);
    } else {
      break;
    }
  }
  
  return ancestors;
};

// Instance method to get all descendants
categorySchema.methods.getDescendants = async function() {
  const descendants = [];
  
  const findChildren = async (parentId) => {
    const children = await this.constructor.find({ parent: parentId });
    for (const child of children) {
      descendants.push(child);
      await findChildren(child._id);
    }
  };
  
  await findChildren(this._id);
  return descendants;
};

// Static method to get category tree
categorySchema.statics.getCategoryTree = async function(parentId = null, level = 0) {
  const categories = await this.find({ 
    parent: parentId, 
    isActive: true 
  }).sort({ sortOrder: 1, name: 1 });
  
  const tree = [];
  
  for (const category of categories) {
    const categoryObj = category.toObject();
    categoryObj.children = await this.getCategoryTree(category._id, level + 1);
    tree.push(categoryObj);
  }
  
  return tree;
};

// Static method to get breadcrumb
categorySchema.statics.getBreadcrumb = async function(categoryId) {
  const category = await this.findById(categoryId);
  if (!category) return [];
  
  const breadcrumb = [category];
  const ancestors = await category.getAncestors();
  
  return [...ancestors, category];
};

// Pre-remove middleware to handle cascade delete and update product counts
categorySchema.pre("remove", async function(next) {
  try {
    // Find all descendants
    const descendants = await this.getDescendants();
    const allCategoryIds = [this._id, ...descendants.map(d => d._id)];
    
    // Update products that use these categories to "Uncategorized" or remove category reference
    await mongoose.model("Product").updateMany(
      { category: { $in: allCategoryIds } },
      { $unset: { category: "" } }
    );
    
    // Delete all descendant categories
    await this.constructor.deleteMany({ _id: { $in: descendants.map(d => d._id) } });
    
    next();
  } catch (error) {
    next(error);
  }
});

// Method to update product count
categorySchema.methods.updateProductCount = async function() {
  const productCount = await mongoose.model("Product").countDocuments({ 
    category: this._id 
  });
  this.productCount = productCount;
  await this.save();
  return productCount;
};

// Ensure virtuals are included when converting to JSON
categorySchema.set("toJSON", { virtuals: true });
categorySchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Category", categorySchema);
