const express = require("express");
const { upload } = require("../multer");
const Category = require("../model/category");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Create new category
router.post(
  "/create-category",
  upload.single("image"),
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, description, parent, sortOrder, metaTitle, metaDescription } = req.body;

      // Check if category with same name exists at the same level
      const existingCategory = await Category.findOne({ 
        name: name.trim(),
        parent: parent || null 
      });

      if (existingCategory) {
        // Delete uploaded file if category already exists
        if (req.file) {
          fs.unlinkSync(path.join(__dirname, "../uploads", req.file.filename));
        }
        return next(new ErrorHandler("Category with this name already exists at this level", 400));
      }

      // Validate parent category if provided
      if (parent) {
        const parentCategory = await Category.findById(parent);
        if (!parentCategory) {
          if (req.file) {
            fs.unlinkSync(path.join(__dirname, "../uploads", req.file.filename));
          }
          return next(new ErrorHandler("Parent category not found", 404));
        }
        
        // Check maximum nesting level (3 levels)
        if (parentCategory.level >= 2) {
          if (req.file) {
            fs.unlinkSync(path.join(__dirname, "../uploads", req.file.filename));
          }
          return next(new ErrorHandler("Maximum category nesting level reached", 400));
        }
      }

      // Generate unique slug
      let baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim("-");

      let slug = baseSlug;
      let counter = 1;
      while (await Category.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const categoryData = {
        name: name.trim(),
        slug,
        description: description?.trim() || "",
        parent: parent || null,
        sortOrder: parseInt(sortOrder) || 0,
        metaTitle: metaTitle?.trim() || "",
        metaDescription: metaDescription?.trim() || "",
        createdBy: req.user._id,
        updatedBy: req.user._id
      };

      if (req.file) {
        categoryData.image = req.file.filename;
      }

      const category = await Category.create(categoryData);

      // Populate parent for response
      await category.populate("parent", "name slug");
      
      // Transform category to include full image URL
      const categoryObj = category.toObject();
      if (categoryObj.image) {
        categoryObj.image = `${req.protocol}://${req.get('host')}/${categoryObj.image}`;
      }
      
      res.status(201).json({
        success: true,
        message: "Category created successfully!",
        category: categoryObj
      });
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file) {
        try {
          fs.unlinkSync(path.join(__dirname, "../uploads", req.file.filename));
        } catch (unlinkError) {
          console.error("Error deleting file:", unlinkError);
        }
      }
      return next(error);
    }
  })
);

// Get all categories with hierarchy
router.get(
  "/all-categories",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { 
        includeInactive = false, 
        parentId = null, 
        level = null,
        search = "",
        page = 1,
        limit = 50,
        tree = false 
      } = req.query;

      // Build query
      let query = {};
      
      if (includeInactive === "false" || includeInactive === false) {
        query.isActive = true;
      }
      
      if (parentId) {
        query.parent = parentId === 'null' ? null : parentId;
      }
      
      if (level !== null && level !== undefined && level !== "") {
        const parsedLevel = parseInt(level);
        if (!isNaN(parsedLevel)) {
          query.level = parsedLevel;
        }
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ];
      }

      if (tree === 'true') {
        // Return hierarchical tree structure
        const categoryTree = await Category.getCategoryTree();
        
        // Transform tree to include full image URLs recursively
        const transformCategoryTree = (categories) => {
          return categories.map(category => {
            if (category.image) {
              category.image = `${req.protocol}://${req.get('host')}/${category.image}`;
            }
            if (category.children && category.children.length > 0) {
              category.children = transformCategoryTree(category.children);
            }
            return category;
          });
        };
        
        const treeWithImageUrls = transformCategoryTree(categoryTree);
        
        return res.status(200).json({
          success: true,
          categories: treeWithImageUrls,
          total: treeWithImageUrls.length
        });
      }

      // Pagination for flat list
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
      const skip = (pageNum - 1) * limitNum;
      const total = await Category.countDocuments(query);
      
      const categories = await Category.find(query)
        .populate("parent", "name slug level")
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email")
        .sort({ level: 1, sortOrder: 1, name: 1 })
        .skip(skip)
        .limit(limitNum);

      // Transform categories to include full image URLs
      const categoriesWithImageUrls = categories.map(category => {
        const categoryObj = category.toObject();
        if (categoryObj.image) {
          categoryObj.image = `${req.protocol}://${req.get('host')}/${categoryObj.image}`;
        }
        return categoryObj;
      });

      res.status(200).json({
        success: true,
        categories: categoriesWithImageUrls,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      });
    } catch (error) {
      return next(error);
    }
  })
);

