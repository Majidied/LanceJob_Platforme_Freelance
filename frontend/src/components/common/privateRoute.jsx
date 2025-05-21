// src/components/common/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children, userType = null }) => {
  const { user, loading } = useAuth();
  
  // If auth is still loading, show loading indicator
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If userType is specified, check if user matches that type
  if (userType && user.__t !== userType) {
    // Redirect based on user type
    if (user.__t === 'client') {
      return <Navigate to="/client" replace />;
    } else if (user.__t === 'freelancer') {
      return <Navigate to="/freelancer" replace />;
    } else if (user.__t === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }
  
  // Everything checks out, render the children
  return children;
};

export default PrivateRoute;