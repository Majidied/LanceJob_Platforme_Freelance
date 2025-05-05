import React from 'react';
import { Facebook, Instagram, Linkedin } from 'lucide-react';
import logo from "../../assets/LanceLogo.png";
import play from "../../assets/google-play.svg";
const Footer = () => {
    return (
        <footer className="bg-[#2E424C] text-white py-10 px-6 md:px-16">
            <div className="max-w-7xl mx-auto">
                {/* Logo and mission statement */}
                <div className="mb-12">
                    <div className="mb-6">
                        <div className='flex'>
                        <div className="bg-white p-1 inline-block rounded">
                            <div className="flex items-center">
                                <img src={logo} alt="Logo" className="w-28 h-9 " />
                            </div>
                        </div>
                        <img className='w-28 h-9 ml-auto mr-6' src={play} />
                        </div>
                        
                    </div>
                    <p className="mb-1 text-xs md:text-sm lg:text-base">
                        Our mission is to empower freelancers and businesses through a trusted platform for meaningful collaboration.
                    </p>
                    <p className="text-xs md:text-sm lg:text-base">
                        We make it easy to work, connect, and grow together.
                    </p>
                    
                </div>

                {/* Navigation */}
                <nav className="mb-10">
                    <ul className="flex space-x-8">
                        <li><a href="#home" className="hover:text-gray-300 transition-colors">Home</a></li>
                        <li><a href="#about" className="hover:text-gray-300 transition-colors">About us</a></li>
                        <li><a href="#service" className="hover:text-gray-300 transition-colors">Services</a></li>
                    </ul>
                </nav>

                {/* Divider */}
                <div className="border-t border-white my-4"></div>

                {/* Copyright and social links */}
                <div className="flex flex-col md:flex-row justify-between items-center mt-6">
                    <div className="text-sm text-gray-300 mb-4 md:mb-0">
                        Copyright 2025©LanceJob, All Rights Reserved.
                    </div>

                    <div className="flex space-x-6">
                        <a href="#" className="text-white hover:text-gray-300 transition-colors">
                            <Facebook size={24} />
                        </a>
                        <a href="#" className="text-white hover:text-gray-300 transition-colors">
                            <Instagram size={24} />
                        </a>
                        <a href="#" className="text-white hover:text-gray-300 transition-colors">
                            <Linkedin size={24} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;