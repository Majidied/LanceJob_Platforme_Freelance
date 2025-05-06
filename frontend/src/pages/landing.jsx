import React from 'react';
import Navbar from '../components/landing/navbar';
import Home from '../components/landing/home';
import Client from '../components/landing/freelancer-client';
import Service from '../components/landing/service';
import Footer from '../components/landing/footer';

const Landing = () => {
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
