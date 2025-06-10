import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/landing/navbar';
import Home from '../components/landing/home';
import Client from '../components/landing/freelancer-client';
import Service from '../components/landing/service';
import Footer from '../components/landing/footer';


const Landing = () => {
  const location = useLocation();

        useEffect(() => {
      if (!location.hash || location.hash === "#") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const el = document.getElementById(location.hash.replace("#", ""));
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    }, [location.hash]);
  return (
    <div>
      <Navbar />
      <Home />
      <Client />
      <Service />
      <Footer/>
    </div>
  );
};

export default Landing;
