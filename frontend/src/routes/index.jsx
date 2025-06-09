import React, { Suspense, useMemo } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { routesConfig } from './config';
import useUser from '../hooks/useUser';
import { hasAccessToken } from '../utils/tokenStorage';
import LoadingSpinner from '../pages/LoadingSpiner';

const Routes = () => {
  const { user, isLoading } = useUser();
  const hasToken = hasAccessToken();

  console.log('User:', user, 'Loading:', isLoading, 'Has Token:', hasToken);

  // Memoize router creation to prevent recreation on every render
  const router = useMemo(() => {
    const mappedRoutes = routesConfig.map(({ path, element, redirectIfAuthenticated }) => {
      // Handle redirect for authenticated users on auth pages
      if (redirectIfAuthenticated && hasToken) {
        const redirectTo = user?.role === 'freelancer' ? '/freelancer/home' : '/user/home';
        return { 
          path, 
          element: <Navigate to={redirectTo} replace />,
          errorElement: <div>Something went wrong</div>
        };
      }
      
      return { 
        path, 
        element,
        errorElement: <div>Something went wrong</div>
      };
    });

    return createBrowserRouter(mappedRoutes);
  }, [hasToken, user?.role]);

  // Show loading while user data is being fetched
  if (isLoading) {
    return <LoadingSpinner/>;
  }

  return (
    <Suspense fallback={<LoadingSpinner/>}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default Routes;