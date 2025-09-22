const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendMail = require("../utils/sendMail");
const Shop = require("../model/shop");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const { upload } = require("../multer");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const NotificationService = require("../utils/NotificationService");
const { uploadImageToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");

const sendShopToken = require("../utils/shopToken");

// create shop
router.post("/create-shop", upload.single("file"), async (req, res, next) => {
  try {
    const { email } = req.body;
    const sellerEmail = await Shop.findOne({ email });

    if (sellerEmail) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.log(err);
          }
        });
      }
      return next(new ErrorHandler("User already exists", 400));
    }

    let avatarData = null;
    if (req.file) {
      try {
        console.log(`Uploading shop avatar: ${req.file.originalname} from ${req.file.path}`);
        const result = await uploadImageToCloudinary(req.file.path, {
          folder: 'shops/avatars',
          transformation: {
            width: 300,
            height: 300,
            crop: 'fill'
          }
        });
        console.log(`Shop avatar uploaded successfully: ${result.url}`);
        
        avatarData = {
          url: result.url,
          public_id: result.public_id
        };
        
        // Delete local file after successful upload
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error('Shop avatar upload error:', error);
        // Clean up local file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return next(new ErrorHandler(`Avatar upload failed: ${error.message}`, 400));
      }
    }

    const seller = {
      name: req.body.name,
      email: email,
      password: req.body.password,
      avatar: avatarData,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      zipCode: req.body.zipCode,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    };

    const activationToken = createActivationToken(seller);

    const activationUrl = `https://multi-vondor-e-shop-1.onrender.com/seller/activation/${activationToken}`;

    try {
      await sendMail({
        email: seller.email,
        subject: "Activate your Shop",
        message: `Hello ${seller.name}, please click on the link to activate your shop: ${activationUrl}`,
      });
      res.status(201).json({
        success: true,
        message: `please check your email:- ${seller.email} to activate your shop!`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// create activation token
const createActivationToken = (seller) => {
  return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

// activate user
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      const newSeller = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!newSeller) {
        return next(new ErrorHandler("Invalid token", 400));
      }
      const { name, email, password, avatar, zipCode, address, phoneNumber, latitude, longitude } =
        newSeller;

      let seller = await Shop.findOne({ email });

      if (seller) {
        return next(new ErrorHandler("User already exists", 400));
      }

      seller = await Shop.create({
        name,
        email,
        avatar,
        password,
        zipCode,
        address,
        phoneNumber,
        latitude,
        longitude,
      });

      // Create notification for new seller registration
      await NotificationService.createSellerRegistrationNotification(
        'New Seller Registered',
        `New seller "${name}" (${email}) has registered and activated their shop`,
        'new_seller_registration',
        seller._id
      );

      sendShopToken(seller, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// login shop
router.post(
  "/login-shop",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please provide the all fields!", 400));
      }

      const user = await Shop.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("User doesn't exists!", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide the correct information", 400)
        );
      }

      sendShopToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// load shop
router.get(
  "/getSeller",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("User doesn't exists", 400));
      }

      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// log out from shop
router.get(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie("seller_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });
      res.status(201).json({
        success: true,
        message: "Log out successful!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get shop info
router.get(
  "/get-shop-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.id);
      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update shop profile picture
router.put(
  "/update-shop-avatar",
  isSeller,
  upload.single("image"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return next(new ErrorHandler("No file uploaded", 400));
      }

      const existsUser = await Shop.findById(req.seller._id);

      // Upload new avatar to Cloudinary
      let avatarData = null;
      try {
        console.log(`Uploading updated shop avatar: ${req.file.originalname} from ${req.file.path}`);
        const result = await uploadImageToCloudinary(req.file.path, {
          folder: 'shops/avatars',
          transformation: {
            width: 300,
            height: 300,
            crop: 'fill'
          }
        });
        console.log(`Updated shop avatar uploaded successfully: ${result.url}`);
        
        avatarData = {
          url: result.url,
          public_id: result.public_id
        };
        
        // Delete local file after successful upload
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error('Shop avatar update upload error:', error);
        // Clean up local file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return next(new ErrorHandler(`Avatar upload failed: ${error.message}`, 400));
      }

      // Delete previous avatar from Cloudinary if it exists
      if (existsUser.avatar && existsUser.avatar.public_id) {
        try {
          await deleteFromCloudinary(existsUser.avatar.public_id, 'image');
          console.log(`Deleted old shop avatar: ${existsUser.avatar.public_id}`);
        } catch (error) {
          console.error('Error deleting previous shop avatar from Cloudinary:', error.message);
          // Continue with the update even if old file deletion fails
        }
      }

      const seller = await Shop.findByIdAndUpdate(req.seller._id, {
        avatar: avatarData,
      }, { new: true });

      res.status(200).json({
        success: true,
        seller,
        message: "Avatar updated successfully",
      });
    } catch (error) {
      // If there's an error and we have a new file, clean it up
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.log("Error cleaning up failed upload:", cleanupError.message);
        }
      }
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller info
router.put(
  "/update-seller-info",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, description, address, phoneNumber, zipCode, latitude, longitude } = req.body;

      const shop = await Shop.findOne(req.seller._id);

      if (!shop) {
        return next(new ErrorHandler("User not found", 400));
      }

      shop.name = name;
      shop.description = description;
      shop.address = address;
      shop.phoneNumber = phoneNumber;
      shop.zipCode = zipCode;
      
      // Update coordinates if provided
      if (latitude !== undefined) {
        shop.latitude = latitude;
      }
      if (longitude !== undefined) {
        shop.longitude = longitude;
      }

      await shop.save();

      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all sellers --- for admin
router.get(
  "/admin-all-sellers",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sellers = await Shop.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        sellers,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete seller ---admin
router.delete(
  "/delete-seller/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.params.id);

      if (!seller) {
        return next(
          new ErrorHandler("Seller is not available with this id", 400)
        );
      }

      await Shop.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "Seller deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller withdraw methods --- sellers
router.put(
  "/update-payment-methods",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { withdrawMethod } = req.body;

      const seller = await Shop.findByIdAndUpdate(req.seller._id, {
        withdrawMethod,
      });

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete seller withdraw merthods --- only seller
router.delete(
  "/delete-withdraw-method/",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("Seller not found with this id", 400));
      }

      seller.withdrawMethod = null;

      await seller.save();

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update shop location --- sellers
router.put(
  "/update-shop-location",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { latitude, longitude, address } = req.body;

      const seller = await Shop.findByIdAndUpdate(
        req.seller._id,
        {
          latitude,
          longitude,
          address,
        },
        { new: true }
      );

      if (!seller) {
        return next(new ErrorHandler("Seller not found", 404));
      }

      res.status(200).json({
        success: true,
        message: "Shop location updated successfully",
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// forgot password --- sellers
router.post(
  "/forgot-password",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email } = req.body;

      const shop = await Shop.findOne({ email });

      if (!shop) {
        return next(new ErrorHandler("Shop not found with this email", 404));
      }

      // Generate reset password token
      const resetToken = crypto.randomBytes(20).toString("hex");

      // Hash token and set to resetPasswordToken field
      shop.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // Set expire time (10 minutes)
      shop.resetPasswordTime = Date.now() + 10 * 60 * 1000;

      await shop.save();

      // Create reset password URL (pointing to frontend)
      const resetPasswordUrl = `https://multi-vondor-e-shop-1.onrender.com/shop-reset-password/${resetToken}`;

      const message = `Your password reset token is: \n\n${resetPasswordUrl}\n\nIf you have not requested this email, then ignore it.`;

      try {
        await sendMail({
          email: shop.email,
          subject: "Shop Password Recovery",
          message,
        });

        res.status(200).json({
          success: true,
          message: `Email sent to ${shop.email} successfully`,
        });
      } catch (error) {
        shop.resetPasswordToken = undefined;
        shop.resetPasswordTime = undefined;
        await shop.save();
        return next(new ErrorHandler(error.message, 500));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// reset password --- sellers
router.put(
  "/reset-password/:token",
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Hash URL token
      const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

      const shop = await Shop.findOne({
        resetPasswordToken,
        resetPasswordTime: { $gt: Date.now() },
      });

      if (!shop) {
        return next(
          new ErrorHandler(
            "Reset password token is invalid or has been expired",
            400
          )
        );
      }

      if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password doesn't match", 400));
      }

      shop.password = req.body.password;
      shop.resetPasswordToken = undefined;
      shop.resetPasswordTime = undefined;

      await shop.save();

      sendShopToken(shop, 200, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Ban a shop (Admin only)
router.put(
  "/ban-shop",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId, banReason } = req.body;

      if (!shopId || !banReason) {
        return next(new ErrorHandler("Shop ID and ban reason are required", 400));
      }

      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      if (shop.isBanned) {
        return next(new ErrorHandler("Shop is already banned", 400));
      }

      shop.isBanned = true;
      shop.banReason = banReason;
      shop.bannedBy = req.user._id;
      shop.bannedAt = new Date();

      await shop.save();

      res.status(200).json({
        success: true,
        message: "Shop has been banned successfully",
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Unban a shop (Admin only)
router.put(
  "/unban-shop",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId } = req.body;

      if (!shopId) {
        return next(new ErrorHandler("Shop ID is required", 400));
      }

      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      if (!shop.isBanned) {
        return next(new ErrorHandler("Shop is not banned", 400));
      }

      shop.isBanned = false;
      shop.banReason = null;
      shop.bannedBy = null;
      shop.bannedAt = null;

      await shop.save();

      res.status(200).json({
        success: true,
        message: "Shop has been unbanned successfully",
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Check shop ban status
router.get(
  "/ban-status",
  isAuthenticated,
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.seller._id).select('+isBanned +banReason +bannedAt +bannedBy');
      
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      res.status(200).json({
        success: true,
        isBanned: shop.isBanned,
        banReason: shop.banReason,
        bannedAt: shop.bannedAt,
        bannedBy: shop.bannedBy,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
