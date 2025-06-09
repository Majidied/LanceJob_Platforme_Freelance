// FreelancerContext.jsx - Version avec amélioration saved jobs
import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { freelancerAPI } from '../api/freelancer';

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

  // ✅ UTILISER L'ID DU FREELANCER DE VOTRE BASE DE DONNÉES
  const [currentFreelancerId, setCurrentFreelancerId] = useState(
    '6830ee0e4fc7edee46cf57ea'
  );

  // ✅ Refs pour éviter les appels multiples
  const isFetchingApplications = useRef(false);
  const isFetchingOffers = useRef(false);
  const isFetchingJobs = useRef(false);
  const isFetchingSavedJobs = useRef(false);

  // ✅ Fonction utilitaire pour synchroniser l'état saved des jobs
  const syncJobsSavedStatus = useCallback((jobsList, savedJobsList) => {
    if (!Array.isArray(jobsList) || !Array.isArray(savedJobsList)) {
      return jobsList;
    }
    
    const savedJobIds = savedJobsList.map(savedJob => 
      savedJob._id || savedJob.id || savedJob
    );
    
    return jobsList.map(job => ({
      ...job,
      isSaved: savedJobIds.includes(job._id)
    }));
  }, []);

  // ✅ Mémoriser les fonctions avec useCallback pour éviter les re-renders
  const fetchJobs = useCallback(async () => {
    if (isFetchingJobs.current) {
      console.log('⏳ Jobs fetch already in progress, skipping...');
      return;
    }

    try {
      isFetchingJobs.current = true;
      setLoading(prev => ({ ...prev, jobs: true }));
      console.log('🔄 Fetching jobs...');
      
      const response = await freelancerAPI.getJobs();
      const jobsData = response.data?.data || response.data || response;
      
      // Préparer les jobs avec des valeurs par défaut
      const jobsWithDefaults = jobsData.map(job => ({
        ...job,
        price: job.budget || job.price,
        timeline: job.deadline ? new Date(job.deadline).toLocaleDateString('fr-FR') : job.timeline,
        priceType: job.type || job.priceType || 'Fixed',
        experienceLevel: job.experience || job.experienceLevel || 'Intermediate',
        skills: job.tags || job.skills || [],
        currency: job.currency || 'MAD',
        isSaved: false // Sera mis à jour par syncJobsSavedStatus
      }));
      
      // Synchroniser avec les saved jobs actuels
      const jobsWithSaveStatus = syncJobsSavedStatus(jobsWithDefaults, savedJobs);
      
      setJobs(jobsWithSaveStatus);
      setError(prev => ({ ...prev, jobs: null }));
      console.log('✅ Jobs fetched successfully:', jobsWithSaveStatus.length);
    } catch (err) {
      console.error('❌ Error fetching jobs:', err);
      setError(prev => ({ 
        ...prev, 
        jobs: err.response?.data?.message || err.message || 'Error fetching jobs' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, jobs: false }));
      isFetchingJobs.current = false;
    }
  }, [savedJobs, syncJobsSavedStatus]);

  const fetchSavedJobs = useCallback(async () => {
    if (!currentFreelancerId || isFetchingSavedJobs.current) {
      if (!currentFreelancerId) {
        const savedJobsLocal = JSON.parse(localStorage.getItem('savedJobs') || '[]');
        setSavedJobs(savedJobsLocal);
      }
      return;
    }
    
    try {
      isFetchingSavedJobs.current = true;
      setLoading(prev => ({ ...prev, savedJobs: true }));
      console.log('🔄 Fetching saved jobs...');
      
      const response = await freelancerAPI.getSavedJobs(currentFreelancerId);
      const savedJobsData = response.data?.data || response.data || response;
      
      setSavedJobs(savedJobsData);
      
      // ✅ Synchroniser l'état des jobs après avoir récupéré les saved jobs
      setJobs(prevJobs => syncJobsSavedStatus(prevJobs, savedJobsData));
      
      setError(prev => ({ ...prev, savedJobs: null }));
      console.log('✅ Saved jobs fetched successfully:', savedJobsData.length);
    } catch (err) {
      console.error('❌ Error fetching saved jobs:', err);
      setError(prev => ({ 
        ...prev, 
        savedJobs: err.response?.data?.message || 'Error fetching saved jobs' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, savedJobs: false }));
      isFetchingSavedJobs.current = false;
    }
  }, [currentFreelancerId, syncJobsSavedStatus]);

  const fetchApplications = useCallback(async () => {
    if (!currentFreelancerId || isFetchingApplications.current) {
      if (!currentFreelancerId) {
        console.log('❌ No currentFreelancerId, setting empty applications');
        setAppliedJobs([]);
      }
      return;
    }
    
    try {
      isFetchingApplications.current = true;
      setLoading(prev => ({ ...prev, appliedJobs: true }));
      console.log('🔄 Fetching applications for freelancer:', currentFreelancerId);
      
      const response = await freelancerAPI.getApplications(currentFreelancerId);
      const applicationsData = response.data?.data || response.data || response;

      if (!Array.isArray(applicationsData)) {
        console.warn('⚠️ Applications data is not an array:', applicationsData);
        setAppliedJobs([]);
        setError(prev => ({ ...prev, appliedJobs: null }));
        return;
      }

      const formattedApplications = applicationsData
        .filter(app => app && typeof app === 'object')
        .map((app, index) => {
          let parsedProposal = {
            coverLetter: '',
            proposedPrice: 0,
            currency: 'MAD',
            deliveryTime: 0,
            attachments: []
          };
          
          if (app.proposal) {
            try {
              if (typeof app.proposal === 'string') {
                parsedProposal = { ...parsedProposal, ...JSON.parse(app.proposal) };
              } else if (typeof app.proposal === 'object') {
                parsedProposal = { ...parsedProposal, ...app.proposal };
              }
            } catch (e) {
              console.warn(`Failed to parse proposal for app ${app._id}:`, e);
              parsedProposal.coverLetter = String(app.proposal || '');
            }
          }

          return {
            _id: app._id || `temp-${index}-${Date.now()}`,
            missionTitle: app.missionTitle || 
                         (app.mission && app.mission.title) || 
                         'Mission supprimée',
            missionId: app.missionId || 
                      (app.mission && app.mission._id) || 
                      null,
            clientName: app.clientName || 
                       (app.mission && app.mission.client && app.mission.client.name) || 
                       'Client anonyme',
            status: app.status || 'pending',
            proposedPrice: Number(parsedProposal.proposedPrice) || 0,
            currency: parsedProposal.currency || 'MAD',
            deliveryTime: Number(parsedProposal.deliveryTime) || 0,
            coverLetter: parsedProposal.coverLetter || '',
            appliedAt: app.applicationDate || app.appliedAt || new Date().toISOString(),
            skills: (app.mission && Array.isArray(app.mission.tags)) ? app.mission.tags : 
                   (Array.isArray(app.skills)) ? app.skills : 
                   [],
            budget: (app.mission && app.mission.budget) ? Number(app.mission.budget) : 0,
            timeline: app.mission && app.mission.deadline ? 
                     new Date(app.mission.deadline).toLocaleDateString('fr-FR') : 
                     'Non spécifié',
            description: (app.mission && app.mission.description) || ''
          };
        });
      
      setAppliedJobs(formattedApplications);
      setError(prev => ({ ...prev, appliedJobs: null }));
      console.log('✅ Applications fetched successfully:', formattedApplications.length);
      
    } catch (err) {
      console.error('❌ Error fetching applications:', err);
      
      if (err.response?.status === 404 || err.response?.status >= 500) {
        console.log('🧪 Using mock data due to API error');
        const mockApplications = [
          {
            _id: 'mock-1',
            missionTitle: 'Développement d\'une application mobile',
            missionId: '683202cc580b1b297a604646',
            clientName: 'TechCorp',
            status: 'pending',
            proposedPrice: 1200,
            currency: 'MAD',
            deliveryTime: 14,
            coverLetter: 'Je suis très intéressé par votre projet...',
            appliedAt: new Date().toISOString(),
            skills: ['React Native', 'JavaScript', 'Node.js'],
            budget: 1500,
            timeline: '2 semaines',
            description: 'Application mobile innovante'
          }
        ];
        setAppliedJobs(mockApplications);
        setError(prev => ({ ...prev, appliedJobs: null }));
      } else {
        setAppliedJobs([]);
        setError(prev => ({ 
          ...prev, 
          appliedJobs: `Erreur ${err.response?.status || 'réseau'}: ${err.response?.data?.message || err.message}` 
        }));
      }
    } finally {
      setLoading(prev => ({ ...prev, appliedJobs: false }));
      isFetchingApplications.current = false;
    }
  }, [currentFreelancerId]);

  const fetchOffers = useCallback(async () => {
    if (!currentFreelancerId || isFetchingOffers.current) {
      if (!currentFreelancerId) {
        console.log('❌ No currentFreelancerId, setting empty offers');
        setOffers([]);
      }
      return;
    }
    
    try {
      isFetchingOffers.current = true;
      setLoading(prev => ({ ...prev, offers: true }));
      console.log('🔄 Context: Fetching offers for freelancer:', currentFreelancerId);
      
      const response = await freelancerAPI.getOffers(currentFreelancerId);
      
      let offersData = [];
      if (response?.data?.success && Array.isArray(response.data.data)) {
        offersData = response.data.data;
      } else if (Array.isArray(response?.data)) {
        offersData = response.data;
      } else if (Array.isArray(response)) {
        offersData = response;
      } else {
        console.warn('⚠️ Offers response format unexpected:', response);
        offersData = [];
      }
      
      const validOffers = offersData
        .filter(item => item && typeof item === 'object')
        .map((item, index) => ({
          _id: item._id || `offer-${Date.now()}-${index}`,
          title: item.title || 'Titre manquant',
          clientName: item.clientName || 'Client anonyme',
          status: item.status || 'pending',
          offerPrice: typeof item.offerPrice === 'number' ? item.offerPrice : 
                     typeof item.proposedPrice === 'number' ? item.proposedPrice : 0,
          currency: item.currency || 'MAD',
          timeline: item.timeline || 'Non spécifié',
          skills: Array.isArray(item.skills) ? item.skills : [],
          createdAt: item.createdAt || new Date(),
          description: item.description || item.offerDescription || '',
          offerDescription: item.offerDescription || item.description || '',
          isApplication: Boolean(item.isApplication)
        }));
      
      setOffers(validOffers);
      setError(prev => ({ ...prev, offers: null }));
      console.log('✅ Offers fetched successfully:', validOffers.length);
      
    } catch (err) {
      console.error('❌ Context: Error fetching offers:', err);
      
      if (err.response?.status === 404 || err.response?.status >= 500) {
        console.log('🧪 Using mock offers due to API error');
        const mockOffers = [
          {
            _id: 'mock-offer-1',
            title: 'Test - Développement Landing Page',
            clientName: 'Test Client',
            status: 'pending',
            offerPrice: 1200,
            currency: 'MAD',
            timeline: '7 jours',
            skills: ['React', 'JavaScript', 'CSS'],
            createdAt: new Date(),
            description: 'Offre de test pour vérifier l\'affichage',
            offerDescription: 'Candidature transformée en offre pour test',
            isApplication: true
          }
        ];
        setOffers(mockOffers);
        setError(prev => ({ ...prev, offers: null }));
      } else {
        setOffers([]);
        setError(prev => ({ 
          ...prev, 
          offers: `Erreur ${err.response?.status || 'réseau'}: ${err.response?.data?.message || err.message}` 
        }));
      }
    } finally {
      setLoading(prev => ({ ...prev, offers: false }));
      isFetchingOffers.current = false;
    }
  }, [currentFreelancerId]);

  // ✅ Amélioration de toggleSaveJob avec synchronisation
  const toggleSaveJob = useCallback(async (missionId) => {
    try {
      if (currentFreelancerId) {
        const response = await freelancerAPI.toggleSaveJob(currentFreelancerId, missionId);
        
        // Rafraîchir les saved jobs depuis le serveur
        await fetchSavedJobs();
        
        return response.data?.message || 'Job save status updated successfully';
      } else {
        // Logique localStorage (fallback)
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
        
        // Mettre à jour l'état isSaved dans la liste des jobs
        setJobs(prev => 
          prev.map(job => 
            job._id === missionId 
              ? { ...job, isSaved: !job.isSaved } 
              : job
          )
        );
        
        return 'Job save status updated successfully';
      }
    } catch (err) {
      console.error('Error toggling save job:', err);
      throw new Error(err.response?.data?.message || 'Error saving job');
    }
  }, [currentFreelancerId, fetchSavedJobs]);

  const applyForJob = useCallback(async (missionId, proposal) => {
    try {
      if (!currentFreelancerId) {
        throw new Error('Vous devez être connecté pour postuler');
      }

      console.log('🔄 Submitting application:', { missionId, proposal, freelancerId: currentFreelancerId });

      const response = await freelancerAPI.applyForJob(currentFreelancerId, missionId, proposal);
      
      console.log('✅ Application submitted successfully:', response);

      // ✅ Attendre un délai avant de refetch pour éviter les requêtes simultanées
      setTimeout(() => {
        fetchApplications();
        fetchOffers();
      }, 500);
      
      return response.data || response;
    } catch (err) {
      console.error('❌ Error applying for job:', err);
      
      if (err.response?.status === 409) {
        throw new Error('Vous avez déjà postulé à cette mission');
      }
      
      if (err.response?.status === 404) {
        throw new Error('Mission non trouvée');
      }

      throw new Error(err.response?.data?.message || err.message || 'Erreur lors de la candidature');
    }
  }, [currentFreelancerId, fetchApplications, fetchOffers]);

  const respondToOffer = useCallback(async (offerId, status) => {
    if (!currentFreelancerId) {
      throw new Error('Please login to respond to offers');
    }
    
    try {
      const response = await freelancerAPI.respondToOffer(currentFreelancerId, offerId, status);
      
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
  }, [currentFreelancerId]);

  const setFreelancerId = useCallback((id) => {
    console.log('🔄 Setting freelancer ID:', id);
    setCurrentFreelancerId(id);
    if (id) {
      localStorage.setItem('freelancerId', id);
    } else {
      localStorage.removeItem('freelancerId');
    }
  }, []);

  // ✅ useEffect UNIQUEMENT pour le chargement initial - PAS de refetch automatique
  useEffect(() => {
    console.log('🚀 FreelancerContext initializing with freelancer ID:', currentFreelancerId);
    
    // Charger les données seulement une fois au démarrage
    fetchJobs();
    
    if (currentFreelancerId) {
      fetchSavedJobs();
      fetchApplications();
      fetchOffers();
    }
  }, []); // ✅ AUCUNE DÉPENDANCE pour éviter les boucles

  // ✅ useEffect séparé pour les changements de freelancerId
  useEffect(() => {
    if (currentFreelancerId) {
      localStorage.setItem('freelancerId', currentFreelancerId);
    }
  }, [currentFreelancerId]);

  // ✅ Mémoriser la valeur du contexte
  const contextValue = React.useMemo(() => ({
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
    setFreelancerId,
  }), [
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
    setFreelancerId,
  ]);

  return (
    <FreelancerContext.Provider value={contextValue}>
      {children}
    </FreelancerContext.Provider>
  );
};

export const useFreelancer = () => {
  const context = useContext(FreelancerContext);
  if (context === undefined) {
    throw new Error('useFreelancer must be used within a FreelancerProvider');
  }
  return context;
};