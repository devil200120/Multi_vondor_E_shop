import { useState } from 'react';
import axios from 'axios';
import { server } from '../server';

export const useShippingService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Calculate shipping cost for checkout
   */
  const calculateShippingCost = async (params) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${server}/shipping/calculate`, params);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        throw new Error('Failed to calculate shipping cost');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to calculate shipping';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get shipping estimates for multiple suppliers
   */
  const getMultiSupplierEstimates = async (params) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${server}/shipping/estimates`, params);
      
      if (response.data.success) {
        return {
          success: true,
          estimates: response.data.estimates
        };
      } else {
        throw new Error('Failed to get shipping estimates');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get estimates';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get delivery time estimate
   */
  const getDeliveryTimeEstimate = async (shopId, userLocation) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${server}/shipping/estimate-time`, {
        shopId,
        userLocation
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        throw new Error('Failed to get delivery estimate');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get delivery estimate';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate shipping for cart items grouped by supplier
   */
  const calculateCartShipping = async (cart, userLocation, userId) => {
    try {
      setLoading(true);
      setError(null);

      // Group cart items by shop
      const shopGroups = cart.reduce((acc, item) => {
        const shopId = item.shopId;
        if (!acc[shopId]) {
          acc[shopId] = {
            items: [],
            totalValue: 0,
            totalWeight: 0
          };
        }
        acc[shopId].items.push(item);
        acc[shopId].totalValue += item.qty * item.discountPrice;
        acc[shopId].totalWeight += item.qty * (item.weight || 1);
        return acc;
      }, {});

      // Calculate shipping for each shop
      const shippingPromises = Object.entries(shopGroups).map(async ([shopId, group]) => {
        const result = await calculateShippingCost({
          shopId,
          userId,
          userLocation,
          orderValue: group.totalValue,
          totalWeight: group.totalWeight,
          orderId: `cart_${Date.now()}_${shopId}`
        });

        return {
          shopId,
          ...result,
          orderValue: group.totalValue,
          items: group.items
        };
      });

      const shippingResults = await Promise.all(shippingPromises);

      // Calculate totals
      const totalShipping = shippingResults.reduce((sum, result) => {
        return sum + (result.success ? result.data.shippingCost : 0);
      }, 0);

      return {
        success: true,
        shopShipping: shippingResults,
        totalShipping,
        hasErrors: shippingResults.some(result => !result.success)
      };
    } catch (err) {
      const errorMessage = err.message || 'Failed to calculate cart shipping';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get shipping configuration for a shop
   */
  const getShippingConfig = async (shopId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${server}/shipping/config/${shopId}`);
      
      if (response.data.success) {
        return {
          success: true,
          config: response.data.config
        };
      } else {
        throw new Error('Shipping configuration not found');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get shipping config';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    calculateShippingCost,
    getMultiSupplierEstimates,
    getDeliveryTimeEstimate,
    calculateCartShipping,
    getShippingConfig
  };
};

export default useShippingService;