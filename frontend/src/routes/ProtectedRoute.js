import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { isLoading, isAuthenticated } = useAuth();
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // If not loading and not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
