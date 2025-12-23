const express = require("express");
const { Pincode, ServiceableArea } = require("../model/pincode");
const GoogleMapsService = require("../utils/GoogleMapsService");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

const googleMapsService = new GoogleMapsService();

// Check pincode delivery availability using Google Maps API
const checkPincodeDelivery = catchAsyncErrors(async (req, res, next) => {
  try {
    const { pincode } = req.params;

    if (!pincode || pincode.length !== 6) {
      return next(new ErrorHandler("Please provide a valid 6-digit pincode", 400));
    }

    // Validate pincode using Google Maps API
    const validationResult = await googleMapsService.validatePincode(pincode);

    console.log(`Validation result for ${pincode}:`, validationResult);

    if (!validationResult.isValid) {
      console.log(`Pincode validation failed: ${validationResult.message}`);
      return res.status(404).json({
        success: false,
        message: validationResult.message || "Sorry, we do not ship to this pincode. Try another one!",
        deliveryAvailable: false,
      });
    }

    const locationData = validationResult.data;
    console.log(`Location data:`, locationData);

    // Check if we deliver to this state (initially Karnataka only)
    // Only use the validated data from Google Maps API
    let isKarnataka = false;
    
    if (locationData.state) {
      isKarnataka = googleMapsService.isWithinState(locationData.state, 'Karnataka');
    }
    
    console.log(`Is Karnataka: ${isKarnataka}, State: ${locationData.state}`);

    if (!isKarnataka) {
      console.log(`Delivery not available - outside Karnataka. State: ${locationData.state}`);
      return res.status(200).json({
        success: false,
        message: "Delivery Not Available",
        deliveryAvailable: false,
        data: {
          pincode: locationData.pincode,
          area: locationData.area,
          district: locationData.district,
          state: locationData.state,
          formattedAddress: locationData.formattedAddress,
        },
      });
    }

    // Check if specific pincode has custom delivery settings
    let deliverySettings = await Pincode.getDeliveryInfo(pincode);
    
    if (!deliverySettings) {
      // Check serviceable area for the state/district
      const serviceableArea = await ServiceableArea.isServiceable(locationData.state, locationData.district);
      
      if (serviceableArea) {
        deliverySettings = {
          deliveryAvailable: true,
          estimatedDeliveryDays: serviceableArea.defaultDeliveryDays,
          shippingCharge: serviceableArea.defaultShippingCharge,
          cashOnDelivery: serviceableArea.cashOnDelivery,
          expressDelivery: serviceableArea.expressDelivery,
        };
      } else {
        // Default settings for Karnataka
        const estimatedDays = googleMapsService.estimateDeliveryTime(
          locationData.state, 
          locationData.district
        );
        
        deliverySettings = {
          deliveryAvailable: true,
          estimatedDeliveryDays: estimatedDays,
          shippingCharge: estimatedDays <= 2 ? 30 : 50, // Lower shipping for metro cities
          cashOnDelivery: true,
          expressDelivery: estimatedDays <= 4, // Express only for nearby areas
        };
      }
    }

    if (!deliverySettings.deliveryAvailable) {
      return res.status(200).json({
        success: false,
        message: "Delivery is currently not available for this pincode",
        deliveryAvailable: false,
        data: {
          pincode: locationData.pincode,
          area: locationData.area,
          district: locationData.district,
          state: locationData.state,
          formattedAddress: locationData.formattedAddress,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: `Delivery available to ${locationData.area}, ${locationData.district}`,
      deliveryAvailable: true,
      data: {
        pincode: locationData.pincode,
        area: locationData.area,
        district: locationData.district,
        state: locationData.state,
        country: locationData.country,
        formattedAddress: locationData.formattedAddress,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        estimatedDeliveryDays: deliverySettings.estimatedDeliveryDays,
        shippingCharge: deliverySettings.shippingCharge,
        cashOnDelivery: deliverySettings.cashOnDelivery,
        expressDelivery: deliverySettings.expressDelivery,
      },
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Search locations using Google Places API
const searchLocations = catchAsyncErrors(async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 3) {
      return next(new ErrorHandler("Search query must be at least 3 characters", 400));
    }

    const places = await googleMapsService.searchPlaces(query + ", Karnataka, India");

    res.status(200).json({
      success: true,
      data: places,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get place details by place ID
const getPlaceDetails = catchAsyncErrors(async (req, res, next) => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return next(new ErrorHandler("Place ID is required", 400));
    }

    const placeDetails = await googleMapsService.getPlaceDetails(placeId);

    // Check delivery availability for this place
    const isKarnataka = googleMapsService.isWithinState(placeDetails.state, 'Karnataka');

    res.status(200).json({
      success: true,
      data: {
        ...placeDetails,
        deliveryAvailable: isKarnataka,
        estimatedDeliveryDays: isKarnataka ? 
          googleMapsService.estimateDeliveryTime(placeDetails.state, placeDetails.district) : 
          null,
      },
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Calculate shipping charges based on pincode and cart value
const calculateShipping = catchAsyncErrors(async (req, res, next) => {
  try {
    const { pincode, cartValue = 0, expressDelivery = false } = req.body;

    if (!pincode || pincode.length !== 6) {
      return next(new ErrorHandler("Please provide a valid 6-digit pincode", 400));
    }

    // Validate pincode using Google Maps API
    const validationResult = await googleMapsService.validatePincode(pincode);

    if (!validationResult.isValid) {
      return next(new ErrorHandler("Invalid pincode", 400));
    }

    const locationData = validationResult.data;

    // Check if we deliver to this location
    const isKarnataka = googleMapsService.isWithinState(locationData.state, 'Karnataka');

    if (!isKarnataka) {
      return next(new ErrorHandler("Delivery not available for this pincode", 400));
    }

    // Get delivery settings
    let deliverySettings = await Pincode.getDeliveryInfo(pincode);
    
    if (!deliverySettings) {
      const estimatedDays = googleMapsService.estimateDeliveryTime(
        locationData.state, 
        locationData.district
      );
      
      deliverySettings = {
        deliveryAvailable: true,
        estimatedDeliveryDays: estimatedDays,
        shippingCharge: estimatedDays <= 2 ? 30 : 50,
        cashOnDelivery: true,
        expressDelivery: estimatedDays <= 4,
      };
    }

    let shippingCharge = deliverySettings.shippingCharge;

    // Free shipping for orders above ₹999
    if (cartValue >= 999) {
      shippingCharge = 0;
    }

    // Express delivery charges
    let finalDeliveryDays = deliverySettings.estimatedDeliveryDays;
    if (expressDelivery && deliverySettings.expressDelivery) {
      shippingCharge += 50; // Additional ₹50 for express delivery
      finalDeliveryDays = Math.max(1, finalDeliveryDays - 2);
    }

    res.status(200).json({
      success: true,
      data: {
        pincode: locationData.pincode,
        area: locationData.area,
        district: locationData.district,
        state: locationData.state,
        formattedAddress: locationData.formattedAddress,
        shippingCharge: shippingCharge,
        estimatedDeliveryDays: finalDeliveryDays,
        freeShipping: cartValue >= 999,
        freeShippingThreshold: 999,
        expressDeliveryAvailable: deliverySettings.expressDelivery,
        cashOnDeliveryAvailable: deliverySettings.cashOnDelivery,
      },
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Initialize serviceable areas (Admin function)
const initializeServiceableAreas = catchAsyncErrors(async (req, res, next) => {
  try {
    // Create Karnataka as serviceable area
    const existingKarnataka = await ServiceableArea.findOne({ state: 'Karnataka' });
    
    if (!existingKarnataka) {
      await ServiceableArea.create({
        state: 'Karnataka',
        districts: [
          'Bangalore Urban', 'Bangalore Rural', 'Mysore', 'Hubli-Dharwad', 
          'Mangalore', 'Belgaum', 'Gulbarga', 'Davangere', 'Bellary', 
          'Bijapur', 'Shimoga', 'Tumkur', 'Raichur', 'Bidar', 'Bagalkot',
          'Hassan', 'Gadag', 'Mandya', 'Koppal', 'Kolar', 'Chikmagalur',
          'Chitradurga', 'Udupi', 'Haveri', 'Kodagu', 'Dharwad', 'Chamarajanagar',
          'Chikkaballapur', 'Dakshina Kannada', 'Yadgir', 'Ramanagara'
        ],
        deliveryAvailable: true,
        defaultDeliveryDays: 5,
        defaultShippingCharge: 50,
        cashOnDelivery: true,
        expressDelivery: true,
      });
    }

    res.status(200).json({
      success: true,
      message: "Serviceable areas initialized successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Check pincode delivery for specific product
const checkProductPincodeDelivery = catchAsyncErrors(async (req, res, next) => {
  try {
    const { pincode, productId } = req.params;

    if (!pincode || pincode.length !== 6) {
      return next(new ErrorHandler("Please provide a valid 6-digit pincode", 400));
    }

    // Validate pincode using Google Maps API
    const validationResult = await googleMapsService.validatePincode(pincode);

    if (!validationResult.isValid) {
      return res.status(404).json({
        success: false,
        message: validationResult.message || "Invalid pincode",
        deliveryAvailable: false,
      });
    }

    const locationData = validationResult.data;

    // Get product data to check custom service pincodes
    const Product = require("../model/product");
    const product = await Product.findById(productId);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    let isServiceable = false;
    let deliverySettings = null;

    // Check if product has custom service pincodes defined
    if (product.shipping?.restrictions?.customServicePincodes?.length > 0) {
      // If custom pincodes are set, only those pincodes are serviceable
      isServiceable = product.shipping.restrictions.customServicePincodes.includes(pincode);
      
      if (!isServiceable) {
        return res.status(200).json({
          success: false,
          message: "Sorry, we do not deliver to this pincode for this product.",
          deliveryAvailable: false,
          data: {
            pincode: locationData.pincode,
            area: locationData.area,
            district: locationData.district,
            state: locationData.state,
            formattedAddress: locationData.formattedAddress,
            useCustomPincodes: true,
          },
        });
      }
    } else {
      // No custom pincodes set, check exclude pincodes and Karnataka validation
      if (product.shipping?.restrictions?.excludePincodes?.includes(pincode)) {
        return res.status(200).json({
          success: false,
          message: "Delivery is not available for this pincode for this product.",
          deliveryAvailable: false,
          data: {
            pincode: locationData.pincode,
            area: locationData.area,
            district: locationData.district,
            state: locationData.state,
            formattedAddress: locationData.formattedAddress,
            excludedByProduct: true,
          },
        });
      }

      // Fall back to Karnataka validation
      const isKarnataka = googleMapsService.isWithinState(locationData.state, 'Karnataka');
      
      if (!isKarnataka) {
        return res.status(200).json({
          success: false,
          message: "Delivery Not available",
          deliveryAvailable: false,
          data: {
            pincode: locationData.pincode,
            area: locationData.area,
            district: locationData.district,
            state: locationData.state,
            formattedAddress: locationData.formattedAddress,
            useKarnatakaDefault: true,
          },
        });
      }
      
      isServiceable = true;
    }

    // Get delivery settings
    deliverySettings = await Pincode.getDeliveryInfo(pincode);
    
    if (!deliverySettings) {
      const estimatedDays = googleMapsService.estimateDeliveryTime(
        locationData.state, 
        locationData.district
      );
      
      deliverySettings = {
        deliveryAvailable: true,
        estimatedDeliveryDays: estimatedDays,
        shippingCharge: estimatedDays <= 2 ? 30 : 50,
        cashOnDelivery: true,
        expressDelivery: estimatedDays <= 4,
      };
    }

    // Apply product-specific shipping settings if available
    if (product.shipping?.baseShippingRate > 0) {
      deliverySettings.shippingCharge = product.shipping.baseShippingRate;
    }
    
    if (product.shipping?.estimatedDeliveryDays) {
      deliverySettings.estimatedDeliveryDays = 
        Math.max(product.shipping.estimatedDeliveryDays.min, product.shipping.estimatedDeliveryDays.max);
    }

    res.status(200).json({
      success: true,
      message: `Delivery available to ${locationData.area}, ${locationData.district}`,
      deliveryAvailable: true,
      data: {
        pincode: locationData.pincode,
        area: locationData.area,
        district: locationData.district,
        state: locationData.state,
        country: locationData.country,
        formattedAddress: locationData.formattedAddress,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        estimatedDeliveryDays: deliverySettings.estimatedDeliveryDays,
        shippingCharge: deliverySettings.shippingCharge,
        cashOnDelivery: deliverySettings.cashOnDelivery,
        expressDelivery: deliverySettings.expressDelivery,
        productId: product._id,
        useCustomPincodes: product.shipping?.restrictions?.customServicePincodes?.length > 0,
      },
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Test endpoint for debugging pincode validation
const testPincodeValidation = catchAsyncErrors(async (req, res, next) => {
  try {
    const { pincode } = req.params;

    console.log(`Testing pincode validation for: ${pincode}`);

    // Test Google Maps API directly
    const validationResult = await googleMapsService.validatePincode(pincode);
    
    // Test state validation
    const isKarnataka = validationResult.isValid ? 
      googleMapsService.isWithinState(validationResult.data.state, 'Karnataka') : 
      false;

    res.status(200).json({
      success: true,
      debug: {
        pincode,
        validationResult,
        isKarnataka,
        apiKeyPresent: !!process.env.GOOGLE_MAPS_API_KEY,
      },
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

module.exports = {
  checkPincodeDelivery,
  checkProductPincodeDelivery,
  searchLocations,
  getPlaceDetails,
  calculateShipping,
  initializeServiceableAreas,
  testPincodeValidation,
};