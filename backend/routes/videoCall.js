const express = require("express");
const router = express.Router();
const { isAuthenticated, isSeller } = require("../middleware/auth");
const {
  initiateVideoCall,
  respondToVideoCall,
  endVideoCall,
  getSellerVideoCallHistory,
  getCustomerVideoCallHistory,
  getEligibleCustomers,
  getVideoCallAnalytics,
  getSellerInfo,
  getProductSellerInfo,
  blockCustomer,
  unblockCustomer,
  getBlockedCustomers,
  checkCustomerBlocked,
} = require("../controller/videoCall");

// Middleware to support both user and seller authentication
const isUserOrSeller = (req, res, next) => {
  const jwt = require("jsonwebtoken");
  
  // Try seller token first
  const sellerToken = req.cookies.seller_token;
  if (sellerToken) {
    try {
      const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET_KEY);
      
      const Shop = require("../model/shop");
      Shop.findById(decoded.id).then(seller => {
        if (seller) {
          req.seller = seller;
          return next();
        }
        tryUserToken();
      }).catch((error) => {
        tryUserToken();
      });
    } catch (error) {
      tryUserToken();
    }
  } else {
    tryUserToken();
  }
  
  function tryUserToken() {
    const userToken = req.cookies.token;
    if (userToken) {
      try {
        const decoded = jwt.verify(userToken, process.env.JWT_SECRET_KEY);
        
        const User = require("../model/user");
        User.findById(decoded.id).then(user => {
          if (user) {
            req.user = user;
            return next();
          }
          return res.status(401).json({
            success: false,
            message: "Please login to continue"
          });
        }).catch((error) => {
          return res.status(401).json({
            success: false,
            message: "Please login to continue"
          });
        });
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: "Please login to continue"
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: "Please login to continue"
      });
    }
  }
};

// Seller routes
router.post("/initiate", isUserOrSeller, initiateVideoCall);
router.get("/history/:sellerId", isUserOrSeller, getSellerVideoCallHistory);
router.get("/customers/:sellerId", isUserOrSeller, getEligibleCustomers);
router.get("/analytics/:sellerId", isUserOrSeller, getVideoCallAnalytics);

// Customer routes
router.post("/respond", isUserOrSeller, respondToVideoCall);
router.get("/customer-history/:customerId", isUserOrSeller, getCustomerVideoCallHistory);

// Info routes for customer-initiated calls
router.get("/seller-info/:sellerId", isUserOrSeller, getSellerInfo);
router.get("/product-seller/:productId", isUserOrSeller, getProductSellerInfo);

// Common routes (both seller and customer)
router.post("/end", isUserOrSeller, endVideoCall);

// Blocking routes (seller only)
router.post("/block-customer", isSeller, blockCustomer);
router.post("/unblock-customer", isSeller, unblockCustomer);
router.get("/blocked-customers", isSeller, getBlockedCustomers);
router.get("/check-blocked/:customerId", isSeller, checkCustomerBlocked);

module.exports = router;