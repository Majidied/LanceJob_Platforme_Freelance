import React, { useEffect, useState } from 'react';
import { freelancer } from '../api';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  
  // Get current user from context or localStorage
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await freelancer.getOffers(currentUser._id);
        setOffers(response.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchOffers();
  }, [currentUser._id]);
  
  const handleRespondToOffer = async (offerId, status) => {
    try {
      await freelancerAPI.respondToOffer(currentUser._id, offerId, status);
      // Update UI accordingly
    } catch (err) {
      console.error(err);
    }
  };
  
  // Render offers
  return (
    <div>
      {/* Render offers */}
    </div>
  );
};