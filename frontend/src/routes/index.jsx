import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import Landing from '../pages/landing';
import ProfileSetup from '../pages/Profile.page';

import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import Userayout from "../pages/user";
import FreelancerLayout from "../pages/freelancer";

// Changez ces imports pour pointer vers les bons dossiers
//import JobsList from '../components/jobs/JobsList';  // Notez le changement de './' à '../'
import JobDetail from '../components/jobs/JobDetail'; // Notez le changement de './' à '../'
//import SavedJobs from '../components/jobs/SavedJobs'; // Notez le changement de './' à '../'
import Applications from '../components/applications/Applications'; // Notez le changement de './' à '../'
//import Offers from '../components/offers/Offers';
// Premier groupe d'imports (depuis views)
import JobsList from '../views/freelancer/home';
import SavedJobs from '../views/freelancer/savedJobs';
import Offers from '../views/freelancer/offers';
import Profile from '../views/freelancer/profile';

const Routes = () => {
  // Simulate token retrieval from local storage
  const token = false;

  // Define public routes accessible to all users
  const routesForPublic = [
    {
      path: '/',
      element: <Navigate to="/landing" />,
    },
    {
      path: '/landing',
      element: <Landing />,
    },
    {
      path: '/service',
      element: <div>Service Page</div>,
    },
    {
      path: '/about-us',
      element: <div>About Us</div>,
    },
    {
      path: '/complete-profile',
      element: <ProfileSetup />,
    },
    {
      path: "/user/*",
      element: <Userayout />,
    },
    {
      path: "/freelancer/*",
      element: <FreelancerLayout />,
      children: [
        { path: "", element: <Navigate to="jobs" /> }, // Redirection par défaut
        { path: "jobs", element: <JobsList /> },
        { path: "jobs/:id", element: <JobDetail /> },
        { path: "saved-jobs", element: <SavedJobs /> },
        { path: "applications", element: <Applications /> },
        { path: "offers", element: <Offers /> },
        { path: "profile", element: <Profile /> }
      ]
    
    },
  ];

  // Define routes accessible only to non-authenticated users
  const routesForNotAuthenticatedOnly = [
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/register',
      element: <RegisterPage />,
    },
  ];

  // Define the 404 Not Found route
  const notFoundRoute = [
    {
      path: '*',
      element: <div>404 Not Found</div>,
    },
  ];

  // Combine and conditionally include routes based on authentication status
  const router = createBrowserRouter([
    ...routesForPublic,
    ...(!token ? routesForNotAuthenticatedOnly : [
      ...['/login', '/register'].map(path => ({
        path,
        element: <Navigate to="/" />,
      })),
    ]),
    ...notFoundRoute, // Include the 404 route last
  ]);

  // Provide the router configuration using RouterProvider
  return <RouterProvider router={router} />;
};

export default Routes;