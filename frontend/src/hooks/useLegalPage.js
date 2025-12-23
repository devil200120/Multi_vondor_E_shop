import { useState, useEffect } from 'react';
import axios from 'axios';
import { server } from '../server';

export const useLegalPage = (pageType) => {
  const [legalPage, setLegalPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pageType) {
      setLoading(false);
      return;
    }

    const fetchLegalPage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
          `${server}/legal-page/get-page/${pageType}`
        );
        
        if (response.data.success) {
          setLegalPage(response.data.page);
        } else {
          setError('Page not found');
        }
      } catch (err) {
        console.error(`Error fetching legal page ${pageType}:`, err);
        setError(err.response?.data?.message || 'Failed to load page content');
      } finally {
        setLoading(false);
      }
    };

    fetchLegalPage();
  }, [pageType]);

  return { legalPage, loading, error };
};

export const useLegalPages = () => {
  const [legalPages, setLegalPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLegalPages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
          `${server}/legal-page/get-all-pages`
        );
        
        if (response.data.success) {
          setLegalPages(response.data.pages);
        } else {
          setError('Failed to load pages');
        }
      } catch (err) {
        console.error('Error fetching legal pages:', err);
        setError(err.response?.data?.message || 'Failed to load pages');
      } finally {
        setLoading(false);
      }
    };

    fetchLegalPages();
  }, []);

  return { legalPages, loading, error };
};