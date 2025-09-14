const express = require("express");
const {
  checkPincodeDelivery,
  searchLocations,
  getPlaceDetails,
  calculateShipping,
  initializeServiceableAreas,
  testPincodeValidation,
} = require("../controller/pincode");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/check/:pincode", checkPincodeDelivery);
router.get("/test/:pincode", testPincodeValidation); // Debug endpoint
router.get("/search", searchLocations);
router.get("/place/:placeId", getPlaceDetails);
router.post("/calculate-shipping", calculateShipping);

// Admin routes
router.post("/initialize-areas", isAuthenticated, isAdmin("Admin"), initializeServiceableAreas);

module.exports = router;