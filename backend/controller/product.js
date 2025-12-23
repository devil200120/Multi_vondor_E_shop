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
const cloudinary = require("cloudinary").v2;
const { uploadToCloudinary } = require("../config/cloudinary");
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
            console.log(`Uploading image: ${file.originalname} (${file.mimetype})`);
            
            // Validate file buffer
            if (!file.buffer || file.buffer.length === 0) {
              console.error('Empty file buffer for:', file.originalname);
              return next(new ErrorHandler(`File ${file.originalname} is empty or corrupted`, 400));
            }
            
            const result = await uploadToCloudinary(file.buffer, {
              folder: 'products',
              resource_type: 'image'
            });
            console.log('Full Cloudinary image result:', JSON.stringify(result, null, 2));
            console.log(`Image uploaded successfully: ${result.url}`);
            
            // Validate that we got the required fields
            if (!result.url || !result.public_id) {
              console.error('Invalid Cloudinary response - missing url or public_id:', result);
              throw new Error('Cloudinary upload succeeded but returned incomplete data');
            }
            
            uploadedImages.push({
              url: result.url,
              public_id: result.public_id
            });
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
            console.log(`Uploading video: ${file.originalname} (${file.mimetype})`);
            
            // Validate file buffer
            if (!file.buffer || file.buffer.length === 0) {
              console.error('Empty video file buffer for:', file.originalname);
              return next(new ErrorHandler(`Video file ${file.originalname} is empty or corrupted`, 400));
            }
            
            const result = await uploadToCloudinary(file.buffer, {
              folder: 'products/videos',
              resource_type: 'video'
            });
            console.log('Full Cloudinary video result:', JSON.stringify(result, null, 2));
            console.log(`Video uploaded successfully: ${result.url}`);
            
            // Validate that we got the required fields
            if (!result.url || !result.public_id) {
              console.error('Invalid Cloudinary response - missing url or public_id:', result);
              throw new Error('Cloudinary upload succeeded but returned incomplete data');
            }
            
            uploadedVideos.push({
              url: result.url,
              public_id: result.public_id
            });
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

        // Handle attributes from form data
        if (productData.attributes && typeof productData.attributes === 'string') {
          try {
            productData.attributes = JSON.parse(productData.attributes);
          } catch (error) {
            console.error('Error parsing attributes:', error);
            productData.attributes = [];
          }
        } else if (!productData.attributes) {
          productData.attributes = [];
        }

        // Filter out empty attributes to prevent validation errors
        if (Array.isArray(productData.attributes)) {
          productData.attributes = productData.attributes.filter(attr => {
            // Remove attributes that don't have a name or have empty values
            if (!attr.name || attr.name.trim() === '') {
              return false;
            }
            
            // Filter out empty values within the attribute
            if (attr.values && Array.isArray(attr.values)) {
              attr.values = attr.values.filter(val => {
                return val.value && val.value.trim() !== '';
              });
              
              // If no valid values remain, remove the entire attribute
              if (attr.values.length === 0) {
                return false;
              }
            }
            
            return true;
          });
        }
        
        console.log('Cleaned attributes:', JSON.stringify(productData.attributes, null, 2));

        // Set isSellerProduct to true for seller-created products
        productData.isSellerProduct = true;
        productData.isAdminTagged = false; // Seller-created products are not admin-tagged
        productData.sellerShop = shopId; // Associate with the seller's shop

        console.log('Creating product with Cloudinary URLs:');
        console.log('Images:', uploadedImages);
        console.log('Videos:', uploadedVideos);
        console.log('Setting isSellerProduct: true for seller product');

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
      // Find products that are either:
      // 1. Created by this shop (shopId matches)
      // 2. Tagged to this shop by admin (sellerShop matches and isSellerProduct is true)
      const products = await Product.find({
        $or: [
          { shopId: req.params.id }, // Products created by this shop
          { 
            sellerShop: req.params.id, 
            isSellerProduct: true 
          } // Products tagged to this shop by admin
        ]
      })
        .populate('category', 'name _id parent')
        .populate('sellerShop', 'name email phoneNumber address avatar averageRating _id');

      // Products already have correct shop names based on their type
      const transformedProducts = products.map(product => {
        return product.toObject();
      });

      res.status(201).json({
        success: true,
        products: transformedProducts,
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
      console.log('Getting product with ID:', req.params.id);
      
      const product = await Product.findById(req.params.id)
        .populate('category', 'name _id parent')
        .populate('sellerShop', 'name email phoneNumber address avatar averageRating _id');

      if (!product) {
        return next(new ErrorHandler("Product not found with this id!", 404));
      }

      // Check if the shop still exists (only for seller products)
      // Admin products should be accessible even if assigned shop is deleted
      if (product.isSellerProduct !== false) {
        const Shop = require("../model/shop");
        let hasValidShop = false;
        
        // Check populated sellerShop
        if (product.sellerShop && product.sellerShop._id) {
          hasValidShop = true;
        } else {
          // Check other shop references
          let shopToCheck = null;
          
          if (product.shopId) {
            shopToCheck = product.shopId;
          } else if (product.shop && product.shop._id) {
            shopToCheck = product.shop._id;
          }
          
          if (shopToCheck) {
            const shopExists = await Shop.findById(shopToCheck);
            hasValidShop = !!shopExists;
          }
        }

        if (!hasValidShop) {
          console.log(`Seller product ${product._id} has deleted shop reference`);
          return next(new ErrorHandler("Product is no longer available (shop deleted)!", 404));
        }
      }

      console.log('Product found:', {
        id: product._id,
        name: product.name,
        isSellerProduct: product.isSellerProduct,
        sellerShop: product.sellerShop,
        sellerShopType: typeof product.sellerShop
      });

      // Product already has correct shop name based on its type
      const productObj = product.toObject();

      res.status(200).json({
        success: true,
        product: productObj,
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
        
        // First, upload all new images to Cloudinary
        const uploadedImages = [];
        for (const file of imageFiles) {
          try {
            console.log(`Uploading new image: ${file.originalname} (${file.mimetype})`);
            
            // Use buffer upload for memory storage
            const result = await uploadToCloudinary(file.buffer, {
              resource_type: 'image',
              folder: 'products/images',
              allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']
            });
            
            console.log(`New image uploaded successfully: ${result.url}`);
            uploadedImages.push({
              url: result.url,
              public_id: result.public_id
            });
          } catch (error) {
            console.error('Image upload error during update:', error);
            // Clean up any uploaded files before throwing error
            for (const uploaded of uploadedImages) {
              try {
                await deleteFromCloudinary(uploaded.public_id, 'image');
              } catch (cleanupError) {
                console.error('Error cleaning up uploaded images:', cleanupError);
              }
            }
            return next(new ErrorHandler(`Image upload failed: ${error.message}`, 400));
          }
        }

        // Only after successful upload of all new images, delete old images
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

        newImages = uploadedImages;
      } else {
        // Keep existing images if no new images are uploaded
        newImages = product.images;
        console.log(`Keeping ${newImages.length} existing images`);
      }

      // Handle video uploads
      if (videoFiles && videoFiles.length > 0) {
        console.log(`Processing ${videoFiles.length} new video files for update`);
        
        // First, upload all new videos to Cloudinary
        const uploadedVideos = [];
        for (const file of videoFiles) {
          try {
            console.log(`Uploading new video: ${file.originalname} (${file.mimetype})`);
            
            // Use buffer upload for memory storage
            const result = await uploadToCloudinary(file.buffer, {
              resource_type: 'video',
              folder: 'products/videos',
              allowed_formats: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
            });
            
            console.log(`New video uploaded successfully: ${result.url}`);
            uploadedVideos.push({
              url: result.url,
              public_id: result.public_id
            });
          } catch (error) {
            console.error('Video upload error during update:', error);
            // Clean up any uploaded files before throwing error
            for (const uploaded of uploadedVideos) {
              try {
                await deleteFromCloudinary(uploaded.public_id, 'video');
              } catch (cleanupError) {
                console.error('Error cleaning up uploaded videos:', cleanupError);
              }
            }
            return next(new ErrorHandler(`Video upload failed: ${error.message}`, 400));
          }
        }

        // Only after successful upload of all new videos, delete old videos
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

        newVideos = uploadedVideos;
      } else {
        // Keep existing videos if no new videos are uploaded
        newVideos = product.videos;
        console.log(`Keeping ${newVideos.length} existing videos`);
      }

      // Handle attributes parsing
      let parsedAttributes = product.attributes; // Default to existing attributes
      if (req.body.attributes) {
        try {
          parsedAttributes = typeof req.body.attributes === 'string' 
            ? JSON.parse(req.body.attributes) 
            : req.body.attributes;
        } catch (error) {
          console.error('Error parsing attributes:', error);
          return next(new ErrorHandler("Invalid attributes format", 400));
        }
      }

      const updateData = {
        name: req.body.name || product.name,
        description: req.body.description || product.description,
        category: req.body.category || product.category,
        tags: req.body.tags || product.tags,
        originalPrice: req.body.originalPrice || product.originalPrice,
        discountPrice: req.body.discountPrice || product.discountPrice,
        stock: req.body.stock || product.stock,
        attributes: parsedAttributes,
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
        .populate('sellerShop', 'name email phoneNumber address avatar averageRating _id')
        .sort({ createdAt: -1 });

      // Get all existing shop IDs for validation
      const Shop = require("../model/shop");
      const existingShops = await Shop.find({}, '_id');
      const existingShopIds = existingShops.map(shop => shop._id.toString());

      // Filter out only seller-created products with deleted shops
      // Admin products (isSellerProduct: false) should remain visible even if assigned shop is deleted
      const validProducts = products.filter(product => {
        // Keep all admin products regardless of shop status
        if (product.isSellerProduct === false) {
          return true;
        }
        
        // For seller products, check if shop still exists
        let hasValidShop = false;
        
        // Check sellerShop (populated)
        if (product.sellerShop && product.sellerShop._id) {
          hasValidShop = true;
        }
        
        // Check shopId (string) - verify it exists in database
        if (product.shopId && existingShopIds.includes(product.shopId.toString())) {
          hasValidShop = true;
        }
        
        // Check shop object
        if (product.shop) {
          if (product.shop._id && existingShopIds.includes(product.shop._id.toString())) {
            hasValidShop = true;
          }
        }
        
        if (!hasValidShop && product.isSellerProduct !== false) {
          console.log(`Filtering out seller product ${product._id} with invalid shop reference`);
        }
        
        return hasValidShop;
      });

      // Products already have correct shop names based on their type
      const transformedProducts = validProducts.map(product => {
        return product.toObject();
      });

      res.status(201).json({
        success: true,
        products: transformedProducts,
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

// Admin create product
router.post(
  "/admin-create-product",
  isAuthenticated,
  isAdmin("Admin"),
  uploadFields,
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log('Admin creating product with data:', req.body);
      
      const imageFiles = req.files['images'] || [];
      const videoFiles = req.files['videos'] || [];
      console.log(`Admin product: Processing ${imageFiles.length} image files and ${videoFiles.length} video files`);
      
      // Upload images to Cloudinary
      const imageUploads = [];
      if (imageFiles && imageFiles.length > 0) {
        console.log('Processing', imageFiles.length, 'image files');
        for (const file of imageFiles) {
          try {
            if (!file.buffer || file.buffer.length === 0) {
              console.error('Empty file buffer for:', file.originalname);
              return next(new ErrorHandler(`File ${file.originalname} is empty or corrupted`, 400));
            }
            
            console.log('Uploading admin product image to Cloudinary:', file.originalname);
            const result = await uploadToCloudinary(file.buffer, {
              folder: 'products',
              resource_type: 'image'
            });
            
            console.log('Cloudinary upload result:', { 
              secure_url: result.secure_url, 
              public_id: result.public_id,
              url: result.url 
            });
            
            const imageData = {
              url: result.secure_url || result.url || `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/${result.public_id}`,
              public_id: result.public_id
            };
            
            // Ensure URL is not undefined
            if (!imageData.url) {
              console.error('Image URL is undefined, using fallback');
              imageData.url = 'https://via.placeholder.com/400x300/cccccc/666666?text=Image+Error';
            }
            
            imageUploads.push(imageData);
            console.log('Admin product image uploaded successfully:', result.public_id);
            console.log('Image data added to array:', imageData);
          } catch (uploadError) {
            console.error('Error uploading admin product image to Cloudinary:', uploadError);
            return next(new ErrorHandler(`Failed to upload image ${file.originalname}: ${uploadError.message}`, 500));
          }
        }
      } else {
        // Provide a default image for admin products if none uploaded
        imageUploads.push({
          url: 'https://via.placeholder.com/400x300/cccccc/666666?text=No+Image',
          public_id: 'default-product-image'
        });
        console.log('Using default image for admin product');
      }

      // Upload videos to Cloudinary
      const videoUploads = [];
      if (videoFiles && videoFiles.length > 0) {
        console.log('Processing', videoFiles.length, 'video files');
        for (const file of videoFiles) {
          try {
            if (!file.buffer || file.buffer.length === 0) {
              console.error('Empty video file buffer for:', file.originalname);
              return next(new ErrorHandler(`Video file ${file.originalname} is empty or corrupted`, 400));
            }
            
            console.log('Uploading admin product video to Cloudinary:', file.originalname);
            const result = await uploadToCloudinary(file.buffer, {
              folder: 'products/videos',
              resource_type: 'video'
            });
            
            console.log('Cloudinary video upload result:', { 
              secure_url: result.secure_url, 
              public_id: result.public_id,
              url: result.url 
            });
            
            const videoData = {
              url: result.secure_url || result.url || `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/video/upload/${result.public_id}`,
              public_id: result.public_id
            };
            
            // Ensure URL is not undefined
            if (!videoData.url) {
              console.error('Video URL is undefined, skipping this video');
              continue;
            }
            
            videoUploads.push(videoData);
            console.log('Admin product video uploaded successfully:', result.public_id);
            console.log('Video data added to array:', videoData);
          } catch (uploadError) {
            console.error('Error uploading admin product video to Cloudinary:', uploadError);
            return next(new ErrorHandler(`Failed to upload video ${file.originalname}: ${uploadError.message}`, 500));
          }
        }
      }

      const productData = req.body;
      productData.images = imageUploads;
      productData.videos = videoUploads;
      
      // Handle attributes from form data
      if (productData.attributes && typeof productData.attributes === 'string') {
        try {
          productData.attributes = JSON.parse(productData.attributes);
        } catch (error) {
          console.error('Error parsing attributes:', error);
          productData.attributes = [];
        }
      } else if (!productData.attributes) {
        productData.attributes = [];
      }
      
      // Filter out empty attributes to prevent validation errors
      if (Array.isArray(productData.attributes)) {
        productData.attributes = productData.attributes.filter(attr => {
          // Remove attributes that don't have a name or have empty values
          if (!attr.name || attr.name.trim() === '') {
            return false;
          }
          
          // Filter out empty values within the attribute
          if (attr.values && Array.isArray(attr.values)) {
            attr.values = attr.values.filter(val => {
              return val.value && val.value.trim() !== '';
            });
            
            // If no valid values remain, remove the entire attribute
            if (attr.values.length === 0) {
              return false;
            }
          }
          
          return true;
        });
      }
      
      console.log('Cleaned attributes:', JSON.stringify(productData.attributes, null, 2));
      
      // Handle sellerShop field properly - remove if empty or if not a seller product
      if (!productData.isSellerProduct || !productData.sellerShop || productData.sellerShop === '' || productData.sellerShop === 'undefined') {
        delete productData.sellerShop;
        productData.isSellerProduct = false;
      }
      
      console.log('Final imageUploads array:', JSON.stringify(imageUploads, null, 2));
      console.log('Final videoUploads array:', JSON.stringify(videoUploads, null, 2));
      console.log('ProductData.images before saving:', JSON.stringify(productData.images, null, 2));
      console.log('ProductData.videos before saving:', JSON.stringify(productData.videos, null, 2));
      
      // Final validation - ensure all images have required fields
      if (productData.images && productData.images.length > 0) {
        productData.images = productData.images.map((img, index) => {
          if (!img.url) {
            console.error(`Image ${index} missing URL, adding fallback`);
            img.url = 'https://via.placeholder.com/400x300/cccccc/666666?text=Missing+URL';
          }
          if (!img.public_id) {
            console.error(`Image ${index} missing public_id, adding fallback`);
            img.public_id = `fallback-${Date.now()}-${index}`;
          }
          return img;
        });
        console.log('Images after validation:', JSON.stringify(productData.images, null, 2));
      }
      
      // Handle shop and shopId assignment based on product type
      console.log('Setting up shop information for product:', {
        isSellerProduct: productData.isSellerProduct,
        sellerShop: productData.sellerShop
      });
      
      if (productData.isSellerProduct && productData.sellerShop) {
        // This is an admin-tagged seller product
        try {
          const selectedSeller = await Shop.findById(productData.sellerShop);
          if (selectedSeller) {
            productData.shopId = selectedSeller._id.toString();
            productData.shop = {
              _id: selectedSeller._id,
              name: selectedSeller.name,
              email: selectedSeller.email,
              avatar: selectedSeller.avatar || {
                public_id: 'seller-default',
                url: 'https://via.placeholder.com/150/10B981/FFFFFF?text=SELLER'
              }
            };
            // Mark as admin tagged since admin is creating and assigning to seller
            productData.isAdminTagged = true;
            console.log('Successfully set admin-tagged seller product:', productData.shop.name);
          } else {
            console.error('Selected seller not found:', productData.sellerShop);
            return next(new ErrorHandler("Selected seller not found", 400));
          }
        } catch (error) {
          console.error('Error fetching seller information:', error);
          return next(new ErrorHandler(`Error fetching seller information: ${error.message}`, 400));
        }
      } else if (!productData.isSellerProduct || !productData.sellerShop) {
        // This is a pure admin product (no seller selected or not a seller product)
        productData.isSellerProduct = false;
        delete productData.sellerShop;
        productData.shopId = 'admin';
        productData.shop = {
          _id: 'admin',
          name: 'Platform Admin',
          email: req.user.email || 'admin@platform.com',
          avatar: req.user.avatar || {
            public_id: 'admin-default',
            url: 'https://via.placeholder.com/150/4F46E5/FFFFFF?text=ADMIN'
          }
        };
        console.log('Set as admin product');
      }

      console.log('Full productData before create:', JSON.stringify(productData, null, 2));
      const product = await Product.create(productData);
      console.log('Admin product created successfully');

      res.status(201).json({
        success: true,
        product,
        message: "Product created successfully!"
      });
    } catch (error) {
      console.error('Error creating admin product:', error);
      return next(new ErrorHandler(error.message || error, 400));
    }
  })
);

// Admin update product
router.put(
  "/admin-update-product/:id",
  isAuthenticated,
  isAdmin("Admin"),
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.id;
      console.log('Admin updating product:', productId);

      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        return next(new ErrorHandler("Product not found", 404));
      }

      const files = req.files;
      let imageUploads = existingProduct.images || [];

      // If new images are uploaded, replace existing ones
      if (files && files.length > 0) {
        console.log('Processing', files.length, 'new image files');
        
        // Delete old images from Cloudinary if they exist
        if (existingProduct.images && existingProduct.images.length > 0) {
          for (const img of existingProduct.images) {
            if (img.public_id && img.public_id !== 'default-product-image') {
              try {
                await cloudinary.uploader.destroy(img.public_id);
                console.log('Deleted old image:', img.public_id);
              } catch (deleteError) {
                console.error('Error deleting old image:', deleteError);
              }
            }
          }
        }

        // Upload new images
        imageUploads = [];
        for (const file of files) {
          try {
            if (!file.buffer || file.buffer.length === 0) {
              console.error('Empty file buffer for:', file.originalname);
              return next(new ErrorHandler(`File ${file.originalname} is empty or corrupted`, 400));
            }
            
            console.log('Uploading new admin product image to Cloudinary:', file.originalname);
            const result = await uploadToCloudinary(file.buffer, {
              folder: 'products',
              resource_type: 'image'
            });
            
            imageUploads.push({
              url: result.secure_url,
              public_id: result.public_id
            });
            console.log('New admin product image uploaded successfully:', result.public_id);
          } catch (uploadError) {
            console.error('Error uploading new admin product image to Cloudinary:', uploadError);
            return next(new ErrorHandler(`Failed to upload image ${file.originalname}: ${uploadError.message}`, 500));
          }
        }
      }

      const updateData = {
        ...req.body,
        images: imageUploads
      };

      // Parse attributes if they exist and are a string
      if (updateData.attributes && typeof updateData.attributes === 'string') {
        try {
          updateData.attributes = JSON.parse(updateData.attributes);
        } catch (parseError) {
          console.error('Error parsing attributes:', parseError);
          return next(new ErrorHandler("Invalid attributes format", 400));
        }
      }

      // Handle sellerShop field properly - remove if empty or if not a seller product
      if (updateData.isSellerProduct === false) {
        if (updateData.sellerShop && updateData.sellerShop !== '' && updateData.sellerShop !== 'undefined') {
          // This is an admin product tagged to a supplier - show supplier name with "(Admin Tagged)"
          try {
            const selectedSeller = await Shop.findById(updateData.sellerShop);
            if (selectedSeller) {
              updateData.shopId = selectedSeller._id;
              updateData.shop = {
                _id: selectedSeller._id,
                name: `${selectedSeller.name} (Admin Tagged)`,
                email: selectedSeller.email,
                avatar: selectedSeller.avatar
              };
            } else {
              // Fallback if seller not found
              console.warn('Selected seller not found during update, falling back to admin');
              delete updateData.sellerShop;
              updateData.shopId = 'admin';
              updateData.shop = {
                _id: 'admin',
                name: 'Platform Admin',
                email: req.user.email || 'admin@platform.com',
                avatar: {
                  public_id: 'admin-avatar',
                  url: '/default-admin-avatar.png'
                }
              };
            }
          } catch (error) {
            console.error('Error fetching seller information during update:', error);
            // Fallback to admin
            delete updateData.sellerShop;
            updateData.shopId = 'admin';
            updateData.shop = {
              _id: 'admin',
              name: 'Platform Admin',
              email: req.user.email || 'admin@platform.com',
              avatar: {
                public_id: 'admin-avatar',
                url: '/default-admin-avatar.png'
              }
            };
          }
        } else {
          // Pure admin product - show "Platform Admin"
          delete updateData.sellerShop;
          updateData.shopId = 'admin';
          updateData.shop = {
            _id: 'admin',
            name: 'Platform Admin',
            email: req.user.email || 'admin@platform.com',
            avatar: {
              public_id: 'admin-avatar',
              url: '/default-admin-avatar.png'
            }
          };
        }
      } else if (updateData.isSellerProduct === true && updateData.sellerShop && updateData.sellerShop !== '' && updateData.sellerShop !== 'undefined') {
        // This is a seller product - show seller name without "(Admin Tagged)"
        try {
          const selectedSeller = await Shop.findById(updateData.sellerShop);
          if (selectedSeller) {
            updateData.shopId = selectedSeller._id;
            updateData.shop = {
              _id: selectedSeller._id,
              name: selectedSeller.name,
              email: selectedSeller.email,
              avatar: selectedSeller.avatar
            };
          }
        } catch (error) {
          console.error('Error fetching seller shop for seller product during update:', error);
        }
      } else {
        // Invalid seller product state - fallback to admin
        delete updateData.sellerShop;
        updateData.isSellerProduct = false;
        updateData.shopId = 'admin';
        updateData.shop = {
          _id: 'admin',
          name: 'Platform Admin',
          email: req.user.email || 'admin@platform.com',
          avatar: {
            public_id: 'admin-avatar',
            url: '/default-admin-avatar.png'
          }
        };
      }

      console.log('Updating product with data:', JSON.stringify(updateData, null, 2));
      const product = await Product.findByIdAndUpdate(productId, updateData, {
        new: true,
        runValidators: true
      });

      console.log('Admin product updated successfully');
      res.status(200).json({
        success: true,
        product,
        message: "Product updated successfully!"
      });
    } catch (error) {
      console.error('Error updating admin product:', error);
      return next(new ErrorHandler(error.message || error, 400));
    }
  })
);

