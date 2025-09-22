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
              imageUploads.push({
                url: result.secure_url,
                public_id: result.public_id
              });
              console.log('Event image uploaded successfully:', result.public_id);
            } catch (uploadError) {
              console.error('Error uploading event image to Cloudinary:', uploadError);
              return next(new ErrorHandler(`Failed to upload image: ${uploadError.message}`, 500));
            }
          }
        }

        const eventData = req.body;
        eventData.images = imageUploads;
        eventData.shop = shop;

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
