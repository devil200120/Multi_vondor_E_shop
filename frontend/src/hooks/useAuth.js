import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const useAuth = () => {
  const { loading, isAuthenticated, user } = useSelector((state) => state.user);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Once we get the first response (loading becomes false), 
    // we know the authentication check is complete
    if (!loading) {
      setIsInitialLoading(false);
    }
  }, [loading]);

  return {
    isLoading: isInitialLoading || loading,
    isAuthenticated,
    user,
  };
};

export default useAuth;