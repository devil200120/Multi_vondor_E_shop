const axios = require('axios');
const ShippingConfig = require('../model/shippingConfig');
const ShippingCalculation = require('../model/shippingCalculation');

class EnhancedShippingService {
  constructor() {
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyBecpP3O2kfTa0z-lLIiShmsZE6e1kDmOk';
    this.distanceMatrixBaseUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json';
  }

  /**
   * Calculate shipping cost with product-level configuration support
   */
  async calculateShippingCost(params) {
    const {
      shopId,
      userId,
      userLocation,
      orderValue,
      totalWeight,
      isExpress = false,
      orderId,
      products = [] // Array of products with their shipping configs
    } = params;

    try {
      // Get supplier's shipping configuration
      const shippingConfig = await ShippingConfig.findOne({ shopId, isActive: true });
      
      if (!shippingConfig) {
        throw new Error('Shipping configuration not found for this supplier');
      }

      // Check service area
      const isInServiceArea = await this.checkServiceArea(shippingConfig, userLocation.pincode);
      if (!isInServiceArea) {
        throw new Error('Delivery not available in your area');
      }

      // Get distance data
      const distanceData = await this.getDistanceAndDuration(
        shippingConfig.location,
        userLocation
      );

      const distanceInKm = distanceData.distance.value / 1000;
      if (distanceInKm > shippingConfig.maxDeliveryDistance) {
        throw new Error(`Delivery not available beyond ${shippingConfig.maxDeliveryDistance}km radius`);
      }

      // Calculate shipping based on product configurations
      const shippingResult = await this.calculateProductBasedShipping({
        products,
        shippingConfig,
        distanceData,
        orderValue,
        totalWeight,
        isExpress,
        distanceInKm
      });

      // Save calculation for audit
      const shippingCalculationRecord = new ShippingCalculation({
        orderId,
        shopId,
        userId,
        origin: shippingConfig.location,
        destination: userLocation,
        distance: distanceData.distance,
        duration: distanceData.duration,
        durationInTraffic: distanceData.durationInTraffic,
        calculation: shippingResult.breakdown,
        orderValue,
        totalWeight,
        isExpress,
        isPeakHour: this.isPeakHour(shippingConfig.peakHours),
        isFreeShipping: shippingResult.finalCost === 0,
        googleMapsResponse: distanceData.rawResponse
      });

      await shippingCalculationRecord.save();

      return {
        success: true,
        data: {
          shippingCost: shippingResult.finalCost,
          estimatedDeliveryTime: distanceData.durationInTraffic || distanceData.duration,
          distance: distanceData.distance,
          breakdown: shippingResult.breakdown,
          productShippingDetails: shippingResult.productDetails,
          freeShippingApplied: shippingResult.freeShippingApplied,
          hasProductLevelShipping: shippingResult.hasProductLevelShipping
        }
      };

    } catch (error) {
      console.error('Enhanced shipping calculation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate shipping based on individual product configurations
   */
  async calculateProductBasedShipping(params) {
    const { products, shippingConfig, distanceData, orderValue, totalWeight, isExpress, distanceInKm } = params;

    let finalCost = 0;
    let hasProductLevelShipping = false;
    let freeShippingApplied = false;
    const productDetails = [];

    // First pass: Check for product-level shipping configurations
    for (const product of products) {
      const productDetail = {
        productId: product._id || product.id,
        name: product.name,
        quantity: product.quantity || 1,
        price: product.price || product.discountPrice,
        customShippingRate: 0,
        shippingCost: 0,
        freeShipping: false,
        specialHandling: false,
        restrictions: []
      };

      // Check if product has custom shipping configuration
      if (product.shipping && product.shipping.baseShippingRate > 0) {
        hasProductLevelShipping = true;
        
        // Check product-level free shipping threshold
        const productTotal = productDetail.price * productDetail.quantity;
        if (product.shipping.freeShippingThreshold && 
            productTotal >= product.shipping.freeShippingThreshold) {
          productDetail.freeShipping = true;
          freeShippingApplied = true;
        } else {
          // Calculate product-specific shipping
          let productShipping = product.shipping.baseShippingRate * productDetail.quantity;
          productDetail.customShippingRate = product.shipping.baseShippingRate;
          
          // Add special handling charges
          if (product.shipping.restrictions?.requiresSpecialHandling) {
            const specialCharge = product.shipping.restrictions.specialHandlingCharge || 0;
            productShipping += specialCharge * productDetail.quantity;
            productDetail.specialHandling = true;
          }
          
          // Apply express delivery multiplier
          if (isExpress && product.shipping.expressDeliveryAvailable) {
            productShipping *= shippingConfig.expressDelivery?.multiplier || 1.5;
          }
          
          productDetail.shippingCost = productShipping;
          finalCost += productShipping;
        }

        // Check pincode restrictions
        if (product.shipping.restrictions?.excludePincodes?.includes(userLocation.pincode)) {
          productDetail.restrictions.push('Pincode excluded');
        }
      }

      productDetails.push(productDetail);
    }

    // If no products have custom shipping, use shop's default calculation
    if (!hasProductLevelShipping) {
      const calculation = this.performShippingCalculation({
        shippingConfig,
        distanceData,
        orderValue,
        totalWeight,
        isExpress
      });
      
      finalCost = calculation.finalAmount;
      
      // Check shop-level free shipping
      if (orderValue >= shippingConfig.freeShippingThreshold) {
        finalCost = 0;
        freeShippingApplied = true;
      }
    } else {
      // Mixed approach: Handle products without custom shipping using default rates
      const productsWithoutCustomShipping = products.filter(p => 
        !p.shipping || p.shipping.baseShippingRate === 0
      );
      
      if (productsWithoutCustomShipping.length > 0) {
        const defaultOrderValue = productsWithoutCustomShipping.reduce((sum, p) => 
          sum + ((p.price || p.discountPrice) * (p.quantity || 1)), 0
        );
        const defaultWeight = productsWithoutCustomShipping.reduce((sum, p) => 
          sum + ((p.shipping?.weight || 1) * (p.quantity || 1)), 0
        );

        const defaultCalculation = this.performShippingCalculation({
          shippingConfig,
          distanceData,
          orderValue: defaultOrderValue,
          totalWeight: defaultWeight,
          isExpress
        });

        finalCost += defaultCalculation.finalAmount;

        // Update product details for default shipping products
        productsWithoutCustomShipping.forEach(product => {
          const detail = productDetails.find(p => p.productId === (product._id || product.id));
          if (detail) {
            detail.shippingCost = defaultCalculation.finalAmount / productsWithoutCustomShipping.length;
            detail.customShippingRate = 0; // Uses shop default
          }
        });
      }

      // Apply shop-level free shipping if total order qualifies
      if (!freeShippingApplied && 
          shippingConfig.freeShippingThreshold && 
          orderValue >= shippingConfig.freeShippingThreshold) {
        finalCost = 0;
        freeShippingApplied = true;
        
        // Update all product details
        productDetails.forEach(detail => {
          detail.freeShipping = true;
          detail.shippingCost = 0;
        });
      }
    }

    // Create detailed breakdown
    const breakdown = {
      productLevelShipping: hasProductLevelShipping,
      shopLevelFreeShipping: freeShippingApplied && orderValue >= shippingConfig.freeShippingThreshold,
      totalProductShippingCost: finalCost,
      distanceInKm,
      baseShopRate: shippingConfig.baseRate,
      perKmRate: shippingConfig.perKmRate,
      freeShippingThreshold: shippingConfig.freeShippingThreshold,
      expressDeliveryApplied: isExpress,
      finalAmount: finalCost
    };

    return {
      finalCost,
      hasProductLevelShipping,
      freeShippingApplied,
      productDetails,
      breakdown
    };
  }

  /**
   * Traditional shipping calculation for products without custom rates
   */
  performShippingCalculation(params) {
    const { shippingConfig, distanceData, orderValue, totalWeight, isExpress } = params;
    
    const distanceInKm = distanceData.distance.value / 1000;
    
    // Check for free shipping
    if (orderValue >= shippingConfig.freeShippingThreshold) {
      return {
        baseRate: 0,
        distanceRate: 0,
        weightMultiplier: 1,
        expressMultiplier: 1,
        peakHourMultiplier: 1,
        finalAmount: 0
      };
    }

    // Base calculation
    let shippingCost = shippingConfig.baseRate;
    
    // Distance-based pricing
    const distanceRate = distanceInKm * shippingConfig.perKmRate;
    shippingCost += distanceRate;
    
    // Weight-based pricing
    let weightMultiplier = 1;
    if (shippingConfig.weightBasedPricing?.enabled && totalWeight > shippingConfig.weightBasedPricing.baseWeight) {
      const extraWeight = totalWeight - shippingConfig.weightBasedPricing.baseWeight;
      const weightCharge = extraWeight * shippingConfig.weightBasedPricing.additionalWeightRate;
      shippingCost += weightCharge;
      weightMultiplier = 1 + (extraWeight * 0.1); // 10% increase per extra kg
    }
    
    // Express delivery multiplier
    let expressMultiplier = 1;
    if (isExpress && shippingConfig.expressDelivery?.enabled) {
      expressMultiplier = shippingConfig.expressDelivery.multiplier;
      shippingCost *= expressMultiplier;
    }
    
    // Peak hour multiplier
    let peakHourMultiplier = 1;
    if (this.isPeakHour(shippingConfig.peakHours)) {
      peakHourMultiplier = shippingConfig.peakHourMultiplier;
      shippingCost *= peakHourMultiplier;
    }

    return {
      baseRate: shippingConfig.baseRate,
      distanceRate,
      weightMultiplier,
      expressMultiplier,
      peakHourMultiplier,
      finalAmount: Math.round(shippingCost * 100) / 100 // Round to 2 decimal places
    };
  }

  /**
   * Get distance and duration between two locations
   */
  async getDistanceAndDuration(origin, destination) {
    try {
      const originStr = `${origin.latitude},${origin.longitude}`;
      const destinationStr = `${destination.latitude},${destination.longitude}`;

      const url = `${this.distanceMatrixBaseUrl}?origins=${originStr}&destinations=${destinationStr}&departure_time=now&traffic_model=best_guess&key=${this.googleMapsApiKey}`;

      const response = await axios.get(url);
      
      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      const element = response.data.rows[0].elements[0];
      
      if (element.status !== 'OK') {
        throw new Error(`Route calculation failed: ${element.status}`);
      }

      return {
        distance: element.distance,
        duration: element.duration,
        durationInTraffic: element.duration_in_traffic || element.duration,
        rawResponse: response.data
      };

    } catch (error) {
      console.error('Distance calculation error:', error);
      throw new Error('Failed to calculate distance. Please try again.');
    }
  }

  /**
   * Check if current time is within peak hours
   */
  isPeakHour(peakHours) {
    if (!peakHours || peakHours.length === 0) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    return peakHours.some(period => {
      const startTime = parseInt(period.start.replace(':', ''));
      const endTime = parseInt(period.end.replace(':', ''));
      return currentTime >= startTime && currentTime <= endTime;
    });
  }

  /**
   * Check if delivery is available in the service area
   */
  async checkServiceArea(shippingConfig, pincode) {
    // If no specific service areas defined, delivery is available everywhere within max distance
    if (!shippingConfig.serviceAreas || shippingConfig.serviceAreas.length === 0) {
      return true;
    }
    
    // Check if pincode is in the service areas
    return shippingConfig.serviceAreas.some(area => area.pincode === pincode);
  }

  /**
   * Get cached shipping calculation if available and recent
   */
  async getCachedCalculation(shopId, userLocation, shopLocation) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    return await ShippingCalculation.findOne({
      shopId,
      'destination.pincode': userLocation.pincode,
      'origin.pincode': shopLocation.pincode,
      calculatedAt: { $gte: oneHourAgo }
    }).sort({ calculatedAt: -1 });
  }
}

module.exports = EnhancedShippingService;