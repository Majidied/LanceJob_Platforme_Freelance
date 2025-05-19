import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { hasAccessToken } from '../utils/tokenStorage';

export const ProtectedRoute = () => {
  if (!hasAccessToken()) {
    // If not authenticated, redirect to the login page
    return <Navigate to="/login" />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};
