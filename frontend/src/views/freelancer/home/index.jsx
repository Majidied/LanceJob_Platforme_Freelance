//freelancer/home/index.jsx - Enhanced with ML recommendations (Fixed Design)
import React, { useState, useEffect, useMemo } from 'react';
import { Heart } from 'lucide-react';
import { Link } from "react-router-dom";
import { useFreelancer } from '../../../context/FreelancerContext';
import useUser from '../../../hooks/useUser';
import useRecommendations from '../../../hooks/useRecommendations';

const Home = () => {
  const [activeTab, setActiveTab] = useState('bestMatches');
  const tabs = [
    { id: 'bestMatches', name: 'Best Matches' },
    { id: 'mostRecent', name: 'Most Recent' }
  ];
  
  const { jobs, loading, error, fetchJobs, toggleSaveJob } = useFreelancer();
  const { user: _user } = useUser(); // Keep for future use
  
  // Get recommendations for Best Matches tab
  const {
    recommendations,
    isLoading: isRecommendationsLoading,
    isError: isRecommendationsError,
    error: recommendationsError,
    trackMissionClick,
    trackMissionApplication,
    trackMissionSave,
    trackBatchViews,
    refetch: refetchRecommendations
  } = useRecommendations({
    limit: 20,
    includeApplied: false
  });
  
  // ✅ Mémoriser les jobs triés selon l'onglet actif
  const sortedJobs = useMemo(() => {
    if (activeTab === 'bestMatches') {
      // Use ML recommendations for Best Matches tab, fallback to regular jobs if no recommendations
      if (recommendations && recommendations.length > 0) {
        return recommendations;
      }
      return [];
    } else {
      // Use regular jobs for Most Recent tab
      if (!jobs || jobs.length === 0) return [];
      
      // Créer une copie pour éviter de muter l'état original
      const jobsCopy = [...jobs];
      
      // Trier par date de création (plus récent en premier)
      return jobsCopy.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt || 0);
        const dateB = new Date(b.createdAt || b.updatedAt || 0);
        return dateB - dateA; // Tri décroissant (plus récent en premier)
      });
    }
  }, [jobs, recommendations, activeTab]);
  
  // Check if we should show the "no recommendations" message
  const shouldShowNoRecommendationsMessage = useMemo(() => {
    return activeTab === 'bestMatches' && 
           !isRecommendationsLoading && 
           (!recommendations || recommendations.length === 0) &&
           (!jobs || jobs.length === 0);
  }, [activeTab, isRecommendationsLoading, recommendations, jobs]);
  
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

  // Gérer le toggle des favoris avec tracking pour les recommandations
  const handleToggleFavorite = async (jobId) => {
    try {
      const message = await toggleSaveJob(jobId);
      console.log(message);
      
      // Track save action if this is from Best Matches (recommendations)
      if (activeTab === 'bestMatches' && recommendations && recommendations.length > 0) {
        trackMissionSave(jobId, { 
          action: 'toggle_favorite',
          fromRecommendations: true 
        });
      }
    } catch (err) {
      console.error('Error toggling job favorite:', err);
    }
  };

  // Track clicks on job details links
  const handleJobClick = (jobId) => {
    if (activeTab === 'bestMatches' && recommendations && recommendations.length > 0) {
      trackMissionClick(jobId, { 
        action: 'view_details',
        fromRecommendations: true 
      });
    }
  };

  // Track application clicks
  const handleApplyClick = (jobId) => {
    if (activeTab === 'bestMatches' && recommendations && recommendations.length > 0) {
      trackMissionApplication(jobId, { 
        action: 'apply_click',
        fromRecommendations: true 
      });
    }
  };

  // Track views when jobs are displayed
  useEffect(() => {
    if (activeTab === 'bestMatches' && recommendations && recommendations.length > 0) {
      // Track batch views for all visible recommendations
      const jobIds = recommendations.map(job => job._id).filter(Boolean);
      if (jobIds.length > 0) {
        trackBatchViews(jobIds, { 
          action: 'page_view',
          count: jobIds.length 
        });
      }
    }
  }, [activeTab, recommendations, trackBatchViews]);

  // Fonction pour obtenir une valeur avec fallback
  const getSafeValue = (value, fallback = 'Non spécifié') => {
    return value && value !== null && value !== undefined ? value : fallback;
  };

  // Si chargement en cours
  if (loading.jobs || (activeTab === 'bestMatches' && isRecommendationsLoading)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#518394]"></div>
      </div>
    );
  }

  // Si erreur pour Most Recent tab
  if (activeTab === 'mostRecent' && error.jobs) {
    return (
      <div className="text-red-500 text-center p-4">
        Error loading jobs: {error.jobs}
      </div>
    );
  }

  // Si erreur pour Best Matches tab
  if (activeTab === 'bestMatches' && isRecommendationsError) {
    return (
      <div className="text-red-500 text-center p-4">
        <p>Error loading recommendations: {recommendationsError?.message || 'Unknown error'}</p>
        <button 
          onClick={refetchRecommendations}
          className="mt-2 px-4 py-2 bg-[#518394] text-white rounded hover:bg-[#406c7a]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tabs - Keep exact visual design from image */}
      <div className="m-2">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`py-3 px-16 w-1/2 text-center relative ${
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
      </div>
      
      {/* Show "No recommendations" message only when appropriate */}
      {shouldShowNoRecommendationsMessage ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <p className="text-gray-500 text-center mb-4">
            No personalized recommendations available. We're learning your preferences!
          </p>
          <button 
            onClick={refetchRecommendations}
            className="px-4 py-2 bg-[#518394] text-white rounded hover:bg-[#406c7a]"
          >
            Refresh
          </button>
        </div>
      ) : sortedJobs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <p className="text-gray-500 text-center mb-4">
            No jobs available at the moment.
          </p>
          <button 
            onClick={fetchJobs}
            className="px-4 py-2 bg-[#518394] text-white rounded hover:bg-[#406c7a]"
          >
            Refresh
          </button>
        </div>
      ) : (
        /* Job Listings - Keep exact layout from image */
        <div className="flex-1 w-full max-w-screen-xl p-4 mx-auto">
          <div className="flex flex-col gap-4">
            {sortedJobs.map((job, index) => (
              <div key={job._id} className="p-6 bg-white rounded-lg shadow dark:!bg-navy-800 border border-[#4242425a]">
                <div className="flex justify-between">
                  <div className="flex-1">
                    {/* Job Header */}
                    <div className="flex justify-between mb-3">
                      <div className="flex items-center">
                        <h3 className="text-xl font-bold dark:text-white">
                          {getSafeValue(job.title, 'Titre non disponible')}
                        </h3>
                        {/* Badge pour indiquer si c'est une mission récente (moins de 24h) */}
                        {activeTab === 'mostRecent' && job.createdAt && (
                          (() => {
                            const hoursAgo = Math.floor((new Date() - new Date(job.createdAt)) / (1000 * 60 * 60));
                            if (hoursAgo < 24) {
                              return (
                                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                  🆕 {hoursAgo < 1 ? 'Nouvelle' : `${hoursAgo}h`}
                                </span>
                              );
                            }
                            return null;
                          })()
                        )}
                        
                        {/* Badge pour le score de recommandation */}
                        {activeTab === 'bestMatches' && job.recommendationScore && (
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            🎯 {Math.round(job.recommendationScore * 100)}% match
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2 text-gray-500">
                          {job.createdAt ? getRelativeTime(job.createdAt) : 'Date inconnue'}
                        </span>
                        <Heart 
                          className={`w-6 h-6 cursor-pointer transition-colors ${
                            job.isSaved ? 'fill-red-500 text-red-500' : 'text-gray-300 hover:text-red-300'
                          }`}
                          onClick={() => handleToggleFavorite(job._id)}
                        />
                      </div>
                    </div>
                    
                    {/* Skills */}
                    {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills.map((skill, index) => (
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
                      onClick={() => handleJobClick(job._id)}
                    >
                      Read more
                    </Link>
                    
                    {/* Job Details Table - Keep exact layout from image */}
                    <div className="flex mb-4 rounded-lg bg-[#F3F9FA] dark:!bg-navy-900">
                      <div className="flex-1 p-4">
                        <div className="text-sm text-gray-500">Price</div>
                        <div className="text-black dark:text-white">
                          {getSafeValue(job.budget || job.price, '0')} {getSafeValue(job.currency, 'MAD')}
                        </div>
                      </div>
                      <div className="flex-1 p-4">
                        <div className="text-sm text-gray-500">Type</div>
                        <div className="text-black dark:text-white">
                          {getSafeValue(job.priceType || job.type || job.paymentType || job.budgetType, 'Fixed')}
                        </div>
                      </div>
                      <div className="flex-1 p-4">
                        <div className="text-sm text-gray-500">Timeline</div>
                        <div className="text-black dark:text-white">
                          {job.deadline ? new Date(job.deadline).toLocaleDateString('fr-FR') : getSafeValue(job.timeline || job.duration, 'Non spécifié')}
                        </div>
                      </div>
                      <div className="flex-1 p-4">
                        <div className="text-sm text-gray-500">Experience</div>
                        <div className="text-black dark:text-white">
                          {getSafeValue(job.experienceLevel || job.experience || job.level || job.skillLevel, 'Intermediate')}
                        </div>
                      </div>
                      <div className="p-4 ml-auto pt-7">
                        <Link
                          to={`/freelancer/propose/${job._id}`}
                          className="px-6 py-2 text-white transition-colors duration-200 bg-[#86C1A3] rounded-md hover:bg-[#5f9478]"
                          onClick={() => handleApplyClick(job._id)}
                        >
                          Apply
                        </Link>
                      </div>
                    </div>
                    
                    {/* Debug info - only show for recommendations */}
                    {activeTab === 'mostRecent' && (
                      <div className="text-xs text-gray-400 mt-2">
                        Position: #{index + 1} • Créée le: {job.createdAt ? new Date(job.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                      </div>
                    )}
                    
                    {activeTab === 'bestMatches' && job.recommendationScore && (
                      <div className="text-xs text-gray-400 mt-2">
                        Recommendation #{index + 1} 
                        • Score: {(job.recommendationScore * 100).toFixed(1)}%
                        {job.reasons && job.reasons.length > 0 && ` • Reasons: ${job.reasons.slice(0, 2).join(', ')}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;