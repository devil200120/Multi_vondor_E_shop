const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { upload } = require("../multer");
const Shop = require("../model/shop");
const Event = require("../model/event");
const Order = require("../model/order");
const ErrorHandler = require("../utils/ErrorHandler");
const { isSeller, isAdmin, isAuthenticated } = require("../middleware/auth");
const router = express.Router();
const fs = require("fs");
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");

// create event
router.post(
  "/create-event",
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.body.shopId;
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop Id is invalid!", 400));
      } else {
        const files = req.files;
        console.log('Files received for event:', files?.length || 0);
        
        // Upload images to Cloudinary
        const imageUploads = [];
        if (files && files.length > 0) {
          for (const file of files) {
            try {
              console.log('Uploading event image to Cloudinary:', file.originalname);
              const result = await uploadToCloudinary(file.buffer, {
                folder: 'events',
                resource_type: 'image'
              });
              console.log('Cloudinary upload result:', { secure_url: result.secure_url, public_id: result.public_id });
              
              // Create image data object with fallback
              const imageData = {
                url: result.secure_url || result.url || `https://res.cloudinary.com/dqnhnh4ui/image/upload/${result.public_id}`,
                public_id: result.public_id
              };
              
              imageUploads.push(imageData);
              console.log('Event image uploaded successfully:', result.public_id);
              console.log('Image data added:', imageData);
            } catch (uploadError) {
              console.error('Error uploading event image to Cloudinary:', uploadError);
              return next(new ErrorHandler(`Failed to upload image: ${uploadError.message}`, 500));
            }
          }
        }

        const eventData = req.body;
        eventData.images = imageUploads;
        eventData.shop = shop;
        
        console.log('Final imageUploads array for supplier event:', JSON.stringify(imageUploads, null, 2));
        console.log('EventData.images before saving:', JSON.stringify(eventData.images, null, 2));
        console.log('Full eventData before create:', JSON.stringify(eventData, null, 2));

        const event = await Event.create(eventData);
        console.log('Event created successfully with Cloudinary images');

        res.status(201).json({
          success: true,
          event,
        });
      }
    } catch (error) {
      console.error('Error creating event:', error);
      return next(new ErrorHandler(error.message || error, 400));
    }
  })
);

// get all events
router.get("/get-all-events", async (req, res, next) => {
  try {
    const events = await Event.find();
    res.status(201).json({
      success: true,
      events,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
});

// get all events of a shop
router.get(
  "/get-all-events/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const events = await Event.find({ shopId: req.params.id });

      res.status(201).json({
        success: true,
        events,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// delete event of a shop
router.delete(
  "/delete-shop-event/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const eventId = req.params.id;
      console.log('Attempting to delete event:', eventId);

      const eventData = await Event.findById(eventId);

      if (!eventData) {
        return next(new ErrorHandler("Event not found with this id!", 404));
      }

      // Delete images from Cloudinary
      if (eventData.images && eventData.images.length > 0) {
        for (const image of eventData.images) {
          try {
            if (image.public_id) {
              console.log('Deleting event image from Cloudinary:', image.public_id);
              await deleteFromCloudinary(image.public_id);
              console.log('Event image deleted successfully from Cloudinary');
            }
          } catch (deleteError) {
            console.error('Error deleting event image from Cloudinary:', deleteError);
            // Continue with event deletion even if image deletion fails
          }
        }
      }

      const event = await Event.findByIdAndDelete(eventId);
      console.log('Event deleted successfully from database');

      res.status(200).json({
        success: true,
        message: "Event Deleted successfully!",
        eventId: eventId
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      return next(new ErrorHandler(error.message || error, 400));
    }
  })
);

// all events --- for admin
router.get(
  "/admin-all-events",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const events = await Event.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        events,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin create event
router.post(
  "/admin-create-event",
  isAuthenticated,
  isAdmin("Admin"),
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log('Admin creating event with data:', req.body);
      
      const files = req.files;
      console.log('Files received for admin event:', files?.length || 0);
      
      // Validate files if provided
      if (files && files.length > 0) {
        console.log('File details:', files.map(f => ({
          name: f.originalname,
          size: f.size,
          mimetype: f.mimetype,
          bufferLength: f.buffer?.length || 0
        })));
      }
      
      // Upload images to Cloudinary
      const imageUploads = [];
      if (files && files.length > 0) {
        console.log('Processing', files.length, 'image files');
        for (const file of files) {
          try {
            // Validate file buffer
            if (!file.buffer || file.buffer.length === 0) {
              console.error('Empty file buffer for:', file.originalname);
              return next(new ErrorHandler(`File ${file.originalname} is empty or corrupted`, 400));
            }
            
            console.log('Uploading admin event image to Cloudinary:', file.originalname);
            const result = await uploadToCloudinary(file.buffer, {
              folder: 'events',
              resource_type: 'image'
            });
            console.log('Cloudinary upload result:', { secure_url: result.secure_url, public_id: result.public_id });
            
            // Handle case where secure_url might be undefined
            let imageUrl = result.secure_url;
            if (!imageUrl && result.public_id) {
              // Construct URL from public_id if secure_url is missing
              imageUrl = `https://res.cloudinary.com/dqnhnh4ui/image/upload/${result.public_id}.jpg`;
              console.log('Constructed URL from public_id:', imageUrl);
            }
            
            const imageData = {
              url: imageUrl,
              public_id: result.public_id
            };
            imageUploads.push(imageData);
            console.log('Admin event image uploaded successfully:', result.public_id);
            console.log('Image data added:', imageData);
          } catch (uploadError) {
            console.error('Error uploading admin event image to Cloudinary:', uploadError);
            return next(new ErrorHandler(`Failed to upload image ${file.originalname}: ${uploadError.message}`, 500));
          }
        }
      } else {
        console.log('No images provided for admin event creation');
        // For testing, allow events without images
        console.log('Creating event without images for testing purposes');
      }

      const eventData = req.body;
      
      // Ensure images array is properly formatted
      if (imageUploads.length > 0) {
        eventData.images = imageUploads;
      } else {
        // Provide a default image for admin events if none uploaded
        eventData.images = [{
          url: 'https://via.placeholder.com/400x300/cccccc/666666?text=No+Image',
          public_id: 'default-event-image'
        }];
        console.log('Using default image for admin event');
      }
      
      console.log('Final imageUploads array:', JSON.stringify(imageUploads, null, 2));
      console.log('EventData.images before saving:', JSON.stringify(eventData.images, null, 2));
      
      // For admin-created events, provide system default values for required shop fields
      if (!eventData.shopId) {
        eventData.shopId = 'admin';
      }
      if (!eventData.shop) {
        eventData.shop = {
          _id: 'admin',
          name: 'Admin Tagged',
          email: req.user.email || 'admin@platform.com',
          avatar: {
            public_id: 'admin-avatar',
            url: '/default-admin-avatar.png'
          }
        };
      }

      console.log('Full eventData before create:', JSON.stringify(eventData, null, 2));
      const event = await Event.create(eventData);
      console.log('Admin event created successfully');

      res.status(201).json({
        success: true,
        event,
        message: "Event created successfully!"
      });
    } catch (error) {
      console.error('Error creating admin event:', error);
      return next(new ErrorHandler(error.message || error, 400));
    }
  })
);

// Admin update event
router.put(
  "/admin-update-event/:id",
  isAuthenticated,
  isAdmin("Admin"),
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const eventId = req.params.id;
      console.log('Admin updating event:', eventId);

      const existingEvent = await Event.findById(eventId);
      if (!existingEvent) {
        return next(new ErrorHandler("Event not found", 404));
      }

      const files = req.files;
      let imageUploads = existingEvent.images || [];

      // Handle new image uploads
      if (files && files.length > 0) {
        console.log('Uploading new images for event update');
        for (const file of files) {
          try {
            const result = await uploadToCloudinary(file.buffer, {
              folder: 'events',
              resource_type: 'image'
            });
            imageUploads.push({
              url: result.secure_url,
              public_id: result.public_id
            });
            console.log('New event image uploaded:', result.public_id);
          } catch (uploadError) {
            console.error('Error uploading new event image:', uploadError);
            return next(new ErrorHandler(`Failed to upload image: ${uploadError.message}`, 500));
          }
        }
      }

      const eventData = req.body;
      eventData.images = imageUploads;

      const event = await Event.findByIdAndUpdate(eventId, eventData, {
        new: true,
        runValidators: true
      });

      console.log('Admin event updated successfully');

      res.status(200).json({
        success: true,
        event,
        message: "Event updated successfully!"
      });
    } catch (error) {
      console.error('Error updating admin event:', error);
      return next(new ErrorHandler(error.message || error, 400));
    }
  })
);

