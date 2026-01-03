import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-bg-start to-bg-end flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-neutral-600 font-medium">Loading...</p>
    </div>
  </div>
);

// Protected route - requires authentication
export const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Redirect to signin page, but save the attempted location
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
};

// Public route - accessible only when NOT authenticated
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    // Redirect based on user role
    
    // Admin users (including admin@gmail.com) go to admin dashboard
    if (isAdmin || user?.email === 'admin@gmail.com') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    // HR users go to HR dashboard
    if (user?.role === 'hr') {
      return <Navigate to="/dashboard" replace />;
    }
    
    // Employee users go to employee dashboard
    if (user?.role === 'employee') {
      return <Navigate to="/employee/dashboard" replace />;
    }
    
    // Default fallback
    return <Navigate to="/employee/dashboard" replace />;
  }

  return children;
};

// HR only route
export const HRRoute = ({ children }) => {
  const { isAuthenticated, loading, isHR } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (!isHR) {
    return <Navigate to="/coming-soon" replace />;
  }

  return children;
};

// Employee only route
export const EmployeeRoute = ({ children }) => {
  const { isAuthenticated, loading, isEmployee } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (!isEmployee) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Admin only route
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, isAdmin, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check if user is admin (email: admin@gmail.com or role: admin)
  const isAdminUser = isAdmin || user?.email === 'admin@gmail.com';
  
  if (!isAdminUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