// Admin delete product
router.delete(
  "/admin-delete-product/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.id;
      console.log('Admin deleting product:', productId);

      const product = await Product.findById(productId);
      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      // Delete images from Cloudinary
      if (product.images && product.images.length > 0) {
        for (const img of product.images) {
          if (img.public_id && img.public_id !== 'default-product-image') {
            try {
              await cloudinary.uploader.destroy(img.public_id);
              console.log('Deleted product image:', img.public_id);
            } catch (deleteError) {
              console.error('Error deleting product image:', deleteError);
            }
          }
        }
      }

      await Product.findByIdAndDelete(productId);
      console.log('Admin product deleted successfully');

      res.status(200).json({
        success: true,
        message: "Product deleted successfully!"
      });
    } catch (error) {
      console.error('Error deleting admin product:', error);
      return next(new ErrorHandler(error.message || error, 400));
    }
  })
);

// Admin toggle product status (publish/unpublish)
router.patch(
  "/admin-toggle-product-status/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.id;
      const { isPublished } = req.body;
      console.log('Admin toggling product status:', productId, 'to:', isPublished);

      const product = await Product.findById(productId);
      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      product.isPublished = isPublished;
      await product.save();

      console.log('Admin product status updated successfully');
      res.status(200).json({
        success: true,
        product,
        message: `Product ${isPublished ? 'published' : 'unpublished'} successfully!`
      });
    } catch (error) {
      console.error('Error updating admin product status:', error);
      return next(new ErrorHandler(error.message || error, 400));
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
      const products = await Product.find()
        .populate('sellerShop', 'name email phoneNumber address avatar averageRating _id')
        .sort({
          createdAt: -1,
        });

      // Products already have correct shop names based on their type
      const transformedProducts = products.map(product => {
        return product.toObject();
      });

      res.status(201).json({
        success: true,
        products: transformedProducts,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update product shipping configuration
router.put(
  "/update-shipping/:productId",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { productId } = req.params;
      const { shipping } = req.body;

      // Find the product and verify it belongs to the seller
      const product = await Product.findOne({
        _id: productId,
        shopId: req.seller.id
      });

      if (!product) {
        return next(new ErrorHandler("Product not found or unauthorized", 404));
      }

      // Update shipping configuration with precision handling
      product.shipping = {
        baseShippingRate: shipping.baseShippingRate ? Math.round(shipping.baseShippingRate * 100) / 100 : 0,
        freeShippingThreshold: shipping.freeShippingThreshold ? Math.round(shipping.freeShippingThreshold * 100) / 100 : null,
        weight: shipping.weight ? Math.round(shipping.weight * 100) / 100 : 1,
        dimensions: {
          length: shipping.dimensions?.length ? Math.round(shipping.dimensions.length * 100) / 100 : 10,
          width: shipping.dimensions?.width ? Math.round(shipping.dimensions.width * 100) / 100 : 10,
          height: shipping.dimensions?.height ? Math.round(shipping.dimensions.height * 100) / 100 : 5,
        },
        expressDeliveryAvailable: shipping.expressDeliveryAvailable ?? true,
        estimatedDeliveryDays: {
          min: shipping.estimatedDeliveryDays?.min || 2,
          max: shipping.estimatedDeliveryDays?.max || 7,
        },
        restrictions: {
          customServicePincodes: shipping.restrictions?.customServicePincodes || [],
          excludePincodes: shipping.restrictions?.excludePincodes || [],
          requiresSpecialHandling: shipping.restrictions?.requiresSpecialHandling || false,
          specialHandlingCharge: shipping.restrictions?.specialHandlingCharge || 0,
        },
      };

      await product.save();

      res.status(200).json({
        success: true,
        message: "Product shipping configuration updated successfully",
        product,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Bulk update shipping configuration for multiple products
router.put(
  "/bulk-update-shipping",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { productIds, shipping } = req.body;

      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return next(new ErrorHandler("Please provide valid product IDs", 400));
      }

      // Find all products that belong to this seller
      const products = await Product.find({
        _id: { $in: productIds },
        shopId: req.seller.id
      });

      if (products.length !== productIds.length) {
        return next(new ErrorHandler("Some products not found or unauthorized", 404));
      }

      // Prepare shipping configuration with precision handling
      const shippingConfig = {
        baseShippingRate: shipping.baseShippingRate ? Math.round(shipping.baseShippingRate * 100) / 100 : 0,
        freeShippingThreshold: shipping.freeShippingThreshold ? Math.round(shipping.freeShippingThreshold * 100) / 100 : null,
        weight: shipping.weight ? Math.round(shipping.weight * 100) / 100 : 1,
        dimensions: {
          length: shipping.dimensions?.length ? Math.round(shipping.dimensions.length * 100) / 100 : 10,
          width: shipping.dimensions?.width ? Math.round(shipping.dimensions.width * 100) / 100 : 10,
          height: shipping.dimensions?.height ? Math.round(shipping.dimensions.height * 100) / 100 : 5,
        },
        expressDeliveryAvailable: shipping.expressDeliveryAvailable ?? true,
        estimatedDeliveryDays: {
          min: shipping.estimatedDeliveryDays?.min || 2,
          max: shipping.estimatedDeliveryDays?.max || 7,
        },
        restrictions: {
          customServicePincodes: shipping.restrictions?.customServicePincodes || [],
          excludePincodes: shipping.restrictions?.excludePincodes || [],
          requiresSpecialHandling: shipping.restrictions?.requiresSpecialHandling || false,
          specialHandlingCharge: shipping.restrictions?.specialHandlingCharge || 0,
        },
      };

      // Update all products
      await Product.updateMany(
        {
          _id: { $in: productIds },
          shopId: req.seller.id
        },
        {
          $set: { shipping: shippingConfig }
        }
      );

      res.status(200).json({
        success: true,
        message: `Shipping configuration updated for ${products.length} products`,
        updatedCount: products.length,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Add custom service pincodes for a product
router.put(
  "/add-custom-pincodes/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { pincodes } = req.body; // Array of pincode strings
      
      if (!pincodes || !Array.isArray(pincodes) || pincodes.length === 0) {
        return next(new ErrorHandler("Please provide valid pincodes array", 400));
      }

      // Validate pincode format
      const validPincodes = pincodes.filter(pincode => 
        typeof pincode === 'string' && /^\d{6}$/.test(pincode.trim())
      );

      if (validPincodes.length === 0) {
        return next(new ErrorHandler("No valid pincodes provided", 400));
      }

      const product = await Product.findById(req.params.id);

      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      if (product.shopId.toString() !== req.seller.id) {
        return next(new ErrorHandler("Access denied", 403));
      }

      // Initialize shipping structure if it doesn't exist
      if (!product.shipping) {
        product.shipping = {
          restrictions: {
            customServicePincodes: [],
            excludePincodes: []
          }
        };
      } else if (!product.shipping.restrictions) {
        product.shipping.restrictions = {
          customServicePincodes: [],
          excludePincodes: []
        };
      } else if (!product.shipping.restrictions.customServicePincodes) {
        product.shipping.restrictions.customServicePincodes = [];
      }

      // Add unique pincodes
      const existingPincodes = product.shipping.restrictions.customServicePincodes || [];
      const newPincodes = validPincodes.filter(pincode => 
        !existingPincodes.includes(pincode.trim())
      );

      product.shipping.restrictions.customServicePincodes = [
        ...existingPincodes,
        ...newPincodes.map(p => p.trim())
      ];

      await product.save();

      res.status(200).json({
        success: true,
        message: `Added ${newPincodes.length} new service pincodes`,
        data: {
          productId: product._id,
          totalPincodes: product.shipping.restrictions.customServicePincodes.length,
          addedPincodes: newPincodes,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Remove custom service pincodes for a product
router.put(
  "/remove-custom-pincodes/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { pincodes } = req.body; // Array of pincode strings to remove
      
      if (!pincodes || !Array.isArray(pincodes) || pincodes.length === 0) {
        return next(new ErrorHandler("Please provide valid pincodes array", 400));
      }

      const product = await Product.findById(req.params.id);

      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      if (product.shopId.toString() !== req.seller.id) {
        return next(new ErrorHandler("Access denied", 403));
      }

      if (!product.shipping?.restrictions?.customServicePincodes) {
        return res.status(200).json({
          success: true,
          message: "No custom pincodes to remove",
          data: {
            productId: product._id,
            totalPincodes: 0,
            removedPincodes: [],
          },
        });
      }

      const beforeCount = product.shipping.restrictions.customServicePincodes.length;
      
      product.shipping.restrictions.customServicePincodes = 
        product.shipping.restrictions.customServicePincodes.filter(pincode =>
          !pincodes.includes(pincode)
        );

      const afterCount = product.shipping.restrictions.customServicePincodes.length;
      const removedCount = beforeCount - afterCount;

      await product.save();

      res.status(200).json({
        success: true,
        message: `Removed ${removedCount} service pincodes`,
        data: {
          productId: product._id,
          totalPincodes: afterCount,
          removedCount: removedCount,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Clear all custom service pincodes for a product
router.put(
  "/clear-custom-pincodes/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      if (product.shopId.toString() !== req.seller.id) {
        return next(new ErrorHandler("Access denied", 403));
      }

      const beforeCount = product.shipping?.restrictions?.customServicePincodes?.length || 0;

      if (product.shipping?.restrictions) {
        product.shipping.restrictions.customServicePincodes = [];
      }

      await product.save();

      res.status(200).json({
        success: true,
        message: `Cleared ${beforeCount} custom service pincodes`,
        data: {
          productId: product._id,
          clearedCount: beforeCount,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Bulk upload custom pincodes from Excel
router.post(
  "/upload-custom-pincodes/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { pincodes, replaceExisting = false } = req.body;
      
      if (!pincodes || !Array.isArray(pincodes) || pincodes.length === 0) {
        return next(new ErrorHandler("Please provide valid pincodes array", 400));
      }

      // Validate and clean pincodes
      const validPincodes = pincodes
        .map(pincode => String(pincode).trim())
        .filter(pincode => /^\d{6}$/.test(pincode))
        .filter((pincode, index, arr) => arr.indexOf(pincode) === index); // Remove duplicates

      if (validPincodes.length === 0) {
        return next(new ErrorHandler("No valid pincodes provided", 400));
      }

      const product = await Product.findById(req.params.id);

      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      if (product.shopId.toString() !== req.seller.id) {
        return next(new ErrorHandler("Access denied", 403));
      }

      // Initialize shipping structure if needed
      if (!product.shipping) {
        product.shipping = { restrictions: { customServicePincodes: [], excludePincodes: [] } };
      } else if (!product.shipping.restrictions) {
        product.shipping.restrictions = { customServicePincodes: [], excludePincodes: [] };
      } else if (!product.shipping.restrictions.customServicePincodes) {
        product.shipping.restrictions.customServicePincodes = [];
      }

      let finalPincodes;
      if (replaceExisting) {
        finalPincodes = validPincodes;
      } else {
        const existingPincodes = product.shipping.restrictions.customServicePincodes || [];
        finalPincodes = [...new Set([...existingPincodes, ...validPincodes])];
      }

      product.shipping.restrictions.customServicePincodes = finalPincodes;
      await product.save();

      res.status(200).json({
        success: true,
        message: `Successfully uploaded ${validPincodes.length} pincodes`,
        data: {
          productId: product._id,
          totalPincodes: finalPincodes.length,
          uploadedPincodes: validPincodes.length,
          replacedExisting: replaceExisting,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update product GST settings
router.put(
  "/update-product-gst/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { gstConfiguration } = req.body;
      const productId = req.params.id;

      // Find the product
      const product = await Product.findById(productId);
      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      // Check if the seller owns this product
      if (product.shopId.toString() !== req.seller.id.toString()) {
        return next(new ErrorHandler("You can only update your own products", 403));
      }

      // Validate GST configuration
      if (gstConfiguration) {
        const {
          isGstApplicable,
          gstType,
          cgstRate,
          sgstRate,
          combinedGstRate,
          hsnCode,
        } = gstConfiguration;

        // Basic validation
        if (isGstApplicable) {
          if (gstType === "separate") {
            if (
              typeof cgstRate !== "number" ||
              typeof sgstRate !== "number" ||
              cgstRate < 0 ||
              cgstRate > 100 ||
              sgstRate < 0 ||
              sgstRate > 100
            ) {
              return next(
                new ErrorHandler("Invalid CGST or SGST rate. Must be between 0 and 100", 400)
              );
            }
          } else if (gstType === "combined") {
            if (
              typeof combinedGstRate !== "number" ||
              combinedGstRate < 0 ||
              combinedGstRate > 100
            ) {
              return next(
                new ErrorHandler("Invalid combined GST rate. Must be between 0 and 100", 400)
              );
            }
          } else {
            return next(new ErrorHandler("Invalid GST type", 400));
          }
        }

        // Update GST configuration
        product.gstConfiguration = {
          isGstApplicable: Boolean(isGstApplicable),
          gstType: gstType || "separate",
          cgstRate: Number(cgstRate) || 0,
          sgstRate: Number(sgstRate) || 0,
          combinedGstRate: Number(combinedGstRate) || 0,
          hsnCode: hsnCode || "",
        };

        await product.save();

        res.status(200).json({
          success: true,
          message: "Product GST settings updated successfully",
          product: {
            _id: product._id,
            name: product.name,
            gstConfiguration: product.gstConfiguration,
          },
        });
      } else {
        return next(new ErrorHandler("GST configuration is required", 400));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Clean up orphaned products (Admin only) - products with deleted shops
router.delete(
  "/admin-cleanup-orphaned-products",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("Starting cleanup of orphaned products...");
      
      // Get all existing shop IDs
      const Shop = require("../model/shop");
      const existingShops = await Shop.find({}, '_id');
      const existingShopIds = existingShops.map(shop => shop._id.toString());
      
      console.log(`Found ${existingShopIds.length} existing shops`);
      
      // Find all products
      const allProducts = await Product.find();
      console.log(`Found ${allProducts.length} total products`);
      
      // Find orphaned products - ONLY seller-created products that reference non-existent shops
      const orphanedProducts = allProducts.filter(product => {
        // First check if this is a seller product - if not, don't delete it
        if (product.isSellerProduct === false) {
          return false; // Don't delete admin products
        }
        
        let hasValidShop = false;
        
        // Check shopId (string)
        if (product.shopId && existingShopIds.includes(product.shopId.toString())) {
          hasValidShop = true;
        }
        
        // Check sellerShop (ObjectId)
        if (product.sellerShop && existingShopIds.includes(product.sellerShop.toString())) {
          hasValidShop = true;
        }
        
        // Check shop object
        if (product.shop) {
          if (product.shop._id && existingShopIds.includes(product.shop._id.toString())) {
            hasValidShop = true;
          }
          if (product.shop.id && existingShopIds.includes(product.shop.id.toString())) {
            hasValidShop = true;
          }
        }
        
        if (!hasValidShop) {
          console.log(`Found orphaned SELLER product: ${product._id} - ${product.name} (isSellerProduct: ${product.isSellerProduct})`);
          console.log(`  shopId: ${product.shopId}`);
          console.log(`  sellerShop: ${product.sellerShop}`);
          console.log(`  shop: ${JSON.stringify(product.shop)}`);
        }
        
        return !hasValidShop;
      });
      
      console.log(`Found ${orphanedProducts.length} orphaned SELLER products`);
      
      if (orphanedProducts.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No orphaned seller products found. Admin products are preserved.",
          deletedCount: 0
        });
      }

      // Delete orphaned products
      const orphanedProductIds = orphanedProducts.map(product => product._id);
      const deleteResult = await Product.deleteMany({
        _id: { $in: orphanedProductIds }
      });

      // Also clean up related data for these products
      const Event = require("../model/event");
      const VideoBanner = require("../model/videoBanner");
      
      // Delete events that reference these products
      const deletedEvents = await Event.deleteMany({
        productId: { $in: orphanedProductIds }
      });

      // Delete video banners that reference these products
      const deletedVideoBanners = await VideoBanner.deleteMany({
        productId: { $in: orphanedProductIds }
      });

      console.log(`Cleanup completed: ${deleteResult.deletedCount} seller products, ${deletedEvents.deletedCount} events, ${deletedVideoBanners.deletedCount} video banners`);

      res.status(200).json({
        success: true,
        message: `Successfully cleaned up ${deleteResult.deletedCount} orphaned seller products. Admin products with deleted shops are preserved.`,
        deletedCount: deleteResult.deletedCount,
        deletedEvents: deletedEvents.deletedCount,
        deletedVideoBanners: deletedVideoBanners.deletedCount,
        orphanedProductIds: orphanedProductIds.map(id => id.toString())
      });
    } catch (error) {
      console.error("Cleanup error:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Fix product ownership flags (Admin only) - identify and set isSellerProduct correctly
router.put(
  "/admin-fix-product-ownership",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("Starting product ownership fix...");
      
      // Get all existing shop IDs
      const Shop = require("../model/shop");
      const existingShops = await Shop.find({}, '_id');
      const existingShopIds = existingShops.map(shop => shop._id.toString());
      
      console.log(`Found ${existingShopIds.length} existing shops:`, existingShopIds);
      
      // Find all products
      const allProducts = await Product.find();
      console.log(`Found ${allProducts.length} total products`);
      
      const updatedProducts = [];
      const removedProducts = [];
      
      for (let product of allProducts) {
        console.log(`\nProcessing product: ${product.name} (${product._id})`);
        console.log(`  shopId: ${product.shopId}`);
        console.log(`  sellerShop: ${product.sellerShop}`);
        console.log(`  isSellerProduct: ${product.isSellerProduct}`);
        
        // Check if this is an admin product (shopId === 'admin' or no shopId)
        if (product.shopId === 'admin' || !product.shopId) {
          // This is an admin product - ensure isSellerProduct is false
          if (product.isSellerProduct !== false) {
            await Product.findByIdAndUpdate(product._id, { 
              isSellerProduct: false,
              sellerShop: null 
            });
            updatedProducts.push({
              _id: product._id,
              name: product.name,
              action: 'Set as admin product'
            });
            console.log(`  ✅ Updated to admin product`);
          } else {
            console.log(`  ✅ Already correct admin product`);
          }
          continue;
        }
        
        // Check if the shop exists
        const shopExists = existingShopIds.includes(product.shopId.toString());
        console.log(`  Shop exists: ${shopExists}`);
        
        if (shopExists) {
          // Shop exists - this should be a seller product
          if (product.isSellerProduct !== true) {
            await Product.findByIdAndUpdate(product._id, { 
              isSellerProduct: true,
              sellerShop: product.shopId
            });
            updatedProducts.push({
              _id: product._id,
              name: product.name,
              action: 'Set as seller product'
            });
            console.log(`  ✅ Updated to seller product`);
          } else {
            console.log(`  ✅ Already correct seller product`);
          }
        } else {
          // Shop doesn't exist - this is orphaned, remove it
          await Product.findByIdAndDelete(product._id);
          removedProducts.push({
            _id: product._id,
            name: product.name,
            shopId: product.shopId
          });
          console.log(`  ❌ Removed orphaned product (shop not found)`);
        }
      }
      
      console.log(`\nOwnership fix completed:`);
      console.log(`- Updated: ${updatedProducts.length} products`);
      console.log(`- Removed: ${removedProducts.length} orphaned products`);

      res.status(200).json({
        success: true,
        message: `Successfully fixed product ownership. Updated ${updatedProducts.length} products, removed ${removedProducts.length} orphaned products.`,
        updatedCount: updatedProducts.length,
        removedCount: removedProducts.length,
        updatedProducts,
        removedProducts
      });
    } catch (error) {
      console.error("Product ownership fix error:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
