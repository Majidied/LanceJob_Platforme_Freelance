import React from "react";
import Profile from "../../views/freelancer/profile";
import EditOfferPage from "../../views/freelancer/propose";

const routes = [
  {
    name: "Propose",
    layout: "/freelancer",
    path: "propose/:jobId", // Route avec paramètre
    component: <EditOfferPage/>,
  },
      {
          name: "Profile",
          layout: "/freelancer",
          path: "profile",
          component: <Profile />,
        },
];
export default routes;
