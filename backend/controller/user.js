const express = require("express");
const path = require("path");
const User = require("../model/user");
const { upload } = require("../multer");
const ErrorHandler = require("../utils/ErrorHandler");
const NotificationService = require("../utils/NotificationService");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const { isAuthenticated, isAdmin, requirePermission } = require("../middleware/auth");
const { uploadImageToCloudinary, deleteFromCloudinary, uploadToCloudinary } = require("../config/cloudinary");

const router = express.Router();

router.post("/create-user", upload.single("file"), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return next(new ErrorHandler("Please provide all required fields", 400));
    }

    const userEmail = await User.findOne({ email });

    if (userEmail) {
      return next(new ErrorHandler("User already exists", 400));
    }

    let avatarData = null;
    if (req.file) {
      try {
        console.log(`Uploading user avatar: ${req.file.originalname}`);
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: 'users/avatars',
          resource_type: 'image',
          transformation: {
            width: 300,
            height: 300,
            crop: 'fill',
            gravity: 'face'
          }
        });
        console.log(`User avatar uploaded successfully: ${result.url}`);
        
        avatarData = {
          url: result.url,
          public_id: result.public_id
        };
      } catch (error) {
        console.error('Avatar upload error:', error);
        return next(new ErrorHandler(`Avatar upload failed: ${error.message}`, 400));
      }
    }

    const user = {
      name: name,
      email: email,
      password: password,
    };
    
    // Only add avatar if it exists
    if (avatarData) {
      user.avatar = avatarData;
    }

    const activationToken = createActivationToken(user);

    const activationUrl = `https://wanttar.in/activation/${activationToken}`;

    // send email to user
    try {
      await sendMail({
        email: user.email,
        subject: "Activate your account",
        message: `Hello  ${user.name}, please click on the link to activate your account ${activationUrl} `,
      });
      res.status(201).json({
        success: true,
        message: `please check your email:- ${user.email} to activate your account!`,
      });
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// create activation token
const createActivationToken = (user) => {
  // why use create activatetoken?
  // to create a token for the user to activate their account  after they register
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: "30m",
  });
};

// activate user account
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      const newUser = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );
      if (!newUser) {
        return next(new ErrorHandler("Invalid token", 400));
      }
      const { name, email, password, avatar } = newUser;

      let user = await User.findOne({ email });

      if (user) {
        return next(new ErrorHandler("User already exists", 400));
      }
      
      const userData = {
        name,
        email,
        password,
      };
      
      // Only add avatar if it exists
      if (avatar) {
        userData.avatar = avatar;
      }
      
      user = await User.create(userData);

      // Create notification for new user registration
      await NotificationService.createUserRegistrationNotification(
        'New User Registered',
        `New user ${name} (${email}) has registered and activated their account`,
        'new_registration',
        user._id
      );

      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// login user
router.post(
  "/login-user",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please provide the all filelds", 400));
      }
      const user = await User.findOne({ email }).select("+password");
      // +password is used to select the password field from the database

      if (!user) {
        return next(new ErrorHandler("user doesn't exits", 400));
      }

      // compore password with database password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide the correct inforamtions", 400)
        );
      }

      // Check if user is a supplier - suppliers should use shop login
      if (user.role === "Supplier") {
        return next(new ErrorHandler("You are registered as a Supplier. Please use the Shop Login to access your dashboard.", 401));
      }

      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// load user
