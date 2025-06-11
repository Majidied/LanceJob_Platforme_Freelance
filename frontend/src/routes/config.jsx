import React, { lazy } from 'react';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

const Landing = lazy(() => import('../pages/landing'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const VerifyEmailPage = lazy(() => import('../pages/VerifyEmailPage'));
const ProfileSetup = lazy(() => import('../pages/Profile.page'));
const UserLayout = lazy(() => import('../pages/user/index'));
const FreelancerLayout = lazy(() => import('../pages/freelancer/index'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));
const UnauthorizedPage = lazy(() => import('../pages/Unauthorized'));
const SearchPage = lazy(() => import('../pages/search'));

export const routesConfig = [
  { 
    path: '/', 
    element: <PublicRoute><Landing /></PublicRoute>, 
    public: true 
  },
  { 
    path: '/search', 
    element: <PublicRoute><SearchPage /></PublicRoute>, 
    public: true 
  },
  { 
    path: '/service', 
    element: <PublicRoute><div>Service Page</div></PublicRoute>, 
    public: true 
  },
  { 
    path: '/about-us', 
    element: <PublicRoute><div>About Us</div></PublicRoute>, 
    public: true 
  },
  { 
    path: '/login', 
    element: <PublicRoute><LoginPage /></PublicRoute>, 
    public: true, 
    redirectIfAuthenticated: true 
  },
  { 
    path: '/register', 
    element: <PublicRoute><RegisterPage /></PublicRoute>, 
    public: true, 
    redirectIfAuthenticated: true 
  },
  {
    path: '/complete-profile',
    element: <ProtectedRoute allowUnverified={true}><ProfileSetup /></ProtectedRoute>,
  },
  {
    path: '/verify-email',
    element: <PublicRoute><VerifyEmailPage /></PublicRoute>,
    public: true,
  },
  {
    path: '/user/*',
    element: <ProtectedRoute requiredRole="client"><UserLayout /></ProtectedRoute>,
  },
  {
    path: '/freelancer/*',
    element: <ProtectedRoute requiredRole="freelancer"><FreelancerLayout /></ProtectedRoute>,
  },
  { 
    path: '/unauthorized', 
    element: <PublicRoute><UnauthorizedPage /></PublicRoute>, 
    public: true 
  },
  { 
    path: '*', 
    element: <PublicRoute><NotFoundPage /></PublicRoute>, 
    public: true 
  },
];