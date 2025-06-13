//freelancer/home/index.jsx - Merged and Enhanced Version
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Heart, BarChart3, Activity } from 'lucide-react';
import { Link, useLocation } from "react-router-dom";
import { useFreelancer } from '../../../context/FreelancerContext';
import useUser from '../../../hooks/useUser';
import useRecommendations from '../../../hooks/useRecommendations';
import useJobTracking from '../../../hooks/useJobTracking';
import TrackingAnalytics from '../../../components/tracking/TrackingAnalytics';
import TrackingDemo from '../../../components/tracking/TrackingDemo';
import SearchJob from '../../../components/landing/job';
import SearchTalent from '../../../components/landing/freelancer';
import useSearch from '../../../hooks/usesearch';

// Constants
const TABS = [
  { id: 'bestMatches', name: 'Best Matches' },
  { id: 'mostRecent', name: 'Most Recent' }
];

const RECOMMENDATIONS_CONFIG = {
  limit: 20,
  includeApplied: false
};

const MAX_TRACKING_HISTORY = 100;
const NEW_JOB_THRESHOLD_HOURS = 24;

// Utility functions
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

const getSafeValue = (value, fallback = 'Non spécifié') => 
  value != null && value !== undefined ? value : fallback;

const getJobAge = (dateString) => {
  if (!dateString) return Infinity;
  return Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60));
};

const sortJobsByDate = (jobs) => 
  [...jobs].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.updatedAt || 0);
    const dateB = new Date(b.createdAt || b.updatedAt || 0);
    return dateB - dateA;
  });