router.get(
  "/getuser",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return next(new ErrorHandler("User doesn't exists", 400));
      }
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// log out user
router.get(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const isProduction = process.env.NODE_ENV === "PRODUCTION";
      res.cookie("token", null, {
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

// update user info
router.put(
  "/update-user-info",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password, phoneNumber, name } = req.body;

      /* The line `const user = await User.findOne({ email }).select("+password");` is querying the database
to find a user with the specified email address. The `select("+password")` part is used to include
the password field in the returned user object. By default, the password field is not selected when
querying the database for security reasons. However, in this case, the password field is needed to
compare the provided password with the stored password for authentication purposes. */
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("User not found", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide the correct information", 400)
        );
      }

      user.name = name;
      user.email = email;
      user.phoneNumber = phoneNumber;

      await user.save();

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update user avatar
router.put(
  "/update-avatar",
  isAuthenticated,
  upload.single("image"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return next(new ErrorHandler("No file uploaded", 400));
      }

      const existsUser = await User.findById(req.user.id);
      
      // Upload new avatar to Cloudinary
      let avatarData = null;
      try {
        console.log(`Uploading updated user avatar: ${req.file.originalname}`);
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: 'users/avatars',
          resource_type: 'image',
          transformation: {
            width: 300,
            height: 300,
            crop: 'fill',
            gravity: 'face'
          }
        });
        console.log(`Updated user avatar uploaded successfully: ${result.url}`);
        
        avatarData = {
          url: result.url,
          public_id: result.public_id
        };
      } catch (error) {
        console.error('Avatar update upload error:', error);
        return next(new ErrorHandler(`Avatar upload failed: ${error.message}`, 400));
      }

      // Delete previous avatar from Cloudinary if it exists
      if (existsUser.avatar && existsUser.avatar.public_id) {
        try {
          await deleteFromCloudinary(existsUser.avatar.public_id, 'image');
          console.log(`Deleted old user avatar: ${existsUser.avatar.public_id}`);
        } catch (error) {
          console.error('Error deleting previous avatar from Cloudinary:', error.message);
          // Continue with the update even if old file deletion fails
        }
      }

      const user = await User.findByIdAndUpdate(
        req.user.id, 
        { avatar: avatarData },
        { new: true } // Return the updated user
      );

      res.status(200).json({
        success: true,
        user,
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

// update user addresses
router.put(
  "/update-user-addresses",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      
      console.log("Address update request:", {
        userId: req.user.id,
        requestBody: req.body,
        existingAddresses: user.addresses.length
      });

      // If we have an _id, we're updating an existing address
      if (req.body._id) {
        const existsAddress = user.addresses.find(
          (address) => address._id.toString() === req.body._id.toString()
        );

        if (existsAddress) {
          console.log("Updating existing address with ID:", req.body._id);
          
          // Check if changing to a different address type that already exists
          if (existsAddress.addressType !== req.body.addressType) {
            const conflictAddress = user.addresses.find(
              (address) => 
                address.addressType === req.body.addressType && 
                address._id.toString() !== req.body._id.toString()
            );
            
            if (conflictAddress) {
              return next(
                new ErrorHandler(`${req.body.addressType} address already exists`)
              );
            }
          }
          
          // Update existing address
          Object.assign(existsAddress, req.body);
          await user.save();
          
          return res.status(200).json({
            success: true,
            user,
            message: "Address updated successfully"
          });
        } else {
          return next(new ErrorHandler("Address not found", 404));
        }
      } else {
        // Adding new address - check for duplicates
        const sameTypeAddress = user.addresses.find(
          (address) => address.addressType === req.body.addressType
        );
        
        if (sameTypeAddress) {
          return next(
            new ErrorHandler(`${req.body.addressType} address already exists`)
          );
        }
        
        // Add new address
        console.log("Adding new address");
        user.addresses.push(req.body);
        await user.save();
        
        return res.status(200).json({
          success: true,
          user,
          message: "Address added successfully"
        });
      }
    } catch (error) {
      console.error("Address update error:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete user address
router.delete(
  "/delete-user-address/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = req.user._id;
      const addressId = req.params.id;

      //   console.log(addressId);

      await User.updateOne(
        {
          _id: userId,
        },
        { $pull: { addresses: { _id: addressId } } }
      );

      const user = await User.findById(userId);

      res.status(200).json({ success: true, user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update user password
router.put(
  "/update-user-password",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select("+password");

      const isPasswordMatched = await user.comparePassword(
        req.body.oldPassword
      );

      if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect!", 400));
      }

      /* The line `if (req.body.newPassword !== req.body.confirmPassword)` is checking if the value of
    `newPassword` in the request body is not equal to the value of `confirmPassword` in the request
    body. This is used to ensure that the new password entered by the user matches the confirmation
    password entered by the user. If the two values do not match, it means that the user has entered
    different passwords and an error is returned. */
      if (req.body.newPassword !== req.body.confirmPassword) {
        return next(
          new ErrorHandler("Password doesn't matched with each other!", 400)
        );
      }
      user.password = req.body.newPassword;

      await user.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// find user infoormation with the userId
router.get(
  "/user-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all users --- for admin
router.get(
  "/admin-all-users",
  isAuthenticated,
  isAdmin(),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const users = await User.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        users,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete users --- admin
router.delete(
  "/delete-user/:id",
  isAuthenticated,
  requirePermission('canManageUsers'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return next(
          new ErrorHandler("User is not available with this id", 400)
        );
      }

      await User.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "User deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// forgot password --- users
router.post(
  "/forgot-password",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return next(new ErrorHandler("User not found with this email", 404));
      }

      // Generate reset password token
      const crypto = require("crypto");
      const resetToken = crypto.randomBytes(20).toString("hex");

      // Hash token and set to resetPasswordToken field
      user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // Set expire time (2 hours)
      user.resetPasswordTime = Date.now() + 120 * 60 * 1000;

      await user.save();

      // Create reset password URL (pointing to frontend)
      const resetPasswordUrl = `https://wanttar.in/reset-password/${resetToken}`;

      const message = `Your password reset token is: \n\n${resetPasswordUrl}\n\nIf you have not requested this email, then ignore it.`;

      try {
        await sendMail({
          email: user.email,
          subject: "User Password Recovery",
          message,
        });

        res.status(200).json({
          success: true,
          message: `Email sent to ${user.email} successfully`,
        });
      } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordTime = undefined;

        await user.save();
        return next(new ErrorHandler(error.message, 500));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// reset password --- users
router.put(
  "/reset-password/:token",
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Hash URL token
      const crypto = require("crypto");
      const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordTime: { $gt: Date.now() },
      });

      if (!user) {
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

      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordTime = undefined;

      await user.save();

      sendToken(user, 200, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Ban user
router.put(
  "/ban-user/:id",
  isAuthenticated,
  requirePermission('canManageUsers'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { reason } = req.body;
      const userId = req.params.id;

      if (!reason) {
        return next(new ErrorHandler("Please provide a reason for banning", 400));
      }

      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      if (user.role === "Admin") {
        return next(new ErrorHandler("Cannot ban admin users", 400));
      }

      if (user.isBanned) {
        return next(new ErrorHandler("User is already banned", 400));
      }

      user.isBanned = true;
      user.banReason = reason;
      user.bannedBy = req.user._id;
      user.bannedAt = new Date();

      await user.save();

      res.status(200).json({
        success: true,
        message: "User has been banned successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isBanned: user.isBanned,
          banReason: user.banReason,
          bannedAt: user.bannedAt,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Unban user
router.put(
  "/unban-user/:id",
  isAuthenticated,
  requirePermission('canManageUsers'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = req.params.id;

      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      if (!user.isBanned) {
        return next(new ErrorHandler("User is not banned", 400));
      }

      user.isBanned = false;
      user.banReason = null;
      user.bannedBy = null;
      user.bannedAt = null;

      await user.save();

      res.status(200).json({
        success: true,
        message: "User has been unbanned successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isBanned: user.isBanned,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Check ban status (for user-side)
router.get(
  "/ban-status",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).populate('bannedBy', 'name');

      res.status(200).json({
        success: true,
        isBanned: user.isBanned,
        banReason: user.banReason,
        bannedAt: user.bannedAt,
        bannedBy: user.bannedBy?.name || 'Admin',
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Create user by admin with role assignment
router.post(
  "/create-user-by-admin",
  isAuthenticated,
  isAdmin("Admin"),
  upload.single("file"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;

      console.log('[ADMIN CREATE USER] Request received:', {
        name: name,
        email: email,
        role: role,
        hasFile: !!req.file
      });

      // Validate required fields
      if (!name || !email || !password) {
        console.log('[ADMIN CREATE USER] Missing required fields');
        return next(new ErrorHandler("Please provide all required fields (name, email, password)", 400));
      }

      // Validate role
      const validRoles = ['user', 'Admin', 'Supplier'];
      if (!role || !validRoles.includes(role)) {
        console.log('[ADMIN CREATE USER] Invalid role:', role);
        return next(new ErrorHandler("Please provide a valid role (user, Admin, Supplier)", 400));
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('[ADMIN CREATE USER] User already exists:', email);
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return next(new ErrorHandler("User with this email already exists", 400));
      }

      // Handle avatar upload or use default
      let avatarData = {
        url: "https://res.cloudinary.com/dkzfopuco/image/upload/v1671086176/avatars/default-avatar_c2opvg.png",
        public_id: "avatars/default-avatar_c2opvg"
      };

      if (req.file) {
        try {
          console.log(`[ADMIN CREATE USER] Uploading avatar: ${req.file.originalname}`);
          const result = await uploadToCloudinary(req.file.buffer, {
            folder: 'users/avatars',
            resource_type: 'image',
            transformation: {
              width: 300,
              height: 300,
              crop: 'fill',
              gravity: 'face'
            }
          });
          console.log(`[ADMIN CREATE USER] Avatar uploaded successfully: ${result.url}`);
          
          avatarData = {
            url: result.url,
            public_id: result.public_id
          };
        } catch (error) {
          console.error('[ADMIN CREATE USER] Avatar upload error:', error);
          return next(new ErrorHandler(`Avatar upload failed: ${error.message}`, 400));
        }
      } else {
        console.log('[ADMIN CREATE USER] No avatar provided, using default');
      }

      // Create user directly (no email activation for admin-created users)
      const user = await User.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role: role,
        avatar: avatarData
      });

      console.log('[ADMIN CREATE USER] User created successfully:', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });

      // Create notification for admin user creation
      await NotificationService.createUserRegistrationNotification(
        'User Created by Admin',
        `Admin ${req.user.name} created a new ${role.toLowerCase()} account for ${name} (${email})`,
        'admin_user_creation',
        user._id
      );

      res.status(201).json({
        success: true,
        message: `${role} user created successfully`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('[ADMIN CREATE USER] Error:', error);
      // Clean up uploaded file if there's an error
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.log('Error cleaning up failed upload:', cleanupError.message);
        }
      }
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Change user role by admin
router.put(
  "/change-user-role/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { role } = req.body;
      const userId = req.params.id;

      console.log('[ADMIN CHANGE ROLE] Request received:', {
        userId: userId,
        newRole: role,
        adminId: req.user._id
      });

      // Validate role
      const validRoles = ['User', 'Admin', 'Supplier'];
      if (!role || !validRoles.includes(role)) {
        return next(new ErrorHandler("Please provide a valid role (User, Admin, Supplier)", 400));
      }

      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      // Prevent admin from changing their own role
      if (user._id.toString() === req.user._id.toString()) {
        return next(new ErrorHandler("You cannot change your own role", 400));
      }

      const oldRole = user.role;
      console.log('[ADMIN CHANGE ROLE] Role change request:', { userId, oldRole, newRole: role });
      
      // Handle role change logic - create shop when changing from user to Supplier
      // Check both lowercase 'user' (default) and uppercase 'User' (from frontend)
      if ((oldRole === 'user' || oldRole === 'User') && role === 'Supplier') {
        const Shop = require("../model/shop");
        
        console.log('[ADMIN CHANGE ROLE] User being promoted to Supplier, checking for existing shop...');
        
        // Check if shop already exists
        const existingShop = await Shop.findOne({ email: user.email });
        if (!existingShop) {
          console.log('[ADMIN CHANGE ROLE] Creating shop account for user:', user.email);
          
          try {
            // Create a default shop for the user with hashed password
            const newShop = await Shop.create({
              name: `${user.name}'s Shop`,
              email: user.email,
              password: 'temppassword123', // This will be hashed by the model middleware
              description: `Welcome to ${user.name}'s shop`,
              address: "Please update your address",
              phoneNumber: 1234567890, // Default, should be updated
              zipCode: 123456, // Default, should be updated
              avatar: {
                url: user.avatar?.url || "https://res.cloudinary.com/dkzfopuco/image/upload/v1683299454/avatar_gfxgav.png",
                public_id: user.avatar?.public_id || "avatar_gfxgav"
              }
            });
            console.log('[ADMIN CHANGE ROLE] ✅ Shop created successfully:', { shopId: newShop._id, email: newShop.email });
          } catch (shopError) {
            console.error('[ADMIN CHANGE ROLE] ❌ Failed to create shop:', shopError.message);
            return next(new ErrorHandler(`Failed to create shop: ${shopError.message}`, 500));
          }
        } else {
          console.log('[ADMIN CHANGE ROLE] Shop already exists for user:', { shopId: existingShop._id, email: user.email });
        }
      }
      
      // Handle role change from Supplier to other roles - optionally disable shop
      if (oldRole === 'Supplier' && role !== 'Supplier') {
        console.log('[ADMIN CHANGE ROLE] User role changed from Supplier - they will lose shop access');
      }
      
      user.role = role;
      
      // Force user to login again by updating a timestamp
      // This will invalidate their current session when they try to access protected routes
      user.roleChangedAt = new Date();
      
      await user.save();

      console.log('[ADMIN CHANGE ROLE] Role changed successfully:', {
        userId: user._id,
        oldRole: oldRole,
        newRole: role,
        roleChangedAt: user.roleChangedAt
      });

      res.status(200).json({
        success: true,
        message: `User role changed from ${oldRole} to ${role} successfully. ${
          role === 'Supplier' && oldRole === 'user' 
            ? 'Shop account created with email "' + user.email + '" and temporary password "temppassword123". User should change this password after first login. ' 
            : ''
        }All active sessions have been invalidated. User must login again with appropriate login type.`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        loginInstructions: {
          User: "Use regular user login",
          Admin: "Use regular user login",  
          Supplier: "Use shop login with email and temporary password"
        }[role]
      });
    } catch (error) {
      console.error('[ADMIN CHANGE ROLE] Error:', error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Test endpoint to check user and shop data
router.get("/check-user/:id", isAuthenticated, requirePermission('canManageUsers'), async (req, res) => {
  try {
    const userId = req.params.id;
    const User = require("../model/user");
    const Shop = require("../model/shop");
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const shop = await Shop.findOne({ email: user.email });
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleChangedAt: user.roleChangedAt
      },
      shop: shop ? {
        id: shop._id,
        name: shop.name,
        email: shop.email
      } : null
    });
  } catch (error) {
    console.error("Error checking user:", error);
    res.status(500).json({ error: error.message });
  }
});

// Debug: Check users and shops in database
router.get("/debug-users-shops", async (req, res) => {
  try {
    const User = require("../model/user");
    const Shop = require("../model/shop");
    
    const users = await User.find({}, { email: 1, role: 1, name: 1 });
    const shops = await Shop.find({}, { email: 1, name: 1 });
    
    res.json({
      users: users.map(u => ({ email: u.email, role: u.role, name: u.name })),
      shops: shops.map(s => ({ email: s.email, name: s.name })),
      usersCount: users.length,
      shopsCount: shops.length
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin utility: Update user role to Supplier for shop owners
router.put("/fix-supplier-roles", async (req, res) => {
  try {
    const User = require("../model/user");
    const Shop = require("../model/shop");
    
    // Find all users who have shops but don't have Supplier role
    const users = await User.find({});
    const updatedUsers = [];
    
    for (let user of users) {
      const shop = await Shop.findOne({ email: user.email });
      
      // If user has a shop but their role is not "Supplier"
      if (shop && user.role !== "Supplier") {
        const oldRole = user.role;
        user.role = "Supplier";
        await user.save();
        
        updatedUsers.push({
          email: user.email,
          name: user.name,
          oldRole: oldRole,
          newRole: "Supplier"
        });
        
        console.log(`Updated ${user.email} from ${oldRole} to Supplier`);
      }
    }
    
    res.json({
      success: true,
      message: `Updated ${updatedUsers.length} users to Supplier role`,
      updatedUsers
    });
    
  } catch (error) {
    console.error('Fix supplier roles error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user by email (for admin to check seller roles)
router.get("/get-user-by-email/:email", isAuthenticated, requirePermission('canManageUsers'), async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email: email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        isBanned: user.isBanned
      }
    });
  } catch (error) {
    console.error("Error getting user by email:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Create user account for existing seller (admin only)
router.post("/create-user-for-seller", isAuthenticated, isAdmin("Admin"), async (req, res) => {
  try {
    const { name, email, role } = req.body;

    console.log('[CREATE USER FOR SELLER] Request:', { name, email, role });

    // Validate input
    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and role are required"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User account already exists for this email"
      });
    }

    // Check if shop exists
    const Shop = require("../model/shop");
    const shop = await Shop.findOne({ email });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found for this email"
      });
    }

    // Create user account with shop's information
    const newUser = await User.create({
      name: name,
      email: email,
      password: 'temppassword123', // Default password - they should change this
      role: role,
      avatar: {
        url: shop.avatar?.url || "https://res.cloudinary.com/dkzfopuco/image/upload/v1683299454/avatar_gfxgav.png",
        public_id: shop.avatar?.public_id || "avatar_gfxgav"
      },
      phoneNumber: shop.phoneNumber || 1234567890,
      addresses: [{
        address1: shop.address || "Please update your address",
        zipCode: shop.zipCode || 123456
      }]
    });

    console.log('[CREATE USER FOR SELLER] User created:', newUser._id);

    res.status(201).json({
      success: true,
      message: `User account created successfully with role ${role}. Default password is 'temppassword123' - please inform the user to change it.`,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('[CREATE USER FOR SELLER] Error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create user account",
      error: error.message
    });
  }
});

// Debug endpoint - Check user and shop status
router.get(
  "/debug-user-shop/:email",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email } = req.params;
      
      console.log('[DEBUG] Checking user and shop for email:', email);
      
      // Check user
      const user = await User.findOne({ email: email });
      console.log('[DEBUG] User found:', user ? { id: user._id, email: user.email, role: user.role, name: user.name } : 'Not found');
      
      // Check shop
      const Shop = require("../model/shop");
      const shop = await Shop.findOne({ email: email });
      console.log('[DEBUG] Shop found:', shop ? { id: shop._id, email: shop.email, name: shop.name } : 'Not found');
      
      res.status(200).json({
        success: true,
        data: {
          user: user ? { id: user._id, email: user.email, role: user.role, name: user.name } : null,
          shop: shop ? { id: shop._id, email: shop.email, name: shop.name } : null,
          hasUser: !!user,
          hasShop: !!shop,
          userRole: user?.role,
          canCreateShop: user && user.role === 'Supplier' && !shop
        }
      });
    } catch (error) {
      console.error('[DEBUG] Error:', error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Force create shop for supplier
router.post(
  "/force-create-shop/:email",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email } = req.params;
      
      console.log('[FORCE CREATE SHOP] Creating shop for email:', email);
      
      // Check user
      const user = await User.findOne({ email: email });
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
      
      if (user.role !== 'Supplier') {
        return next(new ErrorHandler("User must have Supplier role", 400));
      }
      
      // Check if shop already exists
      const Shop = require("../model/shop");
      const existingShop = await Shop.findOne({ email: email });
      if (existingShop) {
        return next(new ErrorHandler("Shop already exists for this email", 400));
      }
      
      // Create shop
      const newShop = await Shop.create({
        name: `${user.name}'s Shop`,
        email: user.email,
        password: 'temppassword123',
        description: `Welcome to ${user.name}'s shop`,
        address: "Please update your address",
        phoneNumber: 1234567890,
        zipCode: 123456,
        avatar: {
          url: user.avatar?.url || "https://res.cloudinary.com/dkzfopuco/image/upload/v1683299454/avatar_gfxgav.png",
          public_id: user.avatar?.public_id || "avatar_gfxgav"
        }
      });
      
      console.log('[FORCE CREATE SHOP] Shop created successfully:', newShop._id);
      
      res.status(200).json({
        success: true,
        message: "Shop created successfully",
        shop: {
          id: newShop._id,
          name: newShop.name,
          email: newShop.email
        }
      });
    } catch (error) {
      console.error('[FORCE CREATE SHOP] Error:', error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get all admin users (Admin, SubAdmin, Manager) - Only Admin can access
router.get(
  "/admin-staff",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const adminUsers = await User.find({
        role: { $in: ["Admin", "SubAdmin", "Manager"] }
      }).select("-password").sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        adminUsers,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Create SubAdmin or Manager - Only Admin can create
router.post(
  "/create-admin-user",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, email, password, role, customPermissions } = req.body;

      // Validate role
      if (!["SubAdmin", "Manager"].includes(role)) {
        return next(new ErrorHandler("Invalid role. Only SubAdmin and Manager can be created", 400));
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return next(new ErrorHandler("User with this email already exists", 400));
      }

      // Create user with role and optional custom permissions
      const user = await User.create({
        name,
        email,
        password,
        role,
        permissions: customPermissions || {}
      });

      res.status(201).json({
        success: true,
        message: `${role} created successfully`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions
        }
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update admin user role or permissions - Only Admin can update
router.put(
  "/update-admin-user/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { role, permissions } = req.body;
      const userId = req.params.id;

      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      // Prevent modifying the main Admin account
      if (user.role === "Admin" && req.user._id.toString() !== userId) {
        return next(new ErrorHandler("Cannot modify other Admin accounts", 403));
      }

      // Update role if provided
      if (role && ["SubAdmin", "Manager"].includes(role)) {
        user.role = role;
      }

      // Update custom permissions if provided
      if (permissions && typeof permissions === 'object') {
        user.permissions = { ...user.permissions, ...permissions };
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: "Admin user updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions
        }
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Delete admin user (SubAdmin/Manager) - Only Admin can delete
router.delete(
  "/delete-admin-user/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = req.params.id;
      const user = await User.findById(userId);

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      // Prevent deleting Admin accounts
      if (user.role === "Admin") {
        return next(new ErrorHandler("Cannot delete Admin accounts", 403));
      }

      // Prevent self-deletion
      if (req.user._id.toString() === userId) {
        return next(new ErrorHandler("Cannot delete your own account", 403));
      }

      await User.findByIdAndDelete(userId);

      res.status(200).json({
        success: true,
        message: `${user.role} deleted successfully`
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
