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
const { uploadImageToCloudinary, deleteFromCloudinary, uploadToCloudinary } = require("../config/cloudinary");

const sendShopToken = require("../utils/shopToken");

// create shop
router.post("/create-shop", upload.single("file"), async (req, res, next) => {
  try {
    const { email } = req.body;
    const sellerEmail = await Shop.findOne({ email });

    if (sellerEmail) {
      return next(new ErrorHandler("User already exists", 400));
    }

    let avatarData = null;
    if (req.file) {
      try {
        console.log(`Uploading shop avatar: ${req.file.originalname}`);
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: 'shops/avatars',
          resource_type: 'image',
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
      } catch (error) {
        console.error('Shop avatar upload error:', error);
        return next(new ErrorHandler(`Avatar upload failed: ${error.message}`, 400));
      }
    }

    const seller = {
      name: req.body.name,
      email: email,
      password: req.body.password,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      zipCode: req.body.zipCode,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      gstNumber: req.body.gstNumber,
    };
    
    // Only add avatar if it exists
    if (avatarData) {
      seller.avatar = avatarData;
    }

    const activationToken = createActivationToken(seller);

   const activationUrl = `https://wanttar.in/seller/activation/${activationToken}`;

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
    expiresIn: "24h", // Extended from 30m to 24h for better user experience
  });
};

