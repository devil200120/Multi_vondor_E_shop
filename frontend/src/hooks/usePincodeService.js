import { useState, useCallback } from 'react';
import axios from 'axios';
import { server } from '../server';
import { toast } from 'react-toastify';

export const usePincodeService = () => {
  const [loading, setLoading] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [error, setError] = useState(null);

  const validatePincode = useCallback(async (pincode) => {
    if (!pincode || pincode.length !== 6) {
      setError('Please provide a valid 6-digit pincode');
      return { isValid: false, data: null };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${server}/pincode/check/${pincode}`);
      
      if (response.data.success && response.data.deliveryAvailable) {
        setDeliveryInfo(response.data.data);
        return { 
          isValid: true, 
          data: response.data.data,
          message: response.data.message 
        };
      } else {
        setError(response.data.message);
        setDeliveryInfo(null);
        return { 
          isValid: false, 
          data: null,
          message: response.data.message 
        };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error checking pincode delivery';
      setError(errorMessage);
      setDeliveryInfo(null);
      return { 
        isValid: false, 
        data: null, 
        message: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateShipping = useCallback(async (pincode, cartValue = 0, expressDelivery = false) => {
    if (!pincode || pincode.length !== 6) {
      throw new Error('Please provide a valid 6-digit pincode');
    }

    setLoading(true);
    try {
      const response = await axios.post(`${server}/pincode/calculate-shipping`, {
        pincode,
        cartValue,
        expressDelivery,
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Unable to calculate shipping');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchLocations = useCallback(async (query) => {
    if (!query || query.length < 3) {
      return [];
    }

    try {
      const response = await axios.get(`${server}/pincode/search`, {
        params: { query },
      });

      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error searching locations:', error);
      return [];
    }
  }, []);

  const getPlaceDetails = useCallback(async (placeId) => {
    try {
      const response = await axios.get(`${server}/pincode/place/${placeId}`);
      
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Unable to get place details');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const clearDeliveryInfo = useCallback(() => {
    setDeliveryInfo(null);
    setError(null);
  }, []);

  return {
    loading,
    deliveryInfo,
    error,
    validatePincode,
    calculateShipping,
    searchLocations,
    getPlaceDetails,
    clearDeliveryInfo,
  };
};

export default usePincodeService;