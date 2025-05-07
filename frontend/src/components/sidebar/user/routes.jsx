import React from "react";


import Home from "../../../views/user/home";
import SavedJobs from "../../../views/user/savedJobs";
import Proposals from "../../../views/user/proposals";
import Messages from "../../../views/user/messages";

// Icon Imports
import {
  MdHome,
  MdFavoriteBorder,
  MdOutlineWorkHistory,
} from "react-icons/md";
import { BiMessageRoundedDetail } from "react-icons/bi";

const routes = [
  {
    name: "Home",
    layout: "/user",
    path: "home",
    icon: <MdHome className="w-6 h-6" />,
    component: <Home />,
  },
  {
    name: "Saved Jobs",
    layout: "/user",
    path: "savedJob",
    icon: <MdFavoriteBorder className="w-6 h-6" />,
    component: <SavedJobs />,
    secondary: true,
  },
  {
    name: "Proposals",
    layout: "/user",
    path: "proposals",
    icon: <MdOutlineWorkHistory  className="w-6 h-6" />,
    component: <Proposals />,
    secondary: true,
  },
  {
    name: "Messages",
    layout: "/user",
    path: "messages",
    icon: <BiMessageRoundedDetail  className="w-6 h-6" />,
    component: <Messages />,
    secondary: true,
  },
  
];
export default routes;