const Home = () => {
  const location = useLocation();
  
  // State management
  const [activeTab, setActiveTab] = useState('bestMatches');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTrackingDemo, setShowTrackingDemo] = useState(false);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [lastTrackedSession, setLastTrackedSession] = useState(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSelected, setSearchSelected] = useState('Jobs');
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  // Context and hooks
  const { jobs, loading, error, fetchJobs, toggleSaveJob } = useFreelancer();
  const { user: _user } = useUser();
  
  const {
    trackJobView,
    trackJobClick,
    trackJobApplication,
    trackJobSave,
    trackTabSwitch,
    trackRefresh
  } = useJobTracking();
  
  const {
    recommendations,
    isLoading: isRecommendationsLoading,
    isError: isRecommendationsError,
    error: recommendationsError,
    trackBatchViews,
    refetch: refetchRecommendations
  } = useRecommendations(RECOMMENDATIONS_CONFIG);
  
  // Search functionality
  const searchType = searchSelected === 'Jobs' ? 'jobs' : 'freelancers';
  const { freelancers, jobs: searchJobs, isLoading } = useSearch(searchQuery, searchType);
  
  // Extract missions from recommendations
  const recommendedJobs = useMemo(() => {
    if (!recommendations?.length) return [];
    return recommendations.map(rec => rec.mission).filter(Boolean);
  }, [recommendations]);
  
  // Read query parameters from URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    const type = params.get('type') || 'jobs';

    if (q.trim()) {
      setSearchQuery(q);
      setIsSearchActive(true);
      setSearchSelected(type === 'freelancers' || type === 'talent' ? 'Talents' : 'Jobs');
    } else {
      setSearchQuery('');
      setIsSearchActive(false);
      setSearchSelected('Jobs');
    }
  }, [location.search]);
  
  // Memoized computed values
  const isLoadingJobs = useMemo(() => 
    loading.jobs || (activeTab === 'bestMatches' && isRecommendationsLoading),
    [loading.jobs, activeTab, isRecommendationsLoading]
  );
  
  const hasError = useMemo(() => 
    (activeTab === 'mostRecent' && error.jobs) ||
    (activeTab === 'bestMatches' && isRecommendationsError),
    [activeTab, error.jobs, isRecommendationsError]
  );
  
  const currentError = useMemo(() => 
    activeTab === 'bestMatches' ? recommendationsError : error.jobs,
    [activeTab, recommendationsError, error.jobs]
  );
  
  const sortedJobs = useMemo(() => {
    if (activeTab === 'bestMatches') {
      return recommendedJobs || [];
    }
    
    if (!jobs?.length) return [];
    
    // Create a copy to avoid mutating original state
    const jobsCopy = [...jobs];
    
    if (activeTab === 'mostRecent') {
      return sortJobsByDate(jobsCopy);
    } else {
      // For 'bestMatches', apply different sorting criteria
      return jobsCopy.sort((a, b) => {
        const budgetA = parseFloat(a.budget || a.price || 0);
        const budgetB = parseFloat(b.budget || b.price || 0);
        return budgetB - budgetA;
      });
    }
  }, [jobs, recommendedJobs, activeTab]);
  
  const shouldShowNoRecommendationsMessage = useMemo(() => 
    activeTab === 'bestMatches' && 
    !isRecommendationsLoading && 
    !recommendations?.length &&
    !jobs?.length,
    [activeTab, isRecommendationsLoading, recommendations, jobs]
  );
  
  const hasContent = useMemo(() => 
    !shouldShowNoRecommendationsMessage && sortedJobs.length > 0,
    [shouldShowNoRecommendationsMessage, sortedJobs.length]
  );
  
  // Optimized tracking functions with debouncing
  const addToTrackingHistory = useCallback((interaction) => {
    setTrackingHistory(prev => {
      const lastInteraction = prev[prev.length - 1];
      if (lastInteraction && 
          lastInteraction.jobId === interaction.jobId && 
          lastInteraction.interactionType === interaction.interactionType &&
          Date.now() - new Date(lastInteraction.metadata.timestamp).getTime() < 1000) {
        return prev;
      }
      
      return [...prev.slice(-(MAX_TRACKING_HISTORY - 1)), interaction];
    });
  }, []);
  
  const createTrackingMetadata = useCallback((additionalData = {}) => ({
    fromRecommendations: activeTab === 'bestMatches',
    tab: activeTab,
    source: 'home_page',
    timestamp: new Date().toISOString(),
    ...additionalData
  }), [activeTab]);
  
  const trackAndStore = useCallback((trackingFunction, jobId, additionalMetadata, interactionType) => {
    const metadata = createTrackingMetadata(additionalMetadata);
    
    trackingFunction(jobId, metadata);
    addToTrackingHistory({
      jobId,
      interactionType,
      metadata
    });
  }, [createTrackingMetadata, addToTrackingHistory]);
  
  // Event handlers
  const handleTabChange = useCallback((newTab) => {
    if (newTab === activeTab) return;
    
    const oldTab = activeTab;
    setActiveTab(newTab);
    
    trackTabSwitch(oldTab, newTab, createTrackingMetadata());
    addToTrackingHistory({
      jobId: 'system',
      interactionType: 'navigation',
      metadata: createTrackingMetadata({ fromTab: oldTab, toTab: newTab })
    });
  }, [activeTab, trackTabSwitch, createTrackingMetadata, addToTrackingHistory]);
  
  const handleToggleFavorite = useCallback(async (jobId) => {
    try {
      const message = await toggleSaveJob(jobId);
      console.log(message);
      
      trackAndStore(trackJobSave, jobId, { action: 'toggle_favorite' }, 'save');
    } catch (err) {
      console.error('Error toggling job favorite:', err);
    }
  }, [toggleSaveJob, trackAndStore, trackJobSave]);
  
  const handleJobClick = useCallback((jobId) => {
    trackAndStore(trackJobClick, jobId, { action: 'view_details' }, 'click');
  }, [trackAndStore, trackJobClick]);
  
  const handleApplyClick = useCallback((jobId) => {
    trackAndStore(trackJobApplication, jobId, { action: 'apply_click' }, 'apply');
  }, [trackAndStore, trackJobApplication]);
  
  // Debounced hover tracking
  const hoverTimeoutRef = React.useRef(null);
  
  const handleJobHover = useCallback((jobId, hoverType) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    if (hoverType === 'hover_start') {
      hoverTimeoutRef.current = setTimeout(() => {
        trackAndStore(trackJobView, jobId, { 
          action: 'card_hover',
          engagementType: 'hover'
        }, 'view');
      }, 300);
    }
  }, [trackAndStore, trackJobView]);
  
  const handleSkillClick = useCallback((jobId, skill) => {
    trackAndStore(trackJobClick, jobId, { 
      action: 'skill_click',
      skill,
      engagementType: 'skill_interest'
    }, 'click');
  }, [trackAndStore, trackJobClick]);
  
  const handleRefreshJobs = useCallback(() => {
    const metadata = createTrackingMetadata();
    trackRefresh(activeTab === 'bestMatches' ? 'recommendations' : 'regular_jobs', metadata);
    
    if (activeTab === 'bestMatches') {
      refetchRecommendations();
    } else {
      fetchJobs();
    }
  }, [activeTab, trackRefresh, createTrackingMetadata, refetchRecommendations, fetchJobs]);
  
  // Effects
  useEffect(() => {
    const jobIds = sortedJobs.map(job => job._id).filter(Boolean);
    if (!jobIds.length || isSearchActive) return;
    
    const sessionId = `${activeTab}-${jobIds.length}-${Date.now()}`;
    
    if (lastTrackedSession === sessionId) return;
    
    const trackingTimer = setTimeout(() => {
      setLastTrackedSession(sessionId);
      
      const metadata = createTrackingMetadata({
        action: 'page_view',
        jobIds,
        count: jobIds.length,
        sessionId
      });
      
      trackJobView('batch', metadata);
      
      if (activeTab === 'bestMatches' && recommendations?.length) {
        trackBatchViews(jobIds, { 
          action: 'page_view',
          count: jobIds.length,
          sessionId
        });
      }
    }, 50000);
    
    return () => clearTimeout(trackingTimer);
  }, [activeTab, sortedJobs.length, lastTrackedSession, isSearchActive, sortedJobs, createTrackingMetadata, trackJobView, recommendations?.length, trackBatchViews]);
  
  // Render helpers
  const renderNewJobBadge = useCallback((job) => {
    if (activeTab !== 'mostRecent' || !job.createdAt) return null;
    
    const hoursAgo = getJobAge(job.createdAt);
    if (hoursAgo >= NEW_JOB_THRESHOLD_HOURS) return null;
    
    return (
      <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
        🆕 {hoursAgo < 1 ? 'Nouvelle' : `${hoursAgo}h`}
      </span>
    );
  }, [activeTab]);
  
  const renderRecommendationBadge = useCallback((job) => {
    if (activeTab !== 'bestMatches' || !job.recommendationScore) return null;
    
    return (
      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
        🎯 {Math.round(job.recommendationScore * 100)}% match
      </span>
    );
  }, [activeTab]);
  
  const renderSkills = useCallback((job) => {
    if (!job.skills?.length) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills.map((skill, index) => (
          <span 
            key={index} 
            className="px-3 py-1 text-sm text-gray-800 border rounded-full dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
            onClick={() => handleSkillClick(job._id, skill)}
            title={`Click to show more jobs with ${skill}`}
          >
            {skill}
          </span>
        ))}
      </div>
    );
  }, [handleSkillClick]);
  
  const renderDebugInfo = useCallback((job, index) => {
    if (activeTab === 'mostRecent') {
      return (
        <div className="text-xs text-gray-400 mt-2">
          Position: #{index + 1} • Créée le: {job.createdAt ? new Date(job.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
        </div>
      );
    }
    
    if (activeTab === 'bestMatches' && job.recommendationScore) {
      return (
        <div className="text-xs text-gray-400 mt-2">
          Recommendation #{index + 1} 
          • Score: {(job.recommendationScore * 100).toFixed(1)}%
          {job.reasons?.length > 0 && ` • Reasons: ${job.reasons.slice(0, 2).join(', ')}`}
        </div>
      );
    }
    
    return null;
  }, [activeTab]);
  
  // Early returns for loading and error states
  if (!isSearchActive && isLoadingJobs) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#518394]"></div>
      </div>
    );
  }
  
  if (!isSearchActive && hasError) {
    return (
      <div className="text-red-500 text-center p-4">
        <p>Error loading {activeTab === 'bestMatches' ? 'recommendations' : 'jobs'}: {currentError?.message || currentError}</p>
        <button 
          onClick={handleRefreshJobs}
          className="mt-4 px-4 py-2 bg-[#518394] text-white rounded hover:bg-[#406c7a]"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Search Results or Normal View */}
      {isSearchActive ? (
        <div className="flex-1">
          {/* Search Loading */}
          {(isLoading || isLoadingJobs) && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#518394]"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-300">
                Searching {searchSelected.toLowerCase()}...
              </span>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && !isLoadingJobs && (
            <div className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Search Results for "{searchQuery}"
                </h2>
                <span className="text-sm text-gray-500">
                  {searchSelected === 'Jobs' 
                    ? `${Array.isArray(searchJobs) ? searchJobs.length : 0} jobs found`
                    : `${Array.isArray(freelancers) ? freelancers.length : 0} talents found`
                  }
                </span>
              </div>
              {searchSelected === 'Jobs' ? (
                <SearchJob jobs={Array.isArray(searchJobs) ? searchJobs : []} search={searchQuery} />
              ) : (
                <SearchTalent talents={Array.isArray(freelancers) ? freelancers : []} search={searchQuery} />
              )}
            </div>
          )}
        </div>
      ) : (
        /* Normal Job Listing View */
        <div className="flex-1">
          {/* Header with tabs and controls */}
          <div className="m-2">
            <div className="flex justify-between items-center">
              <div className="flex">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    className={`py-3 px-16 w-1/2 text-center relative ${
                      activeTab === tab.id 
                        ? 'text-[#518394] border-b-2 border-[#518394] font-medium' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => handleTabChange(tab.id)}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
              
              {/* Analytics and Demo Controls */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTrackingDemo(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  title="Try Live Tracking Demo"
                >
                  <Activity size={16} />
                  <span className="text-sm font-medium">Demo</span>
                </button>
                
                <button
                  onClick={() => setShowAnalytics(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                  title="View Tracking Analytics"
                >
                  <BarChart3 size={18} />
                  <span className="text-sm font-medium">Analytics</span>
                  {trackingHistory.length > 0 && (
                    <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                      {trackingHistory.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Content area */}
          {shouldShowNoRecommendationsMessage ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <p className="text-gray-500 text-center mb-4">
                No personalized recommendations available. We're learning your preferences!
              </p>
              <button 
                onClick={handleRefreshJobs}
                className="px-4 py-2 bg-[#518394] text-white rounded hover:bg-[#406c7a]"
              >
                Refresh
              </button>
            </div>
          ) : !hasContent ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <p className="text-gray-500 text-center mb-4">
                No jobs available at the moment.
              </p>
              <button 
                onClick={handleRefreshJobs}
                className="px-4 py-2 bg-[#518394] text-white rounded hover:bg-[#406c7a]"
              >
                Refresh
              </button>
            </div>
          ) : (
            /* Job Listings */
            <div className="flex-1 w-full max-w-screen-xl p-4 mx-auto">
              <div className="flex flex-col gap-4">
                {sortedJobs.map((job, index) => (
                  <div 
                    key={job._id} 
                    className="p-6 bg-white rounded-lg shadow dark:!bg-navy-800 border border-[#4242425a]"
                    onMouseEnter={() => handleJobHover(job._id, 'hover_start')}
                  >
                    <div className="flex justify-between">
                      <div className="flex-1">
                        {/* Job Header */}
                        <div className="flex justify-between mb-3">
                          <div className="flex items-center">
                            <h3 className="text-xl font-bold dark:text-white">
                              {getSafeValue(job.title, 'Titre non disponible')}
                            </h3>
                            {renderNewJobBadge(job)}
                            {renderRecommendationBadge(job)}
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2 text-gray-500">
                              {getRelativeTime(job.createdAt)}
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
                        {renderSkills(job)}
                        
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
                        
                        {/* Job Details Table */}
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
                        
                        {/* Debug Info */}
                        {renderDebugInfo(job, index)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Modals */}
      <TrackingAnalytics 
        trackingData={trackingHistory}
        isVisible={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />
      
      {showTrackingDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-navy-800 rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white">Live Tracking Demo</h2>
              <button 
                onClick={() => setShowTrackingDemo(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <TrackingDemo />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;