// Admin delete event
router.delete(
  "/admin-delete-event/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const eventId = req.params.id;
      console.log('Admin deleting event:', eventId);

      const eventData = await Event.findById(eventId);

      if (!eventData) {
        return next(new ErrorHandler("Event not found", 404));
      }

      // Delete images from Cloudinary
      if (eventData.images && eventData.images.length > 0) {
        for (const image of eventData.images) {
          try {
            if (image.public_id) {
              console.log('Deleting event image from Cloudinary:', image.public_id);
              await deleteFromCloudinary(image.public_id);
              console.log('Event image deleted successfully from Cloudinary');
            }
          } catch (deleteError) {
            console.error('Error deleting event image from Cloudinary:', deleteError);
            // Continue with event deletion even if image deletion fails
          }
        }
      }

      await Event.findByIdAndDelete(eventId);
      console.log('Admin event deleted successfully from database');

      res.status(200).json({
        success: true,
        message: "Event deleted successfully!",
        eventId: eventId
      });
    } catch (error) {
      console.error('Error deleting admin event:', error);
      return next(new ErrorHandler(error.message || error, 400));
    }
  })
);

// Get single event for admin
router.get(
  "/admin-get-event/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const eventId = req.params.id;
      const event = await Event.findById(eventId);

      if (!event) {
        return next(new ErrorHandler("Event not found", 404));
      }

      res.status(200).json({
        success: true,
        event,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// review for a Event
router.put(
  "/create-new-review-event",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { user, rating, comment, productId, orderId } = req.body;

      const event = await Event.findById(productId);

      const review = {
        user,
        rating,
        comment,
        productId,
      };

      const isReviewed = event.reviews.find(
        (rev) => rev.user._id === req.user._id
      );

      if (isReviewed) {
        event.reviews.forEach((rev) => {
          if (rev.user._id === req.user._id) {
            (rev.rating = rating), (rev.comment = comment), (rev.user = user);
          }
        });
      } else {
        event.reviews.push(review);
      }

      let avg = 0;

      event.reviews.forEach((rev) => {
        avg += rev.rating;
      });

      event.ratings = avg / event.reviews.length;

      await event.save({ validateBeforeSave: false });

      await Order.findByIdAndUpdate(
        orderId,
        { $set: { "cart.$[elem].isReviewed": true } },
        { arrayFilters: [{ "elem._id": productId }], new: true }
      );

      res.status(200).json({
        success: true,
        message: "Reviwed succesfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

module.exports = router;
