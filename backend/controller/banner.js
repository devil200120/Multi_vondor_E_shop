const express = require("express");
const router = express.Router();
const Banner = require("../model/banner");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAdmin, isAuthenticated, requirePermission } = require("../middleware/auth");
const { upload } = require("../multer");
const { uploadImageToCloudinary, deleteFromCloudinary, uploadToCloudinary } = require("../config/cloudinary");

// Get active banner content
router.get(
  "/get-banner",
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Check all banners first
      const allBanners = await Banner.find({});
      console.log('=== ALL BANNERS IN DATABASE ===');
      console.log('Total banners found:', allBanners.length);
      allBanners.forEach((banner, index) => {
        console.log(`Banner ${index + 1}:`, {
          id: banner._id,
          isActive: banner.isActive,
          displayMode: banner.displayMode,
          imagesCount: banner.images ? banner.images.length : 0,
          createdAt: banner.createdAt,
          updatedAt: banner.updatedAt
        });
      });

      let banner = await Banner.findOne({ isActive: true });
      
      // If no banner exists, create default one
      if (!banner) {
        banner = await Banner.create({});
      }

      console.log('=== SELECTED BANNER FOR PUBLIC ===');
      console.log('Banner ID:', banner._id);
      console.log('Banner display mode:', banner.displayMode);
      console.log('Banner images count:', banner.images ? banner.images.length : 0);
      console.log('Banner images:', banner.images);

      res.status(200).json({
        success: true,
        banner,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update banner content (Admin and Manager with canManageContent)
router.put(
  "/update-banner",
  isAuthenticated,
  requirePermission('canManageContent'),
  upload.array('slidingImages', 10), // Support multiple images for sliding
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        title,
        subtitle,
        description,
        buttonText,
        secondaryButtonText,
        customerCount,
        customerLabel,
        productCount,
        productLabel,
        satisfactionCount,
        satisfactionLabel,
        displayMode,
        autoSlideInterval,
        transitionEffect,
        slidingImagesData
      } = req.body;

      let banner = await Banner.findOne({ isActive: true });
      
      // If no banner exists, create one
      if (!banner) {
        banner = new Banner();
      }

      // Update banner fields
      if (title) banner.title = title;
      if (subtitle) banner.subtitle = subtitle;
      if (description) banner.description = description;
      if (buttonText) banner.buttonText = buttonText;
      if (secondaryButtonText) banner.secondaryButtonText = secondaryButtonText;

      // Update display mode and sliding settings
      if (displayMode) banner.displayMode = displayMode;
      if (autoSlideInterval) banner.autoSlideInterval = parseInt(autoSlideInterval);
      if (transitionEffect) banner.transitionEffect = transitionEffect;

      // Handle image uploads based on display mode
      if (displayMode === 'single') {
        // Handle single image upload
        if (req.files && req.files.length > 0) {
          try {
            // Delete old image from Cloudinary if exists
            if (banner.image && banner.image.public_id) {
              console.log('Deleting old banner image from Cloudinary:', banner.image.public_id);
              await deleteFromCloudinary(banner.image.public_id);
            }
            
            // Upload new image to Cloudinary
            const result = await uploadToCloudinary(req.files[0].buffer, {
              folder: 'banners',
              resource_type: 'image'
            });
            
            banner.image = {
              url: result.url,
              public_id: result.public_id
            };
            console.log('Banner image uploaded successfully to Cloudinary:', result.public_id);
          } catch (uploadError) {
            console.error('Error uploading banner image to Cloudinary:', uploadError);
            return next(new ErrorHandler(`Failed to upload image: ${uploadError.message}`, 500));
          }
        }
      } else if (displayMode === 'sliding') {
        // Handle sliding images upload
        console.log('Processing sliding mode update');
        console.log('Files received:', req.files ? req.files.length : 0);
        console.log('Sliding images data:', slidingImagesData);
        
        if (req.files && req.files.length > 0) {
          // NEW FILES UPLOADED - replace all images
          try {
            // Delete old sliding images from Cloudinary if exists
            if (banner.images && banner.images.length > 0) {
              console.log('Deleting old sliding images:', banner.images.length);
              for (const img of banner.images) {
                if (img.public_id) {
                  console.log('Deleting old sliding image from Cloudinary:', img.public_id);
                  await deleteFromCloudinary(img.public_id);
                }
              }
            }

            // Upload new sliding images to Cloudinary
            const uploadedImages = [];
            console.log('Uploading new sliding images:', req.files.length);
            
            for (let i = 0; i < req.files.length; i++) {
              const file = req.files[i];
              console.log(`Uploading file ${i + 1}/${req.files.length}:`, file.originalname);
              
              const result = await uploadToCloudinary(file.buffer, {
                folder: 'banners/sliding',
                resource_type: 'image'
              });

              // Get corresponding text from slidingImagesData if available
              let imageData = {};
              try {
                if (slidingImagesData) {
                  const parsedData = JSON.parse(slidingImagesData);
                  imageData = parsedData[i] || {};
                }
              } catch (e) {
                console.log('Error parsing sliding images data:', e);
              }

              uploadedImages.push({
                url: result.url,
                public_id: result.public_id,
                title: imageData.title || '',
                description: imageData.description || ''
              });
              
              console.log(`Uploaded image ${i + 1}: ${result.public_id}`);
            }

            banner.images = uploadedImages;
            console.log('Total sliding images saved:', uploadedImages.length);
            console.log('Banner images after assignment:', banner.images.length);
          } catch (uploadError) {
            console.error('Error uploading sliding images to Cloudinary:', uploadError);
            return next(new ErrorHandler(`Failed to upload images: ${uploadError.message}`, 500));
          }
        } else if (slidingImagesData) {
          // NO NEW FILES - just update text data for existing images
          console.log('No new files, updating existing images text data');
          try {
            const parsedData = JSON.parse(slidingImagesData);
            if (banner.images && banner.images.length > 0) {
              banner.images.forEach((img, index) => {
                if (parsedData[index]) {
                  img.title = parsedData[index].title || img.title || '';
                  img.description = parsedData[index].description || img.description || '';
                }
              });
              console.log('Updated text data for existing images:', banner.images.length);
            }
          } catch (e) {
            console.log('Error parsing sliding images data for text update:', e);
          }
        } else {
          // NO FILES AND NO DATA - keep existing images unchanged
          console.log('No new files or data, keeping existing images unchanged');
        }
      }

      // Update stats
      if (customerCount) banner.stats.customers.count = customerCount;
      if (customerLabel) banner.stats.customers.label = customerLabel;
      if (productCount) banner.stats.products.count = productCount;
      if (productLabel) banner.stats.products.label = productLabel;
      if (satisfactionCount) banner.stats.satisfaction.count = satisfactionCount;
      if (satisfactionLabel) banner.stats.satisfaction.label = satisfactionLabel;

      console.log('Banner before save - Display Mode:', banner.displayMode);
      console.log('Banner before save - Images count:', banner.images ? banner.images.length : 0);
      
      await banner.save();
      
      console.log('Banner after save - Images count:', banner.images ? banner.images.length : 0);

      res.status(200).json({
        success: true,
        message: "Banner updated successfully!",
        banner,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get banner content for admin (includes all fields)
router.get(
  "/admin/get-banner",
  isAuthenticated,
  requirePermission('canManageContent'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      let banner = await Banner.findOne({ isActive: true });
      
      // If no banner exists, create default one
      if (!banner) {
        banner = await Banner.create({});
      }

      console.log('=== ADMIN GET-BANNER ENDPOINT ===');
      console.log('Banner ID:', banner._id);
      console.log('Banner display mode:', banner.displayMode);
      console.log('Banner images count:', banner.images ? banner.images.length : 0);

      res.status(200).json({
        success: true,
        banner,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Reset banner to default (Admin and Manager with canManageContent)
router.post(
  "/reset-banner",
  isAuthenticated,
  requirePermission('canManageContent'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Delete current banner
      await Banner.deleteMany({});
      
      // Create new default banner
      const banner = await Banner.create({});

      res.status(200).json({
        success: true,
        message: "Banner reset to default successfully!",
        banner,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;