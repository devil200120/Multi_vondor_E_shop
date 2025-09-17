const express = require("express");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const router = express.Router();
const Product = require("../model/product");
const Order = require("../model/order");
const Shop = require("../model/shop");
const { upload, uploadFields } = require("../multer");
const ErrorHandler = require("../utils/ErrorHandler");
const NotificationService = require("../utils/NotificationService");
const fs = require("fs");

// create product
router.post(
  "/create-product",
  uploadFields,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.body.shopId;
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop Id is invalid!", 400));
      } else {
        const imageFiles = req.files['images'] || [];
        const videoFiles = req.files['videos'] || [];
        
        const imageUrls = imageFiles.map((file) => `${file.filename}`);
        const videoUrls = videoFiles.map((file) => `${file.filename}`);

        const productData = req.body;
        productData.images = imageUrls;
        productData.videos = videoUrls;
        productData.shop = shop;

        const product = await Product.create(productData);

        // Create notification for new product
        await NotificationService.createProductNotification(
          'New Product Added',
          `Product "${product.name}" added by ${shop.name}`,
          'new_product',
          product._id,
          null,
          [shopId]
        );

        res.status(201).json({
          success: true,
          product,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get all products of a shop
router.get(
  "/get-all-products-shop/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find({ shopId: req.params.id });

      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get single product
router.get(
  "/get-product/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return next(new ErrorHandler("Product not found with this id!", 404));
      }

      res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// update product of a shop
router.put(
  "/update-shop-product/:id",
  upload.array("images"),
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId);

      if (!product) {
        return next(new ErrorHandler("Product not found with this id!", 404));
      }

      // Check if the product belongs to the seller's shop
      if (product.shopId.toString() !== req.seller._id.toString()) {
        return next(new ErrorHandler("You are not authorized to update this product!", 403));
      }

      const files = req.files;
      let imageUrls = [];

      // If new images are uploaded, use them; otherwise keep existing images
      if (files && files.length > 0) {
        // Delete old images if new ones are uploaded
        if (product.images && product.images.length > 0) {
          product.images.forEach((imageUrl) => {
            const filename = imageUrl;
            const filePath = `uploads/${filename}`;
            fs.unlink(filePath, (err) => {
              if (err) {
                console.log(err);
              }
            });
          });
        }
        imageUrls = files.map((file) => `${file.filename}`);
      } else {
        // Keep existing images if no new images are uploaded
        imageUrls = product.images;
      }

      const updateData = {
        name: req.body.name || product.name,
        description: req.body.description || product.description,
        category: req.body.category || product.category,
        tags: req.body.tags || product.tags,
        originalPrice: req.body.originalPrice || product.originalPrice,
        discountPrice: req.body.discountPrice || product.discountPrice,
        stock: req.body.stock || product.stock,
        images: imageUrls,
      };

      const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, {
        new: true,
        runValidators: true,
      });

      // Check for low stock and create notification
      if (updatedProduct.stock <= 10 && updatedProduct.stock > 0) {
        await NotificationService.createStockNotification(
          'Low Stock Alert',
          `Product "${updatedProduct.name}" is running low on stock (${updatedProduct.stock} remaining)`,
          'low_stock',
          updatedProduct._id,
          null,
          [updatedProduct.shopId]
        );
      } else if (updatedProduct.stock === 0) {
        await NotificationService.createStockNotification(
          'Out of Stock Alert',
          `Product "${updatedProduct.name}" is now out of stock`,
          'out_of_stock',
          updatedProduct._id,
          null,
          [updatedProduct.shopId]
        );
      }

      res.status(200).json({
        success: true,
        product: updatedProduct,
        message: "Product updated successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// delete product of a shop
router.delete(
  "/delete-shop-product/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.id;

      const productData = await Product.findById(productId);

      productData.images.forEach((imageUrl) => {
        const filename = imageUrl;
        const filePath = `uploads/${filename}`;

        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(err);
          }
        });
      });

      const product = await Product.findByIdAndDelete(productId);

      if (!product) {
        return next(new ErrorHandler("Product not found with this id!", 500));
      }

      res.status(201).json({
        success: true,
        message: "Product Deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get all products
router.get(
  "/get-all-products",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 });

      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// review for a product
router.put(
  "/create-new-review",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { user, rating, comment, productId, orderId } = req.body;

      const product = await Product.findById(productId);

      const review = {
        user,
        rating,
        comment,
        productId,
      };

      const isReviewed = product.reviews.find(
        (rev) => rev.user._id.toString() === req.user._id.toString()
      );

      if (isReviewed) {
        product.reviews.forEach((rev) => {
          if (rev.user._id.toString() === req.user._id.toString()) {
            rev.rating = rating;
            rev.comment = comment;
            rev.user = user;
          }
        });
      } else {
        product.reviews.push(review);
      }

      let avg = 0;

      product.reviews.forEach((rev) => {
        avg += rev.rating;
      });

      product.ratings = avg / product.reviews.length;

      await product.save({ validateBeforeSave: false });

      // Only update order if orderId is provided and not "direct"
      if (orderId && orderId !== "direct") {
        await Order.findByIdAndUpdate(
          orderId,
          { $set: { "cart.$[elem].isReviewed": true } },
          { arrayFilters: [{ "elem._id": productId }], new: true }
        );
      }

      res.status(200).json({
        success: true,
        message: "Reviwed succesfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// all products --- for admin
router.get(
  "/admin-all-products",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
