import React, { useState, useEffect } from 'react';
import { Heart, RefreshCw, Briefcase } from 'lucide-react';
import { Link } from "react-router-dom";
import { useFreelancer } from '../../../context/FreelancerContext';

const SavedJobs = () => {
  const [activeTab, setActiveTab] = useState('bestMatches');
  const tabs = [
    { id: 'bestMatches', name: 'Best Matches' },
    { id: 'mostRecent', name: 'Most Recent' }
  ];
  
  const { 
    savedJobs, 
    loading, 
    error, 
    fetchSavedJobs, 
    toggleSaveJob,
    currentFreelancerId 
  } = useFreelancer();
  
  // Charger les saved jobs au montage du composant
  useEffect(() => {
    if (currentFreelancerId) {
      fetchSavedJobs();
    }
  }, [currentFreelancerId, fetchSavedJobs]);
  
  // Fonction utilitaire pour calculer le temps relatif
  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };
  
  // Gérer le toggle des favoris
  const handleToggleFavorite = async (jobId) => {
    try {
      const message = await toggleSaveJob(jobId);
      console.log(message);
      // Rafraîchir les saved jobs après le toggle
      setTimeout(() => {
        fetchSavedJobs();
      }, 500);
    } catch (err) {
      console.error('Error toggling job favorite:', err);
      alert('Erreur lors de la modification des favoris');
    }
  };

  // Fonction pour obtenir une valeur avec fallback
  const getSafeValue = (value, fallback = 'Non spécifié') => {
    return value && value !== null && value !== undefined ? value : fallback;
  };

  // Fonction de refresh manuelle
  const handleRefresh = () => {
    if (currentFreelancerId) {
      fetchSavedJobs();
    }
  };

  // Si pas de freelancer connecté
  if (!currentFreelancerId) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Authentification requise</h3>
        <p className="text-gray-500 mb-4">
          Vous devez être connecté pour voir vos missions sauvegardées.
        </p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="px-4 py-2 bg-[#518394] text-white rounded hover:bg-[#406c7a]"
        >
          Se connecter
        </button>
      </div>
    );
  }

  // Si chargement en cours
  if (loading.savedJobs) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#518394]"></div>
        <p className="ml-4 text-gray-600">Chargement des missions sauvegardées...</p>
      </div>
    );
  }

  // Si erreur
  if (error.savedJobs) {
    return (
      <div className="text-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 mb-2">Erreur: {error.savedJobs}</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Si aucune mission sauvegardée
  if (!savedJobs || savedJobs.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Header avec bouton refresh */}
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Missions Sauvegardées (0)
          </h2>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            title="Actualiser"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>

        {/* Message vide */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="mb-4">
              <Heart size={64} className="mx-auto text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune mission sauvegardée</h3>
            <p className="text-gray-500 mb-4">
              Explorez les missions disponibles et sauvegardez celles qui vous intéressent en cliquant sur le cœur.
            </p>
            <Link 
              to="/freelancer/home"
              className="inline-block px-4 py-2 bg-[#518394] text-white rounded hover:bg-[#406c7a] transition-colors"
            >
              Voir les missions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header avec tabs et bouton refresh */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`py-3 px-16 text-center ${
                activeTab === tab.id 
                  ? 'text-[#518394] border-b-2 border-[#518394] font-medium' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {savedJobs.length} mission{savedJobs.length > 1 ? 's' : ''} sauvegardée{savedJobs.length > 1 ? 's' : ''}
          </span>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            title="Actualiser"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>
      
      {/* Job Listings */}
      <div className="flex-1 w-full max-w-screen-xl p-4 mx-auto overflow-y-auto">
        <div className="flex flex-col gap-4">
          {savedJobs.map(job => (
            <div key={job._id} className="p-6 bg-white rounded-lg shadow dark:!bg-navy-800 border border-[#4242425a]">
              <div className="flex justify-between">
                <div className="flex-1">
                  {/* Job Header */}
                  <div className="flex justify-between mb-3">
                    <h3 className="text-xl font-bold dark:text-white">
                      {getSafeValue(job.title, 'Titre non disponible')}
                    </h3>
                    <div className="flex items-center">
                      <span className="mr-2 text-gray-500">
                        {job.createdAt ? getRelativeTime(job.createdAt) : 'Date inconnue'}
                      </span>
                      <Heart 
                        className="w-6 h-6 cursor-pointer transition-colors fill-red-500 text-red-500"
                        onClick={() => handleToggleFavorite(job._id)}
                      />
                    </div>
                  </div>
                  
                  {/* Skills */}
                  {job.tags && Array.isArray(job.tags) && job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.tags.map((skill, index) => (
                        <span key={index} className="px-3 py-1 text-sm text-gray-800 border rounded-full dark:text-white">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Description */}
                  <p className="mb-4 text-gray-600 dark:text-gray-300">
                    {getSafeValue(job.description, 'Description non disponible')}
                  </p>
                  <Link 
                    to={`/freelancer/jobs/${job._id}`} 
                    className="mb-4 text-blue-500 hover:text-blue-700 cursor-pointer"
                  >
                    Read more
                  </Link>
                  
                  {/* Job Details Table */}
                  <div className="flex mb-4 rounded-lg bg-[#F3F9FA] dark:!bg-navy-900">
                    <div className="flex-1 p-4">
                      <div className="text-sm text-gray-500">Price</div>
                      <div className="text-black dark:text-white">
                        {getSafeValue(job.budget, '0')} MAD
                      </div>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="text-sm text-gray-500">Type</div>
                      <div className="text-black dark:text-white">
                        {getSafeValue(job.type, 'Fixed')}
                      </div>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="text-sm text-gray-500">Timeline</div>
                      <div className="text-black dark:text-white">
                        {job.deadline ? new Date(job.deadline).toLocaleDateString('fr-FR') : 'Non spécifié'}
                      </div>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="text-sm text-gray-500">Experience</div>
                      <div className="text-black dark:text-white">
                        {getSafeValue(job.experience, 'Intermediate')}
                      </div>
                    </div>
                    <div className="p-4 ml-auto pt-7">
                      <Link
                        to={`/freelancer/propose/${job._id}`}
                        className="px-6 py-2 text-white transition-colors duration-200 bg-[#86C1A3] rounded-md hover:bg-[#5f9478]"
                      >
                        Apply
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedJobs;