import { useState, useCallback } from 'react';
import axios from 'axios';
import { server } from '../server';
import { toast } from 'react-toastify';

const useFAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch public FAQs
  const fetchFAQs = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (params.category && params.category !== 'all') {
        queryParams.append('category', params.category);
      }
      if (params.search) {
        queryParams.append('search', params.search);
      }

      const response = await axios.get(
        `${server}/faq/get-faqs?${queryParams.toString()}`
      );

      if (response.data.success) {
        setFaqs(response.data.faqs);
        return {
          faqs: response.data.faqs,
          faqsByCategory: response.data.faqsByCategory,
          totalFAQs: response.data.totalFAQs
        };
      } else {
        throw new Error('Failed to fetch FAQs');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch FAQs';
      setError(errorMessage);
      console.error('Error fetching FAQs:', err);
      return { faqs: [], faqsByCategory: {}, totalFAQs: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get FAQ categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${server}/faq/get-categories`);
      
      if (response.data.success) {
        return response.data.categories;
      } else {
        throw new Error('Failed to fetch categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      return [];
    }
  }, []);

  // Increment view count
  const incrementView = useCallback(async (faqId) => {
    try {
      await axios.post(`${server}/faq/increment-view/${faqId}`);
    } catch (err) {
      console.error('Error incrementing view:', err);
    }
  }, []);

  // Mark as helpful
  const markHelpful = useCallback(async (faqId) => {
    try {
      const response = await axios.post(`${server}/faq/mark-helpful/${faqId}`);
      
      if (response.data.success) {
        // Update local state with new counts and user vote status
        setFaqs(prev => prev.map(faq => 
          faq._id === faqId 
            ? { 
                ...faq, 
                helpful: response.data.helpfulCount,
                notHelpful: response.data.notHelpfulCount,
                userVote: response.data.userVote
              }
            : faq
        ));
        return response.data.helpfulCount;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to mark as helpful';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Mark as not helpful
  const markNotHelpful = useCallback(async (faqId) => {
    try {
      const response = await axios.post(`${server}/faq/mark-not-helpful/${faqId}`);
      
      if (response.data.success) {
        // Update local state with new counts and user vote status
        setFaqs(prev => prev.map(faq => 
          faq._id === faqId 
            ? { 
                ...faq, 
                helpful: response.data.helpfulCount,
                notHelpful: response.data.notHelpfulCount,
                userVote: response.data.userVote
              }
            : faq
        ));
        return response.data.notHelpfulCount;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to mark as not helpful';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  return {
    faqs,
    loading,
    error,
    fetchFAQs,
    fetchCategories,
    incrementView,
    markHelpful,
    markNotHelpful
  };
};

export default useFAQ;