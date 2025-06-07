// src/router/Routes.jsx
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';

import Landing from '../pages/landing';
import ProfileSetup from '../pages/Profile.page';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import UserLayout from '../pages/user/index';
import FreelancerLayout from '../pages/freelancer/index';
import { hasAccessToken, getUserData } from '../utils/tokenStorage';
import ProtectedRoute from './ProtectedRoute';

const Routes = () => {
  const tokenExists = hasAccessToken();
  const userData = getUserData();
  const isFreelancer = userData?.isFreelancer || false;

  // 1) Public routes (always available)
  const routesForPublic = [
    { path: '/', element: <Landing /> },
    { path: '/service', element: <div>Service Page</div> },
    { path: '/about-us', element: <div>About Us</div> },
  ];

  // 2) If there's no token, only allow /login and /register:
  const routesForNotAuthenticated = [
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
  ];

  // 3) If there _is_ a token, redirect /login or /register → home
  const loginRegisterRedirects = ['/login', '/register'].map((path) => ({
    path,
    element: <Navigate to={isFreelancer ? '/freelancer/home' : '/user/home'} replace />,
  }));

  // 4) The nested children under / (wrapped by ProtectedRoute)
  const authenticatedChildren = [
    {
      path: 'complete-profile',
      element: <ProfileSetup />,
    },
    {
      path: 'verify-email',
      element: <VerifyEmailPage />,
    },
    ...(!isFreelancer
      ? [{ path: 'user/*', element: <UserLayout /> }]
      : [{ path: 'user/*', element: <Navigate to="/freelancer" replace /> }]),
    ...(isFreelancer
      ? [{ path: 'freelancer/*', element: <FreelancerLayout /> }]
      : [{ path: 'freelancer/*', element: <Navigate to="/user" replace /> }]),
  ];

  // 5) Wrap those children under a single ProtectedRoute at path "/"
  const routesForAuthenticatedOnly = [
    {
      path: '/',
      element: <ProtectedRoute />,
      children: authenticatedChildren,
    },
  ];

  // 6) A catch-all 404
  const notFoundRoute = [{ path: '*', element: <div>404 Not Found</div> }];

  // Finally, assemble the router array:
  const router = createBrowserRouter([
    // 1) Always include public routes
    ...routesForPublic,

    // 2) If no token → show /login & /register routes
    //    else → redirect /login & /register → user/freelancer home
    ...(tokenExists ? loginRegisterRedirects : routesForNotAuthenticated),

    // 3) Always append the protected routes (React Router will still
    //    only “activate” them if you navigate to "/" or children)
    ...routesForAuthenticatedOnly,

    // 4) 404
    ...notFoundRoute,
  ]);

  return <RouterProvider router={router} />;
};

export default Routes;
