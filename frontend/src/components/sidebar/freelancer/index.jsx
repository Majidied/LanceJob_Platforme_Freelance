/* eslint-disable */

import { HiX } from "react-icons/hi";
import Links from "../Links";
import logo from "../../../assets/img/sideBar/logo_white.png";
import routesfr from "./routesfr";

const Sidebar = ({ open, onClose }) => {
  return (
    <div
      className={`sm:none duration-175 linear fixed !z-50 flex min-h-full flex-col bg-[#2E424C] pb-10 shadow-2xl shadow-white/5 transition-all dark:!bg-navy-800 text-white md:!z-50 lg:!z-50 xl:!z-0 w-74 ${
        open ? "translate-x-0" : "-translate-x-96"
      }`}
    >
      <span
        className="absolute block cursor-pointer top-4 right-4 xl:hidden"
        onClick={onClose}
      >
        <HiX />
      </span>

      <div className="px-4 -mt-14 -mb-30">
        <div className="flex items-center justify-center">
          <img
            className="h-auto max-w-full w-46 md:w-48 lg:w-46 xl:w-48 " 
            src={logo}
            alt="LANCEJOB Logo"
          />
        </div>
      </div>
      <div class="mt-[58px] mb-7 h-px bg-gray-300 dark:bg-white/30" />
      {/* Nav item */}

      <ul className="pt-1 mb-auto">
        <Links routes={routesfr} />
      </ul>

      {/* Nav item end */}
    </div>
  );
};

export default Sidebar;
