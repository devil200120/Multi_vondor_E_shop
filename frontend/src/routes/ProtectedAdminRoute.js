import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedAdminRoute = ({ children }) => {
  const { loading, isAuthenticated, user } = useSelector((state) => state.user);
  
  if (loading === false) {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    } else if (!["Admin", "SubAdmin", "Manager"].includes(user.role)) {
      return <Navigate to="/" replace />;
    }
    return children;
  }
};

export default ProtectedAdminRoute;
