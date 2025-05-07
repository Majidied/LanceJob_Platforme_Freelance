import React from "react";
import Profile from "../views/freelancer/profile";
import EditOfferPage from "../views/freelancer/propose";

const routes = [
    {
        name: "Edit Offer",
        layout: "/freelancer",
        path: "home/edit-offer/:jobId",
        component: <EditOfferPage />,
      },
      {
          name: "Profile",
          layout: "/freelancer",
          path: "profile",
          component: <Profile />,
        },
];
export default routes;
