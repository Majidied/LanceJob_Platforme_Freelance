//components/sidebar/freelancer/routesfr.jsx - Version alternative (optionnelle)
import React from "react";
import Home from "../../../views/freelancer/home";
import SavedJobs from "../../../views/freelancer/savedJobs";
import Offers from "../../../views/freelancer/savedJobs/offers";
import Messages from "../../../views/freelancer/messages";
import ProposePage from "../../../views/freelancer/propose";
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
    layout: "/freelancer",
    path: "home",
    icon: <MdHome className="w-6 h-6" />,
    component: <Home />, // Gardez comme avant, le Provider est maintenant au niveau supérieur
  },
  {
    name: "Saved Jobs",
    layout: "/freelancer",
    path: "savedJob",
    icon: <MdFavoriteBorder className="w-6 h-6" />,
    component: <SavedJobs />,
    secondary: true,
  },
  {
    name: "Offers",
    layout: "/freelancer",
    path: "offers",
    icon: <MdOutlineWorkHistory className="w-6 h-6" />,
    component: <Offers />,
    secondary: true,
  },
  {
    name: "Messages",
    layout: "/freelancer",
    path: "messages",
    icon: <BiMessageRoundedDetail className="w-6 h-6" />,
    component: <Messages />,
    secondary: true,
  },


];

export default routes;