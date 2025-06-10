import React from "react";
import Profile from "../../views/user/profile";

const routes = [
      {
          name: "Profile",
          layout: "/user",
          path: "profile",
          component: <Profile />,
        },
];
export default routes;
