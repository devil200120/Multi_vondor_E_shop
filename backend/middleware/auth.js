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

  // Don't block login for banned shops - let them access dashboard to see ban message
  // The ban check will be handled in the frontend components
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

exports.isAdmin = (...roles) => {
  return (req, res, next) => {
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
