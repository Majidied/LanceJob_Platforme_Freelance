import React, { useEffect, useState } from "react";
import Dropdown from "../../components/dropdown";
import { FiAlignJustify } from "react-icons/fi";
import { BsArrowBarUp } from "react-icons/bs";
import { FiSearch } from "react-icons/fi";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import { useLocation } from "react-router-dom";
import {
  IoMdNotificationsOutline,
} from "react-icons/io";

import avatar from "../../assets/img/profile/banner.png";
import { IoMdArrowDropdown } from "react-icons/io";
import { MdArrowDropUp } from "react-icons/md";
const Navbar = (props) => {
  const { onOpenSidenav, brandText } = props;
  const [darkmode, setDarkmode] = React.useState(false);
  const [selected, setSelected] = useState('');
  const [isOpen, setIsOpen] = useState(false);
useEffect(() => {
  const savedDarkMode = localStorage.getItem('darkMode') === 'true';
  if (savedDarkMode) {
    document.documentElement.classList.add('dark');
    setDarkmode(true);
  }
}, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (value) => {
    setSelected(value);
    setIsOpen(false); 
  };
  const location = useLocation();
  const isFreelancer = location.pathname.includes("/freelancer");
  const homeLink = isFreelancer ? "/freelancer/profile" : "/user/profile";
  return (
    
    <nav className="sticky top-4 z-40 flex flex-row flex-wrap items-center justify-between rounded-xl bg-white/10 p-2 backdrop-blur-xl dark:bg-[#0b14374d] ">
      
      <div className="relative w-full mt-[3px] flex h-[61px] flex-grow items-center justify-around gap-2 rounded-full bg-white px-2 py-2 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none  md:flex-grow-0 md:gap-1  xl:gap-2 border border-[#4242422c]">
        <div className="absolute flex items-center w-1/2 h-12 rounded-full inset-x-3 bg-[#90b3b421] text-navy-700 dark:bg-navy-900 dark:text-white">
          <p className="pl-3 pr-2 text-xl">
            <FiSearch className="w-4 text-gray-400 h-44 dark:text-white" />
          </p>
          <input
            type="text"
            placeholder="Search..."
            className="block h-full w-full rounded-full bg-lightPrimary text-sm font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900  dark:placeholder:!text-white sm:w-fit"
          />
          <div className="absolute right-0">
            <div
              onClick={toggleDropdown}
              className="flex items-center h-12 pr-3 text-base text-right rounded-full cursor-pointer w-30 bg-lightPrimary text-navy-700 dark:bg-navy-900 dark:text-white"
            >
              <span>{selected || 'Jobs'}</span>
              <span className="ml-auto">{isOpen ? <MdArrowDropUp className="w-8 h-8 text-navy-700 dark:text-white " /> 
              : <IoMdArrowDropdown className="w-6 h-6 text-navy-700 dark:text-white "/>}</span>
            </div>

            {isOpen && (
              <div className="absolute z-10 w-56 mt-1 bg-white shadow-xl dark:bg-navy-700 rounded-xl ">
                <div
                  onClick={() => handleSelect('Talents')}
                  className="p-2 px-5 pt-5 text-sm text-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-navy-600 dark:text-white hover:dark:text-white"
                >
                  Talents
                </div>
                <div
                  onClick={() => handleSelect('Jobs')}
                  className="p-2 px-5 pb-5 text-sm text-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-navy-600 dark:text-white hover:dark:text-white"
                >
                  Jobs
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="absolute flex items-center justify-between h-full gap-4 rounded-full lg:gap-6 md:gap-6 right-3">
        <span
          className="flex text-xl text-gray-600 cursor-pointer dark:text-white xl:hidden"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="w-5 h-5" />
        </span>
        {/* start Notification */}
        <Dropdown
          button={
            <p className="cursor-pointer">
              <IoMdNotificationsOutline className="w-4 h-4 text-gray-600 dark:text-white" />
            </p>
          }
          animation="origin-[65%_0%] md:origin-top-right transition-all duration-300 ease-in-out"
          children={
            <div className="flex w-[360px] flex-col gap-3 rounded-[20px] bg-white p-4 shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none sm:w-[460px]">
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-navy-700 dark:text-white">
                  Notification
                </p>
                <p className="text-sm font-bold text-navy-700 dark:text-white">
                  Mark all read
                </p>
              </div>

              <button className="flex items-center w-full">
                <div className="flex h-full w-[85px] items-center justify-center rounded-xl bg-gradient-to-b from-brandLinear to-brand-500 py-4 text-2xl text-white">
                  <BsArrowBarUp />
                </div>
                <div className="flex flex-col justify-center w-full h-full px-1 ml-2 text-sm rounded-lg">
                  <p className="mb-1 text-base font-bold text-left text-gray-900 dark:text-white">
                    New Update: Horizon UI Dashboard PRO
                  </p>
                  <p className="text-xs text-left text-gray-900 font-base dark:text-white">
                    A new update for your downloaded item is available!
                  </p>
                </div>
              </button>

              <button className="flex items-center w-full">
                <div className="flex h-full w-[85px] items-center justify-center rounded-xl bg-gradient-to-b from-brandLinear to-brand-500 py-4 text-2xl text-white">
                  <BsArrowBarUp />
                </div>
                <div className="flex flex-col justify-center w-full h-full px-1 ml-2 text-sm rounded-lg">
                  <p className="mb-1 text-base font-bold text-left text-gray-900 dark:text-white">
                    New Update: Horizon UI Dashboard PRO
                  </p>
                  <p className="text-xs text-left text-gray-900 font-base dark:text-white">
                    A new update for your downloaded item is available!
                  </p>
                </div>
              </button>
            </div>
          }
          classNames={"py-2 top-4 -left-[230px] md:-left-[440px] w-max"}
        />

<div
  className="text-gray-600 cursor-pointer"
  onClick={() => {
    const newDarkMode = !darkmode;
    document.documentElement.classList.toggle("dark", newDarkMode);
    localStorage.setItem('darkMode', newDarkMode ? 'true' : 'false');
    setDarkmode(newDarkMode);
  }}
>
  {darkmode ? (
    <RiSunFill className="w-4 h-4 text-gray-600 dark:text-white" />
  ) : (
    <RiMoonFill className="w-4 h-4 text-gray-600 dark:text-white" />
  )}
</div>


        {/* Profile & Dropdown */}
        <Dropdown
          button={
            <img
              className="w-10 h-10 rounded-full"
              src={avatar}
              alt="Elon Musk"
            />
          }
          children={
            <div className="flex w-56 flex-col justify-start rounded-[20px] bg-white bg-cover bg-no-repeat shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none">
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    👋 Hey, Sawssan
                  </p>{" "}
                </div>
              </div>
              <div className="w-full h-px bg-gray-200 dark:bg-white/20 " />

              <div className="flex flex-col p-4">
                <a
                  href={homeLink}
                  className="text-sm text-gray-800 dark:text-white hover:dark:text-white"
                >
                  Profile Settings
                </a>
                
              </div>
            </div>
          }
          classNames={"py-2 top-8 -left-[180px] w-max"}
        />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
