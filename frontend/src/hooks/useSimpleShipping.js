import { useState } from 'react';
import axios from 'axios';
import { server } from '../server';

export const useSimpleShipping = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Get simple shipping configuration for a shop
   */
  const getShopShippingConfig = async (shopId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${server}/shipping/simple-config/${shopId}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.config
        };
      } else {
        throw new Error('Failed to get shipping configuration');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get shipping configuration';
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
   * Calculate shipping for cart items grouped by shop
   */
  const calculateCartShipping = async (cartItems) => {
    try {
      setLoading(true);
      setError(null);

      // Group cart items by shop
      const shopGroups = cartItems.reduce((groups, item) => {
        const shopId = item.shopId;
        if (!groups[shopId]) {
          groups[shopId] = {
            shop: item.shop,
            items: [],
            totalValue: 0
          };
        }
        groups[shopId].items.push(item);
        groups[shopId].totalValue += item.discountPrice * item.qty;
        return groups;
      }, {});

      let totalShipping = 0;
      const shippingBreakdown = [];

      // Calculate shipping for each shop
      for (const [shopId, group] of Object.entries(shopGroups)) {
        try {
          const shippingResult = await getShopShippingConfig(shopId);
          
          if (shippingResult.success && shippingResult.data) {
            const config = shippingResult.data;
            let shopShipping = 0;

            // Check if order qualifies for free shipping
            if (config.freeShippingThreshold && group.totalValue >= config.freeShippingThreshold) {
              shopShipping = 0;
            } else {
              shopShipping = config.deliveryPrice || 0;
            }

            totalShipping += shopShipping;
            shippingBreakdown.push({
              shopId: shopId,
              shopName: group.shop?.name || 'Unknown Shop',
              orderValue: group.totalValue,
              shippingCost: shopShipping,
              freeShipping: shopShipping === 0 && config.freeShippingThreshold && group.totalValue >= config.freeShippingThreshold,
              items: group.items
            });
          } else {
            // Fallback to default shipping if no config found
            const defaultShipping = group.totalValue * 0.1; // 10% fallback
            totalShipping += defaultShipping;
            shippingBreakdown.push({
              shopId: shopId,
              shopName: group.shop?.name || 'Unknown Shop',
              orderValue: group.totalValue,
              shippingCost: defaultShipping,
              freeShipping: false,
              items: group.items,
              fallback: true
            });
          }
        } catch (err) {
          console.error(`Error calculating shipping for shop ${shopId}:`, err);
          // Fallback to default shipping
          const defaultShipping = group.totalValue * 0.1;
          totalShipping += defaultShipping;
          shippingBreakdown.push({
            shopId: shopId,
            shopName: group.shop?.name || 'Unknown Shop',
            orderValue: group.totalValue,
            shippingCost: defaultShipping,
            freeShipping: false,
            items: group.items,
            fallback: true,
            error: true
          });
        }
      }

      return {
        success: true,
        totalShipping,
        breakdown: shippingBreakdown
      };

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to calculate shipping';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        totalShipping: 0,
        breakdown: []
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getShopShippingConfig,
    calculateCartShipping
  };
};

export default useSimpleShipping;