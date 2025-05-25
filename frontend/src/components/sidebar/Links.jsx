/* eslint-disable */
import React from "react";
import { Link, useLocation } from "react-router-dom";
import DashIcon from "../icons/DashIcon";
// chakra imports

export function SidebarLinks(props) {
  // Chakra color mode
  let location = useLocation();

  const { routes } = props;

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return location.pathname.includes(routeName);
  };

  const createLinks = (routes) => {
    return routes.map((route, index) => {
      if (
        route.layout === "/user"
      ) {
        return (
          <Link key={index} to={route.layout + "/" + route.path}>
            <div className={`relative flex hover:cursor-pointer ${activeRoute(route.path) ? "bg-[#417b9a]" : ""} rounded-full mb-1 m-3`}>
            <li
              className="flex items-center w-full px-4 py-3 my-1 text-white cursor-pointer"
              key={index}
            >
              <span className="text-white">
                {route.icon ? route.icon : <DashIcon />}
              </span>
              <p className={`ml-3 flex ${activeRoute(route.path) ? "font-medium" : ""}`}>
                {route.name}
              </p>
              {route.badge && (
                <div className="ml-auto bg-[#55A5CF] w-5 h-5 rounded-full flex items-center justify-center text-xs">
                  {route.badge}
                </div>
              )}
            </li>
          </div>
          </Link>
        );
      }
      else if(route.layout === "/freelancer"){
        return (
          <Link key={index} to={route.layout + "/" + route.path}>
            <div className={`relative flex hover:cursor-pointer ${activeRoute(route.path) ? "bg-[#417b9a]" : ""} rounded-full mb-1 m-3`}>
            <li
              className="flex items-center w-full px-4 py-3 my-1 text-white cursor-pointer"
              key={index}
            >
              <span className="text-white">
                {route.icon ? route.icon : <DashIcon />}
              </span>
              <p className={`ml-3 flex ${activeRoute(route.path) ? "font-medium" : ""}`}>
                {route.name}
              </p>
              {route.badge && (
                <div className="ml-auto bg-[#55A5CF] w-5 h-5 rounded-full flex items-center justify-center text-xs">
                  {route.badge}
                </div>
              )}
            </li>
          </div>
          </Link>
        );
      }
    });
  };
  // BRAND
  return createLinks(routes);
}

export default SidebarLinks;
