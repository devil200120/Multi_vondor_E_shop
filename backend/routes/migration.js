const express = require("express");
const Product = require("../model/product");
const Category = require("../model/category");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

// Migrate products from string categories to ObjectId categories
router.post(
  "/migrate-product-categories",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Get all products with string categories
      const products = await Product.find({ category: { $type: "string" } });
      
      if (products.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No products found with string categories. Migration already completed or no products exist.",
          migrated: 0
        });
      }

      let migratedCount = 0;
      let errors = [];

      for (const product of products) {
        try {
          // Try to find matching category by name
          const category = await Category.findOne({ 
            name: { $regex: new RegExp(`^${product.category}$`, "i") }
          });

          if (category) {
            // Update product with category ObjectId
            await Product.findByIdAndUpdate(product._id, {
              category: category._id
            });
            migratedCount++;
          } else {
            // Create a new category for unmapped products
            const newCategory = await Category.create({
              name: product.category,
              description: `Auto-created category for existing products`,
              level: 0,
              isActive: true,
              sortOrder: 0,
              createdBy: req.user._id,
              updatedBy: req.user._id
            });

            // Update product with new category ObjectId
            await Product.findByIdAndUpdate(product._id, {
              category: newCategory._id
            });
            migratedCount++;
          }
        } catch (error) {
          errors.push({
            productId: product._id,
            productName: product.name,
            category: product.category,
            error: error.message
          });
        }
      }

      // Update product counts for all categories
      const categories = await Category.find();
      for (const category of categories) {
        const productCount = await Product.countDocuments({ category: category._id });
        await Category.findByIdAndUpdate(category._id, { productCount });
      }

      res.status(200).json({
        success: true,
        message: `Migration completed successfully! ${migratedCount} products migrated.`,
        migrated: migratedCount,
        totalFound: products.length,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      return next(error);
    }
  })
);

// Get migration status
router.get(
  "/migration-status",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const totalProducts = await Product.countDocuments();
      const stringCategoryProducts = await Product.countDocuments({ 
        category: { $type: "string" } 
      });
      const objectIdCategoryProducts = await Product.countDocuments({ 
        category: { $type: "objectId" } 
      });

      res.status(200).json({
        success: true,
        status: {
          totalProducts,
          stringCategoryProducts,
          objectIdCategoryProducts,
          migrationNeeded: stringCategoryProducts > 0,
          migrationProgress: totalProducts > 0 ? 
            Math.round((objectIdCategoryProducts / totalProducts) * 100) : 100
        }
      });
    } catch (error) {
      return next(error);
    }
  })
);

module.exports = router;