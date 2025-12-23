const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Shop = require("../model/shop");

// Check if user is authenticated or not
exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("Please login to continue", 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const user = await User.findById(decoded.id);
  
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Check if user's role was changed after the token was issued
  if (user.roleChangedAt && user.roleChangedAt > new Date(decoded.iat * 1000)) {
    return next(new ErrorHandler("Your role has been changed. Please log in again.", 401));
  }

  // Prevent suppliers from using user login - they should use shop login
  if (user.role === "Supplier") {
    return next(new ErrorHandler("Suppliers must login through shop login. Please use shop login to access your dashboard.", 401));
  }

  // Check if user is banned
  if (user.isBanned) {
    return next(new ErrorHandler(`Your account has been banned. Reason: ${user.banReason}`, 403));
  }

  req.user = user;
  next();
});

exports.isSeller = catchAsyncErrors(async (req, res, next) => {
  const { seller_token } = req.cookies;
  if (!seller_token) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);

  const shop = await Shop.findById(decoded.id);
  
  if (!shop) {
    return next(new ErrorHandler("Shop not found", 404));
  }

  // Check if there's a user with this email
  const user = await User.findOne({ email: shop.email });
  
  console.log(`[SELLER AUTH] Shop email: ${shop.email}`);
  console.log(`[SELLER AUTH] User found:`, user ? `Yes, role: ${user.role}` : 'No');
  
  // If user exists, validate their role
  if (user) {
    // Allow Supplier and User roles, block others (like Admin)
    if (!['Supplier', 'User'].includes(user.role)) {
      console.log(`[SELLER AUTH] Blocking access for role: ${user.role}`);
      return next(new ErrorHandler("Access denied. Your role has been changed. Please login with your current role.", 401));
    }
    console.log(`[SELLER AUTH] Allowing access for role: ${user.role}`);
  } else {
    console.log(`[SELLER AUTH] No user found with email, allowing shop-only access`);
  }
  // If no user exists with this email, it's a shop-only registration, which is fine

  // Don't block login for banned shops - let them access dashboard to see ban message
  // The ban check will be handled in the frontend components
  
  // Note: We don't check approval status here because sellers should be able to access
  // their dashboard to see their approval status. The approval check is handled
  // during login in the shop controller.
  req.seller = shop;
  next();
});

// Middleware to check if seller is banned for operations (not for login/dashboard access)
exports.isSellerNotBanned = catchAsyncErrors(async (req, res, next) => {
  if (req.seller && req.seller.isBanned) {
    return next(new ErrorHandler(`Your shop has been banned. Reason: ${req.seller.banReason}`, 403));
  }
  next();
});

// Middleware to check if seller is approved for operations
exports.isSellerApproved = catchAsyncErrors(async (req, res, next) => {
  if (!req.seller) {
    return next(new ErrorHandler("Seller authentication required", 401));
  }
  
  if (req.seller.approvalStatus === 'pending') {
    return next(new ErrorHandler("Your shop is pending admin approval. You cannot perform this action until approved.", 403));
  }
  
  if (req.seller.approvalStatus === 'rejected') {
    return next(new ErrorHandler(`Your shop has been rejected. Reason: ${req.seller.rejectionReason || 'No reason provided'}`, 403));
  }
  
  next();
});

exports.isAdmin = (...roles) => {
  return (req, res, next) => {
    // Double-check that user actually has admin role in database
    if (!req.user || req.user.role !== "Admin") {
      return next(
        new ErrorHandler("Access denied. Admin role required.", 403)
      );
    }
    
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`${req.user.role} can not access this resources!`)
      );
    }
    next();
  };
};

// Why this auth?
// This auth is for the user to login and get the token
// This token will be used to access the protected routes like create, update, delete, etc. (autharization)
