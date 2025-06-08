import React, { useState, useEffect } from 'react';
import OffersList from './OffersList';
import OfferDetails from './OfferDetails';
import { mockOffers } from './offersData';

const Offers = () => {
  const [appliedOffers, setAppliedOffers] = useState([]);
  
  const [selectedOffer, setSelectedOffer] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setTimeout(() => {
          setAppliedOffers(mockOffers);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error("Erreur lors du chargement des offres:", error);
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const viewOfferDetails = (id) => {
    const offer = appliedOffers.find(offer => offer.id === id);
    setSelectedOffer(offer);
  };

  const backToList = () => {
    setSelectedOffer(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (appliedOffers.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Vous n'avez pas encore postulé à des offres.</p>
        <button className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600">
          Découvrir des projets
        </button>
      </div>
    );
  }

  return (
    <div>
      {selectedOffer ? (
        <OfferDetails offer={selectedOffer} onBackToList={backToList} />
      ) : (
        <OffersList offers={appliedOffers} onViewDetails={viewOfferDetails} />
      )}
    </div>
  );
};

export default Offers;