// Get root categories only (categories without parent)
router.get(
  "/root-categories",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { 
        includeInactive = false, 
        search = "",
        page = 1,
        limit = 50
      } = req.query;

      // Build query for root categories only
      let query = {
        parent: null  // Only categories without parent
      };
      
      if (includeInactive === "false" || includeInactive === false) {
        query.isActive = true;
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ];
      }

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 50;
      const skip = (pageNum - 1) * limitNum;

      const total = await Category.countDocuments(query);
      const categories = await Category.find(query)
        .sort({ sortOrder: 1, name: 1 })
        .skip(skip)
        .limit(limitNum);

      // Transform categories to include full image URLs
      const categoriesWithImageUrls = categories.map(category => {
        const categoryObj = category.toObject();
        if (categoryObj.image) {
          categoryObj.image = `${req.protocol}://${req.get('host')}/${categoryObj.image}`;
        }
        return categoryObj;
      });

      res.status(200).json({
        success: true,
        categories: categoriesWithImageUrls,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      });
    } catch (error) {
      return next(error);
    }
  })
);

// Get subcategories by parent ID
router.get(
  "/subcategories/:parentId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { parentId } = req.params;
      const { 
        includeInactive = false, 
        search = "",
        page = 1,
        limit = 50
      } = req.query;

      // Validate parent category exists
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return next(new ErrorHandler("Parent category not found", 404));
      }

      // Build query for subcategories
      let query = {
        parent: parentId
      };
      
      if (includeInactive === "false" || includeInactive === false) {
        query.isActive = true;
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ];
      }

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 50;
      const skip = (pageNum - 1) * limitNum;

      const total = await Category.countDocuments(query);
      const subcategories = await Category.find(query)
        .sort({ sortOrder: 1, name: 1 })
        .skip(skip)
        .limit(limitNum);

      // Transform subcategories to include full image URLs
      const subcategoriesWithImageUrls = subcategories.map(category => {
        const categoryObj = category.toObject();
        if (categoryObj.image) {
          categoryObj.image = `${req.protocol}://${req.get('host')}/${categoryObj.image}`;
        }
        return categoryObj;
      });

      res.status(200).json({
        success: true,
        subcategories: subcategoriesWithImageUrls,
        parentCategory: {
          _id: parentCategory._id,
          name: parentCategory.name,
          slug: parentCategory.slug
        },
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      });
    } catch (error) {
      return next(error);
    }
  })
);

// Get single category by ID or slug
router.get(
  "/category/:identifier",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { identifier } = req.params;
      const { includeChildren = false, includeAncestors = false } = req.query;

      // Try to find by ID first, then by slug
      let category = await Category.findById(identifier).populate("parent", "name slug level");
      
      if (!category) {
        category = await Category.findOne({ slug: identifier }).populate("parent", "name slug level");
      }

      if (!category) {
        return next(new ErrorHandler("Category not found", 404));
      }

      let result = { category };

      // Transform category to include full image URL
      const categoryObj = category.toObject();
      if (categoryObj.image) {
        categoryObj.image = `${req.protocol}://${req.get('host')}/${categoryObj.image}`;
      }
      result.category = categoryObj;

      if (includeChildren === 'true') {
        const children = await Category.find({ parent: category._id, isActive: true })
          .sort({ sortOrder: 1, name: 1 });
        
        // Transform children to include full image URLs
        const childrenWithImageUrls = children.map(child => {
          const childObj = child.toObject();
          if (childObj.image) {
            childObj.image = `${req.protocol}://${req.get('host')}/${childObj.image}`;
          }
          return childObj;
        });
        
        result.children = childrenWithImageUrls;
      }

      if (includeAncestors === 'true') {
        const ancestors = await category.getAncestors();
        
        // Transform ancestors to include full image URLs
        const ancestorsWithImageUrls = ancestors.map(ancestor => {
          const ancestorObj = ancestor.toObject();
          if (ancestorObj.image) {
            ancestorObj.image = `${req.protocol}://${req.get('host')}/${ancestorObj.image}`;
          }
          return ancestorObj;
        });
        
        result.ancestors = ancestorsWithImageUrls;
      }

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      return next(error);
    }
  })
);

// Update category
router.put(
  "/update-category/:id",
  upload.single("image"),
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description, parent, sortOrder, metaTitle, metaDescription, isActive } = req.body;

      const category = await Category.findById(id);
      if (!category) {
        if (req.file) {
          fs.unlinkSync(path.join(__dirname, "../uploads", req.file.filename));
        }
        return next(new ErrorHandler("Category not found", 404));
      }

      // Prevent setting category as its own parent or creating circular references
      if (parent && parent === id) {
        if (req.file) {
          fs.unlinkSync(path.join(__dirname, "../uploads", req.file.filename));
        }
        return next(new ErrorHandler("Category cannot be its own parent", 400));
      }

      // Check if new name conflicts with existing categories at the same level
      if (name && name.trim() !== category.name) {
        const existingCategory = await Category.findOne({
          name: name.trim(),
          parent: parent || null,
          _id: { $ne: id }
        });

        if (existingCategory) {
          if (req.file) {
            fs.unlinkSync(path.join(__dirname, "../uploads", req.file.filename));
          }
          return next(new ErrorHandler("Category with this name already exists at this level", 400));
        }
      }

      // Validate parent category and prevent circular references
      if (parent && parent !== (category.parent?.toString() || null)) {
        const parentCategory = await Category.findById(parent);
        if (!parentCategory) {
          if (req.file) {
            fs.unlinkSync(path.join(__dirname, "../uploads", req.file.filename));
          }
          return next(new ErrorHandler("Parent category not found", 404));
        }

        // Check if the new parent is a descendant of current category
        const descendants = await category.getDescendants();
        const descendantIds = descendants.map(d => d._id.toString());
        if (descendantIds.includes(parent)) {
          if (req.file) {
            fs.unlinkSync(path.join(__dirname, "../uploads", req.file.filename));
          }
          return next(new ErrorHandler("Cannot move category under its own descendant", 400));
        }

        // Check maximum nesting level
        if (parentCategory.level >= 2) {
          if (req.file) {
            fs.unlinkSync(path.join(__dirname, "../uploads", req.file.filename));
          }
          return next(new ErrorHandler("Maximum category nesting level reached", 400));
        }
      }

      // Update category fields
      if (name) category.name = name.trim();
      if (description !== undefined) category.description = description.trim();
      if (parent !== undefined) category.parent = parent || null;
      if (sortOrder !== undefined) category.sortOrder = parseInt(sortOrder) || 0;
      if (metaTitle !== undefined) category.metaTitle = metaTitle.trim();
      if (metaDescription !== undefined) category.metaDescription = metaDescription.trim();
      if (isActive !== undefined) category.isActive = isActive === 'true';
      category.updatedBy = req.user._id;

      // Handle image update
      if (req.file) {
        // Delete old image if exists
        if (category.image) {
          const oldImagePath = path.join(__dirname, "../uploads", category.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        category.image = req.file.filename;
      }

      // Generate new slug if name changed
      if (name && name.trim() !== category.name) {
        let baseSlug = name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim("-");

        let slug = baseSlug;
        let counter = 1;
        while (await Category.findOne({ slug, _id: { $ne: id } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        category.slug = slug;
      }

      await category.save();
      await category.populate("parent", "name slug level");

      // Transform category to include full image URL
      const categoryObj = category.toObject();
      if (categoryObj.image) {
        categoryObj.image = `${req.protocol}://${req.get('host')}/${categoryObj.image}`;
      }

      res.status(200).json({
        success: true,
        message: "Category updated successfully!",
        category: categoryObj
      });
    } catch (error) {
      if (req.file) {
        try {
          fs.unlinkSync(path.join(__dirname, "../uploads", req.file.filename));
        } catch (unlinkError) {
          console.error("Error deleting file:", unlinkError);
        }
      }
      return next(error);
    }
  })
);

// Delete category
router.delete(
  "/delete-category/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { id } = req.params;
      const { force = false } = req.query;

      const category = await Category.findById(id);
      if (!category) {
        return next(new ErrorHandler("Category not found", 404));
      }

      // Check if category has children
      const childrenCount = await Category.countDocuments({ parent: id });
      if (childrenCount > 0 && !force) {
        return next(new ErrorHandler("Cannot delete category with subcategories. Use force=true to delete all.", 400));
      }

      // Check if category has associated products
      const Product = require("../model/product");
      const productCount = await Product.countDocuments({ category: id });
      if (productCount > 0 && !force) {
        return next(new ErrorHandler(`Category has ${productCount} associated products. Use force=true to proceed.`, 400));
      }

      // Delete category image if exists
      if (category.image) {
        const imagePath = path.join(__dirname, "../uploads", category.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // If force delete, handle cascading
      if (force) {
        const descendants = await category.getDescendants();
        
        // Delete all descendant images
        for (const descendant of descendants) {
          if (descendant.image) {
            const imagePath = path.join(__dirname, "../uploads", descendant.image);
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          }
        }

        // Update products to remove category reference
        const allCategoryIds = [id, ...descendants.map(d => d._id)];
        await Product.updateMany(
          { category: { $in: allCategoryIds } },
          { $unset: { category: "" } }
        );

        // Delete all descendants
        await Category.deleteMany({ _id: { $in: descendants.map(d => d._id) } });
      }

      await Category.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Category deleted successfully!"
      });
    } catch (error) {
      return next(error);
    }
  })
);

// Toggle category status
router.patch(
  "/toggle-status/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);
      if (!category) {
        return next(new ErrorHandler("Category not found", 404));
      }

      category.isActive = !category.isActive;
      category.updatedBy = req.user._id;
      await category.save();

      res.status(200).json({
        success: true,
        message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully!`,
        category
      });
    } catch (error) {
      return next(error);
    }
  })
);

// Bulk operations
router.patch(
  "/bulk-action",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { action, categoryIds } = req.body;

      if (!action || !categoryIds || !Array.isArray(categoryIds)) {
        return next(new ErrorHandler("Invalid bulk action request", 400));
      }

      let result;
      const updateData = { updatedBy: req.user._id };

      switch (action) {
        case "activate":
          updateData.isActive = true;
          result = await Category.updateMany(
            { _id: { $in: categoryIds } },
            updateData
          );
          break;

        case "deactivate":
          updateData.isActive = false;
          result = await Category.updateMany(
            { _id: { $in: categoryIds } },
            updateData
          );
          break;

        case "delete":
          // Note: This doesn't handle force delete or cascading
          const categories = await Category.find({ _id: { $in: categoryIds } });
          
          // Delete associated images
          for (const category of categories) {
            if (category.image) {
              const imagePath = path.join(__dirname, "../uploads", category.image);
              if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
              }
            }
          }
          
          result = await Category.deleteMany({ _id: { $in: categoryIds } });
          break;

        default:
          return next(new ErrorHandler("Invalid bulk action", 400));
      }

      res.status(200).json({
        success: true,
        message: `Bulk ${action} completed successfully!`,
        modifiedCount: result.modifiedCount || result.deletedCount
      });
    } catch (error) {
      return next(error);
    }
  })
);

// Reorder categories
router.patch(
  "/reorder",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { categories } = req.body;

      if (!Array.isArray(categories)) {
        return next(new ErrorHandler("Categories array is required", 400));
      }

      const bulkOps = categories.map((cat, index) => ({
        updateOne: {
          filter: { _id: cat.id },
          update: { 
            sortOrder: index,
            updatedBy: req.user._id
          }
        }
      }));

      await Category.bulkWrite(bulkOps);

      res.status(200).json({
        success: true,
        message: "Categories reordered successfully!"
      });
    } catch (error) {
      return next(error);
    }
  })
);

// Get category statistics
router.get(
  "/stats",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const totalCategories = await Category.countDocuments();
      const activeCategories = await Category.countDocuments({ isActive: true });
      const inactiveCategories = totalCategories - activeCategories;
      
      const categoriesByLevel = await Category.aggregate([
        {
          $group: {
            _id: "$level",
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      const topCategories = await Category.find({ level: 0, isActive: true })
        .sort({ productCount: -1 })
        .limit(5)
        .select("name productCount");

      res.status(200).json({
        success: true,
        stats: {
          total: totalCategories,
          active: activeCategories,
          inactive: inactiveCategories,
          byLevel: categoriesByLevel,
          topCategories
        }
      });
    } catch (error) {
      return next(error);
    }
  })
);

// Update product counts for all categories
router.patch(
  "/update-product-counts",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const categories = await Category.find();
      const Product = require("../model/product");
      
      let updatedCount = 0;
      
      for (const category of categories) {
        const productCount = await Product.countDocuments({ category: category._id });
        if (category.productCount !== productCount) {
          category.productCount = productCount;
          await category.save();
          updatedCount++;
        }
      }

      res.status(200).json({
        success: true,
        message: `Product counts updated for ${updatedCount} categories`,
        updatedCount
      });
    } catch (error) {
      return next(error);
    }
  })
);

module.exports = router;
