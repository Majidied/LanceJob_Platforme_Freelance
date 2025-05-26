import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import Landing from '../pages/landing';
import ProfileSetup from '../pages/Profile.page';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import Userayout from "../pages/user";
import FreelancerLayout from "../pages/freelancer";
import { hasAccessToken, getUserData } from '../utils/tokenStorage';
import { ProtectedRoute } from './ProtectedRoute';

const Routes = () => {
  const userData = getUserData();
  const isFreelancer = userData?.isFreelancer || false;

  const routesForPublic = [
    { path: '/', element: <Landing /> },
    { path: '/service', element: <div>Service Page</div> },
    { path: '/about-us', element: <div>About Us</div> }
  ];

  const authenticatedChildren = [
    {
      path: 'complete-profile',
      element: <ProfileSetup />,
    },
    ...(!isFreelancer
      ? [{ path: "user/*", element: <Userayout /> }]
      : [{ path: "user/*", element: <Navigate to="/freelancer" /> }]),
    ...(isFreelancer
      ? [{ path: "freelancer/*", element: <FreelancerLayout /> }]
      : [{ path: "freelancer/*", element: <Navigate to="/user" /> }]),
  ];

  const routesForAuthenticatedOnly = [
    {
      path: '/',
      element: <ProtectedRoute />,
      children: authenticatedChildren,
    },
  ];

  const routesForNotAuthenticatedOnly = [
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
  ];

  const notFoundRoute = [
    { path: '*', element: <div>404 Not Found</div> },
  ];

  const router = createBrowserRouter([
    ...routesForPublic,
    ...(!hasAccessToken()
      ? routesForNotAuthenticatedOnly
      : ['/login', '/register'].map(path => ({
          path,
          element: <Navigate to="/" />,
        }))
    ),
    ...routesForAuthenticatedOnly,
    ...notFoundRoute,
  ]);

  return <RouterProvider router={router} />;
};

export default Routes;