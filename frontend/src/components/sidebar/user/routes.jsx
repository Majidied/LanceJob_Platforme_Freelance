import React from "react";


import Home from "../../../views/user/home";
import SavedJobs from "../../../views/user/myOffers";
import AddOffer from "../../../views/user/addOffre";
import Messages from "../../../views/user/messages";

// Icon Imports
import {
  MdHome,
  MdFavoriteBorder,
  MdOutlineWorkHistory,
  
} from "react-icons/md";
import { BiMessageRoundedDetail } from "react-icons/bi";
import { Plus } from 'lucide-react'
const routes = [
  {
    name: "Home",
    layout: "/user",
    path: "home",
    icon: <MdHome className="w-6 h-6" />,
    component: <Home />,
  },
  {
    name: "My Offers",
    layout: "/user",
    path: "MyOffers",
    icon: <MdOutlineWorkHistory className="w-6 h-6" />,
    component: <SavedJobs />,
    secondary: true,
  },
  {
    name: "Add Offre",
    layout: "/user",
    path: "add-offre",
    icon: <Plus  className="w-6 h-6" />,
    component: <AddOffer />,
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
