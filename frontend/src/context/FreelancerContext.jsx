// FreelancerContext.jsx - Adapté à votre API
import React, { createContext, useState, useEffect, useContext } from 'react';
import { freelancerAPI } from '../api/freelancer'; // Ajustez le chemin selon votre structure

export const FreelancerContext = createContext();

export const FreelancerProvider = ({ children }) => {
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

  // ID freelancer fictif pour les tests (ou récupéré depuis localStorage/context)
  const [currentFreelancerId, setCurrentFreelancerId] = useState(
    localStorage.getItem('freelancerId') || null
  );

  // Load jobs when component is mounted
  useEffect(() => {
    fetchJobs();
    if (currentFreelancerId) {
      fetchSavedJobs();
      fetchApplications();
      fetchOffers();
    }
  }, [currentFreelancerId]);

  // Fetch all available jobs/missions
  const fetchJobs = async () => {
    try {
      setLoading(prev => ({ ...prev, jobs: true }));
      const response = await freelancerAPI.getJobs();
      
      // Adapter selon la structure de votre réponse
      // Si votre API retourne directement les données :
      const jobsData = response.data?.data || response.data || response;
      
      // Ajouter le statut isSaved depuis localStorage si pas d'auth
      const savedJobsLocal = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      const jobsWithSaveStatus = jobsData.map(job => ({
        ...job,
        isSaved: savedJobsLocal.includes(job._id)
      }));
      
      setJobs(jobsWithSaveStatus);
      setError(prev => ({ ...prev, jobs: null }));
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(prev => ({ 
        ...prev, 
        jobs: err.response?.data?.message || err.message || 'Error fetching jobs' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, jobs: false }));
    }
  };

  // Fetch saved jobs
  const fetchSavedJobs = async () => {
    if (!currentFreelancerId) {
      // Fallback to localStorage
      const savedJobsLocal = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      setSavedJobs(savedJobsLocal);
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, savedJobs: true }));
      const response = await freelancerAPI.getSavedJobs(currentFreelancerId);
      const savedJobsData = response.data?.data || response.data || response;
      setSavedJobs(savedJobsData);
      setError(prev => ({ ...prev, savedJobs: null }));
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
      setError(prev => ({ 
        ...prev, 
        savedJobs: err.response?.data?.message || 'Error fetching saved jobs' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, savedJobs: false }));
    }
  };

  // Fetch applications
  const fetchApplications = async () => {
    if (!currentFreelancerId) {
      setAppliedJobs([]);
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, appliedJobs: true }));
      const response = await freelancerAPI.getApplications(currentFreelancerId);
      const applicationsData = response.data?.data || response.data || response;
      setAppliedJobs(applicationsData);
      setError(prev => ({ ...prev, appliedJobs: null }));
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(prev => ({ 
        ...prev, 
        appliedJobs: err.response?.data?.message || 'Error fetching applications' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, appliedJobs: false }));
    }
  };

  // Fetch offers
  const fetchOffers = async () => {
    if (!currentFreelancerId) {
      setOffers([]);
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, offers: true }));
      const response = await freelancerAPI.getOffers(currentFreelancerId);
      const offersData = response.data?.data || response.data || response;
      setOffers(offersData);
      setError(prev => ({ ...prev, offers: null }));
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError(prev => ({ 
        ...prev, 
        offers: err.response?.data?.message || 'Error fetching offers' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, offers: false }));
    }
  };

  // Toggle save job
  const toggleSaveJob = async (missionId) => {
    try {
      if (currentFreelancerId) {
        // Utiliser l'API si on a un freelancer ID
        const response = await freelancerAPI.toggleSaveJob(currentFreelancerId, missionId);
        
        // Rafraîchir les jobs sauvegardés
        await fetchSavedJobs();
      } else {
        // Fallback vers localStorage si pas d'auth
        const savedJobsLocal = JSON.parse(localStorage.getItem('savedJobs') || '[]');
        const isCurrentlySaved = savedJobsLocal.includes(missionId);
        
        let updatedSavedJobs;
        if (isCurrentlySaved) {
          updatedSavedJobs = savedJobsLocal.filter(id => id !== missionId);
        } else {
          updatedSavedJobs = [...savedJobsLocal, missionId];
        }
        
        localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
        setSavedJobs(updatedSavedJobs);
      }
      
      // Mettre à jour l'état des jobs
      setJobs(prev => 
        prev.map(job => 
          job._id === missionId 
            ? { ...job, isSaved: !job.isSaved } 
            : job
        )
      );
      
      return 'Job save status updated successfully';
    } catch (err) {
      console.error('Error toggling save job:', err);
      throw new Error(err.response?.data?.message || 'Error saving job');
    }
  };

  // Apply for a job
  const applyForJob = async (missionId, proposal) => {
    if (!currentFreelancerId) {
      throw new Error('Please login to apply for jobs');
    }
    
    try {
      const response = await freelancerAPI.applyForJob(currentFreelancerId, missionId, proposal);
      
      // Refresh applications
      await fetchApplications();
      
      return response.data || response;
    } catch (err) {
      console.error('Error applying for job:', err);
      throw new Error(err.response?.data?.message || 'Error applying for job');
    }
  };

  // Respond to an offer
  const respondToOffer = async (offerId, status) => {
    if (!currentFreelancerId) {
      throw new Error('Please login to respond to offers');
    }
    
    try {
      const response = await freelancerAPI.respondToOffer(currentFreelancerId, offerId, status);
      
      // Update offers in state
      setOffers(prev => 
        prev.map(offer => 
          offer._id === offerId 
            ? { ...offer, status } 
            : offer
        )
      );
      
      return response.data || response;
    } catch (err) {
      console.error('Error responding to offer:', err);
      throw new Error(err.response?.data?.message || 'Error responding to offer');
    }
  };

  // Fonction pour définir l'ID du freelancer (utile pour les tests)
  const setFreelancerId = (id) => {
    setCurrentFreelancerId(id);
    if (id) {
      localStorage.setItem('freelancerId', id);
    } else {
      localStorage.removeItem('freelancerId');
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
        currentFreelancerId,
        fetchJobs,
        fetchSavedJobs,
        fetchApplications,
        fetchOffers,
        toggleSaveJob,
        applyForJob,
        respondToOffer,
        setFreelancerId, // Nouveau: pour définir l'ID freelancer
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