// activate user
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      if (!activation_token) {
        return next(new ErrorHandler("Activation token is required", 400));
      }

      let newSeller;
      try {
        newSeller = jwt.verify(
          activation_token,
          process.env.ACTIVATION_SECRET
        );
      } catch (jwtError) {
        if (jwtError.name === 'TokenExpiredError') {
          return next(new ErrorHandler("Activation token has expired. Please register again.", 400));
        } else if (jwtError.name === 'JsonWebTokenError') {
          return next(new ErrorHandler("Invalid activation token. Please check your link.", 400));
        } else {
          return next(new ErrorHandler("Token verification failed. Please try again.", 400));
        }
      }

      if (!newSeller) {
        return next(new ErrorHandler("Invalid token", 400));
      }
      const { name, email, password, avatar, zipCode, address, phoneNumber, latitude, longitude, gstNumber } =
        newSeller;

      let seller = await Shop.findOne({ email });

      if (seller) {
        return next(new ErrorHandler("User already exists", 400));
      }

      const shopData = {
        name,
        email,
        password,
        zipCode,
        address,
        phoneNumber,
        latitude,
        longitude,
        gstNumber,
      };

      // Only add avatar if it exists
      if (avatar) {
        shopData.avatar = avatar;
      }

      seller = await Shop.create(shopData);

      // Create notification for new seller registration requiring approval
      await NotificationService.createShopApprovalNotification(seller, "pending");

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

      console.log('[SHOP LOGIN] Attempting login for email:', email);
      
      // First, check if there's a user with Supplier role
      const User = require("../model/user");
      const supplierUser = await User.findOne({ email }).select("+password");
      
      if (supplierUser && supplierUser.role === 'Supplier') {
        console.log('[SHOP LOGIN] Found Supplier user, authenticating against user account...');
        
        const isPasswordValid = await supplierUser.comparePassword(password);
        
        if (!isPasswordValid) {
          console.log('[SHOP LOGIN] Invalid password for Supplier user:', email);
          return next(new ErrorHandler("Please provide the correct information", 400));
        }
        
        // Check if they have a shop profile, if not create one
        let shopProfile = await Shop.findOne({ email });
        
        if (!shopProfile) {
          console.log('[SHOP LOGIN] Creating shop profile for Supplier user...');
          shopProfile = await Shop.create({
            name: `${supplierUser.name}'s Shop`,
            email: supplierUser.email,
            password: 'temppassword123', // Won't be used for auth anymore
            description: `Welcome to ${supplierUser.name}'s shop`,
            address: "Please update your address",
            phoneNumber: 1234567890,
            zipCode: 123456,
            avatar: {
              url: supplierUser.avatar?.url || "https://res.cloudinary.com/dkzfopuco/image/upload/v1683299454/avatar_gfxgav.png",
              public_id: supplierUser.avatar?.public_id || "avatar_gfxgav"
            }
          });
          console.log('[SHOP LOGIN] Shop profile created:', shopProfile._id);
        }
        
        console.log('[SHOP LOGIN] Login successful for Supplier user:', email);
        // Send shop token using the shop profile but authenticated via user account
        sendShopToken(shopProfile, 201, res);
        return;
      }
      
      // If not a Supplier user, try traditional shop authentication
      console.log('[SHOP LOGIN] Not a Supplier user, trying traditional shop login...');
      const shopUser = await Shop.findOne({ email }).select("+password");

      if (!shopUser) {
        console.log('[SHOP LOGIN] No shop or supplier found for email:', email);
        return next(new ErrorHandler("User doesn't exist! If you were recently promoted to Supplier, please use your original user password.", 400));
      }

      console.log('[SHOP LOGIN] Traditional shop found:', shopUser._id);
      
      // Check approval status
      if (shopUser.approvalStatus === 'pending') {
        console.log('[SHOP LOGIN] Shop account pending approval:', email);
        return next(new ErrorHandler("Your shop account is pending admin approval. Please wait for approval before logging in.", 400));
      }
      
      if (shopUser.approvalStatus === 'rejected') {
        console.log('[SHOP LOGIN] Shop account rejected:', email);
        return next(new ErrorHandler(`Your shop account has been rejected. Reason: ${shopUser.rejectionReason || 'No reason provided'}`, 400));
      }
      
      const isPasswordValid = await shopUser.comparePassword(password);

      if (!isPasswordValid) {
        console.log('[SHOP LOGIN] Invalid password for traditional shop:', email);
        return next(
          new ErrorHandler("Please provide the correct information", 400)
        );
      }

      console.log('[SHOP LOGIN] Traditional shop login successful for:', email);
      sendShopToken(shopUser, 201, res);
      
    } catch (error) {
      console.error('[SHOP LOGIN] Error:', error.message);
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
      const isProduction = process.env.NODE_ENV === "PRODUCTION";
      res.cookie("seller_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
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
        console.log(`Uploading updated shop avatar: ${req.file.originalname}`);
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: 'shops/avatars',
          resource_type: 'image',
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
      } catch (error) {
        console.error('Shop avatar update upload error:', error);
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

      // Delete all products associated with this shop
      const Product = require("../model/product");
      const Event = require("../model/event");
      const CoupounCode = require("../model/coupounCode");
      const VideoBanner = require("../model/videoBanner");
      
      // Delete only products CREATED BY this shop (not admin products assigned to shop)
      const deletedProducts = await Product.deleteMany({
        $and: [
          {
            $or: [
              { shopId: req.params.id },                    // String shop ID
              { sellerShop: req.params.id },                // ObjectId reference
              { shop: req.params.id },                      // If shop is stored as ObjectId
              { 'shop._id': req.params.id },               // If shop is embedded object with _id
              { 'shop.id': req.params.id },                // Alternative embedded reference
            ]
          },
          {
            $or: [
              { isSellerProduct: true },                    // Only delete seller-created products
              { isSellerProduct: { $exists: false } }      // Handle legacy products without this field
            ]
          }
        ]
      });
      console.log(`Deleted ${deletedProducts.deletedCount} products for shop ${req.params.id}`);

      // Delete all events for this shop  
      const deletedEvents = await Event.deleteMany({
        shopId: req.params.id
      });
      console.log(`Deleted ${deletedEvents.deletedCount} events for shop ${req.params.id}`);

      // Delete all coupon codes for this shop
      const deletedCoupons = await CoupounCode.deleteMany({
        shopId: req.params.id
      });
      console.log(`Deleted ${deletedCoupons.deletedCount} coupon codes for shop ${req.params.id}`);

      // Delete all video banners for this shop
      const deletedVideoBanners = await VideoBanner.deleteMany({
        shopId: req.params.id
      });
      console.log(`Deleted ${deletedVideoBanners.deletedCount} video banners for shop ${req.params.id}`);

      // Finally delete the shop itself
      await Shop.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "Seller and all associated data deleted successfully!",
        deletedData: {
          products: deletedProducts.deletedCount,
          events: deletedEvents.deletedCount,
          coupons: deletedCoupons.deletedCount,
          videoBanners: deletedVideoBanners.deletedCount
        }
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

      // Check if this is a Supplier user first
      const User = require("../model/user");
      const supplierUser = await User.findOne({ email });
      
      let targetAccount = null;
      let accountType = null;

      if (supplierUser && supplierUser.role === 'Supplier') {
        // This is a Supplier user - reset their User account password
        targetAccount = supplierUser;
        accountType = 'supplier';
      } else {
        // Check for traditional shop account
        const shop = await Shop.findOne({ email });
        if (shop) {
          targetAccount = shop;
          accountType = 'shop';
        }
      }

      if (!targetAccount) {
        return next(new ErrorHandler("No account found with this email", 404));
      }

      // Generate reset password token
      const resetToken = crypto.randomBytes(20).toString("hex");

      // Hash token and set to resetPasswordToken field
      targetAccount.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // Set expire time (2 hours)
      targetAccount.resetPasswordTime = Date.now() + 120 * 60 * 1000;

      await targetAccount.save();

      // Create reset password URL (pointing to frontend)
      const resetPasswordUrl = `https://wanttar.in/shop-reset-password/${resetToken}`;

      const accountTypeText = accountType === 'supplier' ? 'Supplier account' : 'Shop account';
      const message = `Your ${accountTypeText} password reset token is: \n\n${resetPasswordUrl}\n\nIf you have not requested this email, then ignore it.`;

      try {
        await sendMail({
          email: targetAccount.email,
          subject: `${accountTypeText} Password Recovery`,
          message,
        });

        res.status(200).json({
          success: true,
          message: `Email sent to ${targetAccount.email} successfully`,
          accountType: accountType // Let frontend know which type of account
        });
      } catch (error) {
        targetAccount.resetPasswordToken = undefined;
        targetAccount.resetPasswordTime = undefined;
        await targetAccount.save();
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

      // First check in User model (for Supplier users)
      const User = require("../model/user");
      let targetAccount = await User.findOne({
        resetPasswordToken,
        resetPasswordTime: { $gt: Date.now() },
      });
      
      let accountType = null;
      
      if (targetAccount) {
        accountType = 'supplier';
      } else {
        // If not found in User, check in Shop model
        targetAccount = await Shop.findOne({
          resetPasswordToken,
          resetPasswordTime: { $gt: Date.now() },
        });
        
        if (targetAccount) {
          accountType = 'shop';
        }
      }

      if (!targetAccount) {
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

      targetAccount.password = req.body.password;
      targetAccount.resetPasswordToken = undefined;
      targetAccount.resetPasswordTime = undefined;

      await targetAccount.save();

      // For supplier users, we need to return shop token using their shop profile
      if (accountType === 'supplier') {
        // Find or create shop profile for this supplier
        let shopProfile = await Shop.findOne({ email: targetAccount.email });
        
        if (!shopProfile) {
          shopProfile = await Shop.create({
            name: `${targetAccount.name}'s Shop`,
            email: targetAccount.email,
            password: 'temppassword123', // Won't be used for auth
            description: `Welcome to ${targetAccount.name}'s shop`,
            address: "Please update your address",
            phoneNumber: 1234567890,
            zipCode: 123456,
            avatar: {
              url: targetAccount.avatar?.url || "https://res.cloudinary.com/dkzfopuco/image/upload/v1683299454/avatar_gfxgav.png",
              public_id: targetAccount.avatar?.public_id || "avatar_gfxgav"
            }
          });
        }
        
        sendShopToken(shopProfile, 200, res);
      } else {
        sendShopToken(targetAccount, 200, res);
      }
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

// Update shop password
router.put(
  "/update-password",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return next(new ErrorHandler("Current password and new password are required", 400));
      }

      if (newPassword.length < 6) {
        return next(new ErrorHandler("New password must be at least 6 characters long", 400));
      }

      // Get shop with password
      const shop = await Shop.findById(req.seller._id).select("+password");
      
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      // Check if current password is correct
      const isCurrentPasswordValid = await shop.comparePassword(currentPassword);
      
      if (!isCurrentPasswordValid) {
        return next(new ErrorHandler("Current password is incorrect", 401));
      }

      // Update password
      shop.password = newPassword;
      await shop.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully"
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get pending sellers for admin approval
router.get(
  "/admin-pending-sellers",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const pendingSellers = await Shop.find({ approvalStatus: 'pending' }).sort({
        createdAt: -1,
      });
      
      res.status(200).json({
        success: true,
        sellers: pendingSellers,
        count: pendingSellers.length,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Approve seller (Admin only)
router.put(
  "/admin-approve-seller/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { id } = req.params;

      const seller = await Shop.findById(id);
      if (!seller) {
        return next(new ErrorHandler("Seller not found", 404));
      }

      if (seller.approvalStatus === 'approved') {
        return next(new ErrorHandler("Seller is already approved", 400));
      }

      seller.approvalStatus = 'approved';
      seller.approvedBy = req.user._id;
      seller.approvedAt = new Date();
      seller.rejectedBy = null;
      seller.rejectedAt = null;
      seller.rejectionReason = null;

      await seller.save();

      // Create notification for approval
      await NotificationService.createShopApprovalNotification(seller, "approved", req.user);

      // Send approval email to seller
      try {
        await sendMail({
          email: seller.email,
          subject: "Shop Approved - Welcome to Our Platform!",
          message: `Hello ${seller.name},\n\nCongratulations! Your shop has been approved by our admin team. You can now log in and start selling on our platform.\n\nShop Details:\n- Name: ${seller.name}\n- Email: ${seller.email}\n- Address: ${seller.address}\n\nYou can now access your seller dashboard and begin uploading your products.\n\nWelcome aboard!\n\nBest regards,\nAdmin Team`,
        });
      } catch (emailError) {
        console.error('Error sending approval email:', emailError.message);
        // Continue with the approval even if email fails
      }

      res.status(200).json({
        success: true,
        message: "Seller approved successfully",
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Reject seller (Admin only)
router.put(
  "/admin-reject-seller/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;

      if (!rejectionReason) {
        return next(new ErrorHandler("Rejection reason is required", 400));
      }

      const seller = await Shop.findById(id);
      if (!seller) {
        return next(new ErrorHandler("Seller not found", 404));
      }

      if (seller.approvalStatus === 'rejected') {
        return next(new ErrorHandler("Seller is already rejected", 400));
      }

      seller.approvalStatus = 'rejected';
      seller.rejectedBy = req.user._id;
      seller.rejectedAt = new Date();
      seller.rejectionReason = rejectionReason;
      seller.approvedBy = null;
      seller.approvedAt = null;

      await seller.save();

      // Create notification for rejection
      await NotificationService.createShopApprovalNotification(seller, "rejected", req.user, rejectionReason);

      // Send rejection email to seller
      try {
        await sendMail({
          email: seller.email,
          subject: "Shop Application Status - Action Required",
          message: `Hello ${seller.name},\n\nWe regret to inform you that your shop application has been reviewed and we cannot approve it at this time.\n\nReason for rejection: ${rejectionReason}\n\nShop Details:\n- Name: ${seller.name}\n- Email: ${seller.email}\n- Address: ${seller.address}\n\nIf you believe this decision was made in error or if you have addressed the concerns mentioned, please feel free to contact our support team.\n\nThank you for your interest in our platform.\n\nBest regards,\nAdmin Team`,
        });
      } catch (emailError) {
        console.error('Error sending rejection email:', emailError.message);
        // Continue with the rejection even if email fails
      }

      res.status(200).json({
        success: true,
        message: "Seller rejected successfully",
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get seller statistics for admin dashboard
router.get(
  "/admin-seller-stats",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const totalSellers = await Shop.countDocuments();
      const approvedSellers = await Shop.countDocuments({ approvalStatus: 'approved' });
      const pendingSellers = await Shop.countDocuments({ approvalStatus: 'pending' });
      const rejectedSellers = await Shop.countDocuments({ approvalStatus: 'rejected' });
      const bannedSellers = await Shop.countDocuments({ isBanned: true });

      const stats = {
        total: totalSellers,
        approved: approvedSellers,
        pending: pendingSellers,
        rejected: rejectedSellers,
        banned: bannedSellers,
        active: approvedSellers - bannedSellers, // Approved and not banned
      };

      res.status(200).json({
        success: true,
        stats,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get all sellers with their approval status (Admin only)
router.get(
  "/admin-all-sellers-with-status",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      let query = {};
      if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        query.approvalStatus = status;
      }

      const sellers = await Shop.find(query)
        .populate('approvedBy', 'name email')
        .populate('rejectedBy', 'name email')
        .populate('bannedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalSellers = await Shop.countDocuments(query);

      res.status(200).json({
        success: true,
        sellers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalSellers / limit),
          totalSellers,
          hasNext: page * limit < totalSellers,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
