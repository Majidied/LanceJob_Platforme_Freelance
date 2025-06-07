import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { hasAccessToken } from '../utils/tokenStorage';
import useUser from '../hooks/useUser';

const ProtectedRoute = () => {
  const { isVerified } = useUser();
  const location = useLocation();

  // 2) If no token, send to login
  if (!hasAccessToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3) If token exists but email not verified, redirect once
  if (!isVerified && location.pathname !== '/verify-email') {
    return <Navigate to="/verify-email" replace />;
  }
  
  if (isVerified && location.pathname === '/verify-email') {
    return <Navigate to="/user" replace />;
  }

  // 4) Otherwise, render child routes
  return <Outlet />;
};

export default ProtectedRoute;