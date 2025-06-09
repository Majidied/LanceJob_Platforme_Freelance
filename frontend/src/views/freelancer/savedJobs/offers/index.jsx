import React, { useState, useEffect } from 'react';
import OffersList from './OffersList';
import OfferDetails from './OfferDetails';
import { useFreelancer } from '../../../context/FreelancerContext';

const Offers = () => {
  const [selectedOffer, setSelectedOffer] = useState(null);
  
  // Utiliser le FreelancerContext au lieu des données mockées
  const { 
    appliedJobs, 
    offers, 
    loading, 
    error, 
    fetchApplications, 
    fetchOffers,
    currentFreelancerId 
  } = useFreelancer();

  useEffect(() => {
    console.log('🚀 Offers component mounted, fetching data...');
    if (currentFreelancerId) {
      // Charger les applications et offers au démarrage
      fetchApplications();
      fetchOffers();
    }
  }, [currentFreelancerId]);

  const viewOfferDetails = (id, item) => {
    console.log('👀 Viewing details for:', id, item);
    setSelectedOffer(item);
  };

  const backToList = () => {
    setSelectedOffer(null);
  };

  // Debug info
  console.log('🔍 Offers component state:', {
    appliedJobs: appliedJobs?.length,
    offers: offers?.length,
    loading,
    error,
    currentFreelancerId
  });

  if (loading.appliedJobs || loading.offers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        <p className="ml-4 text-gray-600">Chargement des données...</p>
      </div>
    );
  }

  if (error.appliedJobs || error.offers) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 mb-2">Erreur lors du chargement :</p>
          <p className="text-sm text-red-500">
            {error.appliedJobs || error.offers}
          </p>
          <button 
            onClick={() => {
              fetchApplications();
              fetchOffers();
            }}
            className="px-4 py-2 mt-4 text-white bg-red-500 rounded hover:bg-red-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!currentFreelancerId) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Aucun freelancer connecté.</p>
        <button 
          onClick={() => window.location.href = '/freelancer/login'}
          className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div>
      {selectedOffer ? (
        <OfferDetails offer={selectedOffer} onBackToList={backToList} />
      ) : (
        <OffersList onViewDetails={viewOfferDetails} />
      )}
    </div>
  );
};

export default Offers;