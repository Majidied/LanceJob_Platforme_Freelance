import React, { createContext, useState, useEffect, useContext } from 'react';
import { freelancerAPI } from '../services/api';
import { AuthContext } from './AuthContext'; // Assuming you have an AuthContext

export const FreelancerContext = createContext();

export const FreelancerProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState({
    jobs: false,
    savedJobs: false,
    appliedJobs: false,
    offers: false
  });
  const [error, setError] = useState({
    jobs: null,
    savedJobs: null,
    appliedJobs: null,
    offers: null
  });

  // Load jobs when component is mounted
  useEffect(() => {
    if (user && user.__t === 'freelancer') {
      fetchJobs();
      fetchSavedJobs();
      fetchApplications();
      fetchOffers();
    }
  }, [user]);

  // Fetch all available jobs
  const fetchJobs = async () => {
    try {
      setLoading(prev => ({ ...prev, jobs: true }));
      const response = await freelancerAPI.getJobs();
      setJobs(response.data.data);
      setError(prev => ({ ...prev, jobs: null }));
      setLoading(prev => ({ ...prev, jobs: false }));
    } catch (err) {
      setError(prev => ({ ...prev, jobs: err.response?.data?.message || 'Error fetching jobs' }));
      setLoading(prev => ({ ...prev, jobs: false }));
    }
  };

  // Fetch saved jobs
  const fetchSavedJobs = async () => {
    if (!user || !user._id) return;
    
    try {
      setLoading(prev => ({ ...prev, savedJobs: true }));
      const response = await freelancerAPI.getSavedJobs(user._id);
      setSavedJobs(response.data.data);
      setError(prev => ({ ...prev, savedJobs: null }));
      setLoading(prev => ({ ...prev, savedJobs: false }));
    } catch (err) {
      setError(prev => ({ ...prev, savedJobs: err.response?.data?.message || 'Error fetching saved jobs' }));
      setLoading(prev => ({ ...prev, savedJobs: false }));
    }
  };

  // Fetch applications
  const fetchApplications = async () => {
    if (!user || !user._id) return;
    
    try {
      setLoading(prev => ({ ...prev, appliedJobs: true }));
      const response = await freelancerAPI.getApplications(user._id);
      setAppliedJobs(response.data.data);
      setError(prev => ({ ...prev, appliedJobs: null }));
      setLoading(prev => ({ ...prev, appliedJobs: false }));
    } catch (err) {
      setError(prev => ({ ...prev, appliedJobs: err.response?.data?.message || 'Error fetching applications' }));
      setLoading(prev => ({ ...prev, appliedJobs: false }));
    }
  };

  // Fetch offers
  const fetchOffers = async () => {
    if (!user || !user._id) return;
    
    try {
      setLoading(prev => ({ ...prev, offers: true }));
      const response = await freelancerAPI.getOffers(user._id);
      setOffers(response.data.data);
      setError(prev => ({ ...prev, offers: null }));
      setLoading(prev => ({ ...prev, offers: false }));
    } catch (err) {
      setError(prev => ({ ...prev, offers: err.response?.data?.message || 'Error fetching offers' }));
      setLoading(prev => ({ ...prev, offers: false }));
    }
  };

  // Toggle save job
  const toggleSaveJob = async (missionId) => {
    if (!user || !user._id) return;
    
    try {
      const response = await freelancerAPI.toggleSaveJob(user._id, missionId);
      setSavedJobs(response.data.data);
      
      // Update the UI for the jobs list to reflect the save status
      setJobs(prev => 
        prev.map(job => 
          job._id === missionId 
            ? { ...job, isSaved: !job.isSaved } 
            : job
        )
      );
      
      return response.data.message;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error saving job');
    }
  };

  // Apply for a job
  const applyForJob = async (missionId, proposal) => {
    if (!user || !user._id) return;
    
    try {
      const response = await freelancerAPI.applyForJob(user._id, missionId, proposal);
      
      // Refresh applications
      fetchApplications();
      
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error applying for job');
    }
  };

  // Respond to an offer
  const respondToOffer = async (offerId, status) => {
    if (!user || !user._id) return;
    
    try {
      const response = await freelancerAPI.respondToOffer(user._id, offerId, status);
      
      // Update offers in state
      setOffers(prev => 
        prev.map(offer => 
          offer._id === offerId 
            ? { ...offer, status } 
            : offer
        )
      );
      
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error responding to offer');
    }
  };

  return (
    <FreelancerContext.Provider
      value={{
        jobs,
        savedJobs,
        appliedJobs,
        offers,
        loading,
        error,
        fetchJobs,
        fetchSavedJobs,
        fetchApplications,
        fetchOffers,
        toggleSaveJob,
        applyForJob,
        respondToOffer,
      }}
    >
      {children}
    </FreelancerContext.Provider>
  );
};

// Custom hook to use the FreelancerContext
export const useFreelancer = () => {
  const context = useContext(FreelancerContext);
  if (context === undefined) {
    throw new Error('useFreelancer must be used within a FreelancerProvider');
  }
  return context;
};