import React, { useState } from 'react';
import logo from "../../assets/LanceLogo.png";
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white">
      <div className="flex justify-between items-center px-4 md:px-6 py-3">
        {/* Logo and Desktop Navigation */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="w-28 h-9 md:w-30 md:h-10 lg:h-13 lg:w-35" />
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <ul className="hidden md:flex ml-10 space-x-6 text-gray-600 font-medium">
            <a href="#home">
              <li onClick={() => setActiveLink("home")} className={`cursor-pointer ${activeLink === "home" ? "text-[#5A8C8E] underline underline-offset-4 decoration-[#5A8C8E]" : "text-gray-400 hover:text-[#5A8C8E]"}`}>
                Home
              </li> 
            </a>
            <a href="#about">
              <li onClick={() => setActiveLink("about us")} className={`cursor-pointer ${activeLink === "about us" ? "text-[#5A8C8E] underline underline-offset-4 decoration-[#5A8C8E]" : "text-gray-400 hover:text-[#5A8C8E]"}`}>
                About us
              </li>
            </a>
            <a href="#service">
              <li onClick={() => setActiveLink("services")} className={`cursor-pointer ${activeLink === "services" ? "text-[#5A8C8E] underline underline-offset-4 decoration-[#5A8C8E]" : "text-gray-400 hover:text-[#5A8C8E]"}`}>
                Services
              </li>
            </a>
          </ul>
        </div>

        {/* Right side content */}
        <div className="flex items-center">
          {/* Desktop Buttons - Hidden on mobile */}
          <div className="hidden mr-8 md:flex space-x-4">
            <button className="border border-[#5A8C8E] text-[#5A8C8E] px-4 py-1 rounded-lg font-semibold hover:bg-[#5A8C8E] hover:text-white transition-colors">
              Login
            </button>
            <button className="bg-[#5A8C8E] text-white px-4 py-1 rounded-lg font-semibold hover:bg-[#4a7476] transition-colors">
              Sign up
            </button>
          </div>

          {/* Mobile Buttons - Hidden on desktop */}
          <div className="md:hidden flex space-x-2 mr-4">
            <button className="border border-[#5A8C8E] text-[#5A8C8E] px-3 py-1 rounded-lg font-semibold text-xs">
              Login
            </button>
            <button className="bg-[#5A8C8E] text-white px-3 py-1 rounded-lg font-semibold text-xs">
              Sign up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600 focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden bg-white ${isMenuOpen ? 'block' : 'hidden'} py-2 px-4 shadow-md`}>
        <ul className="space-y-3 pb-3">
        <a href="#home">
              <li onClick={() => setActiveLink("home")} className={`cursor-pointer ${activeLink === "home" ? "text-[#5A8C8E] underline-offset-4 decoration-[#5A8C8E]" : "text-gray-400 hover:text-[#5A8C8E]"}`}>
                Home
              </li> 
            </a>
            <a href="#about">
              <li onClick={() => setActiveLink("about us")} className={`cursor-pointer ${activeLink === "about us" ? "text-[#5A8C8E] decoration-[#5A8C8E]" : "text-gray-400 hover:text-[#5A8C8E]"}`}>
                About us
              </li>
            </a>
            <a href="#services">
              <li onClick={() => setActiveLink("services")} className={`cursor-pointer ${activeLink === "services" ? "text-[#5A8C8E] decoration-[#5A8C8E]" : "text-gray-400 hover:text-[#5A8C8E]"}`}>
                Services
              </li>
            </a>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;