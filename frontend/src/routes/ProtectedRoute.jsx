import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasAccessToken } from '../utils/tokenStorage';
import useUser from '../hooks/useUser';

const ProtectedRoute = ({ children, requiredRole, allowUnverified = false }) => {
  const location = useLocation();
  const { isVerified, user, isLoading } = useUser();

  // Show loading while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Check if user has access token
  if (!hasAccessToken()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow unverified users for certain routes (like profile setup)
  if (!allowUnverified && !isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // Check role requirements
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
