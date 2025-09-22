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
const path = require("path");
const { uploadImageToCloudinary, uploadVideoToCloudinary, deleteFromCloudinary, uploadFileToCloudinary } = require("../config/cloudinary");

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
        
        console.log(`Processing ${imageFiles.length} image files and ${videoFiles.length} video files`);

        // Upload images to Cloudinary
        const uploadedImages = [];
        for (const file of imageFiles) {
          try {
            console.log(`Uploading image: ${file.originalname} (${file.mimetype}) from ${file.path}`);
            const result = await uploadImageToCloudinary(file.path);
            console.log(`Image uploaded successfully: ${result.url}`);
            uploadedImages.push({
              url: result.url,
              public_id: result.public_id
            });
            // Delete local file after successful upload
            fs.unlinkSync(file.path);
          } catch (error) {
            console.error('Image upload error:', error);
            // Clean up any uploaded files before throwing error
            for (const uploaded of uploadedImages) {
              await deleteFromCloudinary(uploaded.public_id, 'image');
            }
            return next(new ErrorHandler(`Image upload failed: ${error.message}`, 400));
          }
        }

        // Upload videos to Cloudinary
        const uploadedVideos = [];
        for (const file of videoFiles) {
          try {
            console.log(`Uploading video: ${file.originalname} (${file.mimetype}) from ${file.path}`);
            const result = await uploadVideoToCloudinary(file.path);
            console.log(`Video uploaded successfully: ${result.url}`);
            uploadedVideos.push({
              url: result.url,
              public_id: result.public_id
            });
            // Delete local file after successful upload
            fs.unlinkSync(file.path);
          } catch (error) {
            console.error('Video upload error:', error);
            // Clean up any uploaded files before throwing error
            for (const uploaded of uploadedImages) {
              await deleteFromCloudinary(uploaded.public_id, 'image');
            }
            for (const uploaded of uploadedVideos) {
              await deleteFromCloudinary(uploaded.public_id, 'video');
            }
            return next(new ErrorHandler(`Video upload failed: ${error.message}`, 400));
          }
        }

        const productData = req.body;
        productData.images = uploadedImages;
        productData.videos = uploadedVideos;
        productData.shop = shop;

        console.log('Creating product with Cloudinary URLs:');
        console.log('Images:', uploadedImages);
        console.log('Videos:', uploadedVideos);

        const product = await Product.create(productData);

        console.log('Product created successfully:', {
          id: product._id,
          name: product.name,
          images: product.images,
          videos: product.videos
        });

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
      const products = await Product.find({ shopId: req.params.id })
        .populate('category', 'name _id parent');

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
      const product = await Product.findById(req.params.id)
        .populate('category', 'name _id parent');

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
  uploadFields,
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

      const imageFiles = req.files['images'] || [];
      const videoFiles = req.files['videos'] || [];
      let newImages = [];
      let newVideos = [];

      // Handle image uploads
      if (imageFiles && imageFiles.length > 0) {
        console.log(`Processing ${imageFiles.length} new image files for update`);
        
        // Delete old images from Cloudinary
        if (product.images && product.images.length > 0) {
          for (const image of product.images) {
            if (image.public_id) {
              try {
                await deleteFromCloudinary(image.public_id, 'image');
                console.log(`Deleted old image: ${image.public_id}`);
              } catch (error) {
                console.error(`Failed to delete old image ${image.public_id}:`, error);
              }
            }
          }
        }

        // Upload new images to Cloudinary
        for (const file of imageFiles) {
          try {
            console.log(`Uploading new image: ${file.originalname} (${file.mimetype}) from ${file.path}`);
            const result = await uploadImageToCloudinary(file.path);
            console.log(`New image uploaded successfully: ${result.url}`);
            newImages.push({
              url: result.url,
              public_id: result.public_id
            });
            // Delete local file after successful upload
            fs.unlinkSync(file.path);
          } catch (error) {
            console.error('Image upload error during update:', error);
            // Clean up any uploaded files before throwing error
            for (const uploaded of newImages) {
              await deleteFromCloudinary(uploaded.public_id, 'image');
            }
            return next(new ErrorHandler(`Image upload failed: ${error.message}`, 400));
          }
        }
      } else {
        // Keep existing images if no new images are uploaded
        newImages = product.images;
        console.log(`Keeping ${newImages.length} existing images`);
      }

      // Handle video uploads
      if (videoFiles && videoFiles.length > 0) {
        console.log(`Processing ${videoFiles.length} new video files for update`);
        
        // Delete old videos from Cloudinary
        if (product.videos && product.videos.length > 0) {
          for (const video of product.videos) {
            if (video.public_id) {
              try {
                await deleteFromCloudinary(video.public_id, 'video');
                console.log(`Deleted old video: ${video.public_id}`);
              } catch (error) {
                console.error(`Failed to delete old video ${video.public_id}:`, error);
              }
            }
          }
        }

        // Upload new videos to Cloudinary
        for (const file of videoFiles) {
          try {
            console.log(`Uploading new video: ${file.originalname} (${file.mimetype}) from ${file.path}`);
            const result = await uploadVideoToCloudinary(file.path);
            console.log(`New video uploaded successfully: ${result.url}`);
            newVideos.push({
              url: result.url,
              public_id: result.public_id
            });
            // Delete local file after successful upload
            fs.unlinkSync(file.path);
          } catch (error) {
            console.error('Video upload error during update:', error);
            // Clean up any uploaded files before throwing error
            for (const uploaded of newVideos) {
              await deleteFromCloudinary(uploaded.public_id, 'video');
            }
            return next(new ErrorHandler(`Video upload failed: ${error.message}`, 400));
          }
        }
      } else {
        // Keep existing videos if no new videos are uploaded
        newVideos = product.videos;
        console.log(`Keeping ${newVideos.length} existing videos`);
      }

      const updateData = {
        name: req.body.name || product.name,
        description: req.body.description || product.description,
        category: req.body.category || product.category,
        tags: req.body.tags || product.tags,
        originalPrice: req.body.originalPrice || product.originalPrice,
        discountPrice: req.body.discountPrice || product.discountPrice,
        stock: req.body.stock || product.stock,
        images: newImages,
        videos: newVideos,
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

      if (!productData) {
        return next(new ErrorHandler("Product not found with this id!", 404));
      }

      // Delete images from Cloudinary
      if (productData.images && productData.images.length > 0) {
        for (const image of productData.images) {
          if (image.public_id) {
            await deleteFromCloudinary(image.public_id, 'image');
          }
        }
      }

      // Delete videos from Cloudinary
      if (productData.videos && productData.videos.length > 0) {
        for (const video of productData.videos) {
          if (video.public_id) {
            await deleteFromCloudinary(video.public_id, 'video');
          }
        }
      }

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
      const products = await Product.find()
        .populate('category', 'name _id parent')
        .sort({ createdAt: -1 });

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
