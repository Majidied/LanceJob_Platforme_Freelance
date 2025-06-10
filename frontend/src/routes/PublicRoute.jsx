import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasAccessToken } from '../utils/tokenStorage';
import useUser from '../hooks/useUser';

const PublicRoute = ({ children, redirectIfAuthenticated = false }) => {
  const { user, isLoading } = useUser();
  const hasToken = hasAccessToken();

  // Don't redirect while loading
  if (isLoading && hasToken) {
    return <div>Loading...</div>;
  }

  // Redirect authenticated users away from auth pages
  if (redirectIfAuthenticated && hasToken) {
    const redirectTo = user?.role === 'freelancer' ? '/freelancer/home' : '/user/home';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default PublicRoute;
