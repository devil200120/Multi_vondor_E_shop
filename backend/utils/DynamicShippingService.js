const axios = require('axios');
const ShippingConfig = require('../model/shippingConfig');
const ShippingCalculation = require('../model/shippingCalculation');

class DynamicShippingService {
  constructor() {
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.distanceMatrixBaseUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json';
  }

  /**
   * Calculate shipping cost based on supplier config and distance
   */
  async calculateShippingCost(params) {
    const {
      shopId,
      userId,
      userLocation,
      orderValue,
      totalWeight = 1,
      isExpress = false,
      orderId = `temp_${Date.now()}`
    } = params;

    try {
      // Get supplier shipping configuration
      const shippingConfig = await ShippingConfig.findOne({ shopId, isActive: true });
      if (!shippingConfig) {
        throw new Error('Shipping configuration not found for this supplier');
      }

      // Check if delivery is within service area
      const isInServiceArea = await this.checkServiceArea(shippingConfig, userLocation.pincode);
      if (!isInServiceArea) {
        throw new Error('Delivery not available in your area');
      }

      // Check for cached calculation (within last hour)
      const cachedCalculation = await this.getCachedCalculation(
        shopId, 
        userLocation, 
        shippingConfig.location
      );

      let distanceData;
      if (cachedCalculation) {
        distanceData = {
          distance: cachedCalculation.distance,
          duration: cachedCalculation.duration,
          durationInTraffic: cachedCalculation.durationInTraffic
        };
      } else {
        // Calculate distance using Google Maps Distance Matrix API
        distanceData = await this.calculateDistance(
          shippingConfig.location,
          userLocation
        );
      }

      // Check if distance exceeds maximum delivery distance
      const distanceInKm = distanceData.distance.value / 1000;
      if (distanceInKm > shippingConfig.maxDeliveryDistance) {
        throw new Error(`Delivery not available beyond ${shippingConfig.maxDeliveryDistance}km radius`);
      }

      // Calculate shipping cost breakdown
      const calculation = this.performShippingCalculation({
        shippingConfig,
        distanceData,
        orderValue,
        totalWeight,
        isExpress
      });

      // Save calculation for caching and audit
      const shippingCalculationRecord = new ShippingCalculation({
        orderId,
        shopId,
        userId,
        origin: shippingConfig.location,
        destination: userLocation,
        distance: distanceData.distance,
        duration: distanceData.duration,
        durationInTraffic: distanceData.durationInTraffic,
        calculation,
        orderValue,
        totalWeight,
        isExpress,
        isPeakHour: this.isPeakHour(shippingConfig.peakHours),
        isFreeShipping: calculation.finalAmount === 0,
        googleMapsResponse: distanceData.rawResponse
      });

      await shippingCalculationRecord.save();

      return {
        success: true,
        data: {
          shippingCost: calculation.finalAmount,
          estimatedDeliveryTime: distanceData.durationInTraffic || distanceData.duration,
          distance: distanceData.distance,
          breakdown: calculation,
          supplierInfo: {
            name: shippingConfig.shopId,
            location: shippingConfig.location.address
          }
        }
      };

    } catch (error) {
      console.error('Shipping calculation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate distance using Google Maps Distance Matrix API
   */
  async calculateDistance(origin, destination) {
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
   * Perform shipping cost calculation with all factors
   */
  performShippingCalculation(params) {
    const { shippingConfig, distanceData, orderValue, totalWeight, isExpress } = params;
    
    const distanceInKm = distanceData.distance.value / 1000;
    
    // Check for free shipping
    if (orderValue >= shippingConfig.freeShippingThreshold) {
      return {
        baseRate: 0,
        distanceRate: 0,
        peakHourMultiplier: 1,
        weightMultiplier: 1,
        expressMultiplier: 1,
        customAreaRate: 0,
        subtotal: 0,
        finalAmount: 0,
        freeShipping: true,
        reason: `Free shipping for orders above ₹${shippingConfig.freeShippingThreshold}`
      };
    }

    // Base calculation
    let baseRate = shippingConfig.baseRate;
    let distanceRate = distanceInKm * shippingConfig.perKmRate;
    
    // Peak hour multiplier
    let peakHourMultiplier = 1;
    if (this.isPeakHour(shippingConfig.peakHours)) {
      peakHourMultiplier = shippingConfig.peakHourMultiplier;
    }

    // Weight-based pricing
    let weightMultiplier = 1;
    if (shippingConfig.weightBasedPricing.enabled && totalWeight > shippingConfig.weightBasedPricing.baseWeight) {
      const additionalWeight = totalWeight - shippingConfig.weightBasedPricing.baseWeight;
      weightMultiplier = 1 + (additionalWeight * shippingConfig.weightBasedPricing.additionalWeightRate / 100);
    }

    // Express delivery multiplier
    let expressMultiplier = 1;
    if (isExpress && shippingConfig.expressDelivery.enabled) {
      expressMultiplier = shippingConfig.expressDelivery.multiplier;
    }

    // Calculate subtotal
    const subtotal = (baseRate + distanceRate) * peakHourMultiplier * weightMultiplier * expressMultiplier;
    
    return {
      baseRate,
      distanceRate,
      peakHourMultiplier,
      weightMultiplier,
      expressMultiplier,
      customAreaRate: 0,
      subtotal,
      finalAmount: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
      breakdown: {
        distance: `${distanceInKm.toFixed(2)} km`,
        baseCharge: `₹${baseRate}`,
        distanceCharge: `₹${distanceRate.toFixed(2)}`,
        peakHourSurcharge: peakHourMultiplier > 1 ? `${((peakHourMultiplier - 1) * 100).toFixed(0)}%` : 'None',
        weightSurcharge: weightMultiplier > 1 ? `${((weightMultiplier - 1) * 100).toFixed(0)}%` : 'None',
        expressSurcharge: expressMultiplier > 1 ? `${((expressMultiplier - 1) * 100).toFixed(0)}%` : 'None'
      }
    };
  }

  /**
   * Check if current time is peak hour
   */
  isPeakHour(peakHours) {
    if (!peakHours || peakHours.length === 0) return false;

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    return peakHours.some(peak => {
      const startTime = this.timeStringToNumber(peak.start);
      const endTime = this.timeStringToNumber(peak.end);
      
      return currentTime >= startTime && currentTime <= endTime;
    });
  }

  /**
   * Convert time string (HH:MM) to number (HHMM)
   */
  timeStringToNumber(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 100 + minutes;
  }

  /**
   * Check if pincode is in service area
   */
  async checkServiceArea(shippingConfig, pincode) {
    // If no specific service areas defined, allow all Karnataka pincodes
    if (!shippingConfig.serviceAreas || shippingConfig.serviceAreas.length === 0) {
      // Karnataka pincodes start with 5
      return pincode && pincode.startsWith('5');
    }

    // Check if pincode is in defined service areas
    return shippingConfig.serviceAreas.some(area => area.pincode === pincode);
  }

  /**
   * Get cached calculation if available and recent
   */
  async getCachedCalculation(shopId, userLocation, supplierLocation) {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      return await ShippingCalculation.findOne({
        shopId,
        'destination.latitude': userLocation.latitude,
        'destination.longitude': userLocation.longitude,
        calculatedAt: { $gte: oneHourAgo }
      }).sort({ calculatedAt: -1 });
    } catch (error) {
      console.error('Cache lookup error:', error);
      return null;
    }
  }

  /**
   * Get shipping estimates for multiple suppliers
   */
  async getMultiSupplierEstimates(params) {
    const { shopIds, userLocation, orderValue, totalWeight = 1, isExpress = false } = params;
    
    const estimates = await Promise.allSettled(
      shopIds.map(shopId => 
        this.calculateShippingCost({
          shopId,
          userLocation,
          orderValue,
          totalWeight,
          isExpress,
          orderId: `estimate_${Date.now()}_${shopId}`
        })
      )
    );

    return estimates.map((result, index) => ({
      shopId: shopIds[index],
      estimate: result.status === 'fulfilled' ? result.value : { success: false, error: result.reason }
    }));
  }
}

module.exports = DynamicShippingService;