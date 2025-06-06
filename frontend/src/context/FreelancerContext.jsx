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

  // ✅ TOUTES LES FONCTIONS DECLAREES EN PREMIER

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
        isSaved: savedJobsLocal.includes(job._id),
        // Mapper les champs pour compatibilité avec l'interface
        price: job.budget || job.price,
        timeline: job.deadline ? new Date(job.deadline).toLocaleDateString('fr-FR') : job.timeline,
        priceType: job.type || job.priceType || 'Fixed',
        experienceLevel: job.experience || job.experienceLevel || 'Intermediate',
        skills: job.tags || job.skills || [],
        currency: job.currency || 'MAD'
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
      console.log('🔄 Fetching applications for freelancer:', currentFreelancerId);
      
      const response = await freelancerAPI.getApplications(currentFreelancerId);
      console.log('📦 Applications response:', response);
      
      const applicationsData = response.data?.data || response.data || response;
      console.log('📋 Applications data:', applicationsData);

      // ✅ AJOUT de proposedPrice qui manquait
      const formattedApplications = applicationsData.map(app => {
        let parsedProposal = {};
        try {
          parsedProposal = typeof app.proposal === 'string' ? JSON.parse(app.proposal) : app.proposal;
        } catch (e) {
          parsedProposal = { coverLetter: app.proposal };
        }

        return {
          _id: app._id,
          missionTitle: app.mission?.title || app.missionTitle || 'Mission supprimée',
          missionId: app.mission?._id || app.missionId,
          clientName: app.mission?.client?.name || app.clientName || 'Client anonyme',
          status: app.status,
          proposedPrice: parsedProposal.proposedPrice || 0, // ✅ AJOUT de cette ligne
          currency: parsedProposal.currency || 'MAD',
          deliveryTime: parsedProposal.deliveryTime || 0,
          coverLetter: parsedProposal.coverLetter || '',
          appliedAt: app.applicationDate || app.appliedAt,
          skills: app.mission?.skills || app.skills || []
        };
      });
      
      setAppliedJobs(formattedApplications);
      setError(prev => ({ ...prev, appliedJobs: null }));
    } catch (err) {
      console.error('❌ Error fetching applications:', err);
      console.log('📍 API endpoint called:', `/freelancers/${currentFreelancerId}/applications`);
      console.log('📍 Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      
      // Si l'endpoint n'existe pas (404) ou autre erreur serveur, utiliser mock temporairement
      if (err.response?.status === 404 || err.response?.status >= 500) {
        console.log('🧪 Endpoint non implémenté ou erreur serveur - Utilisation de données mock');
        const mockApplications = [
          {
            _id: '1',
            missionTitle: 'Développement d\'une application mobile',
            clientName: 'TechCorp',
            status: 'pending',
            proposedPrice: 1200,
            currency: 'MAD',
            deliveryTime: 14,
            coverLetter: 'Je suis très intéressé par votre projet de développement d\'application mobile...',
            appliedAt: new Date().toISOString(),
            skills: ['React Native', 'JavaScript', 'Node.js']
          }
        ];
        setAppliedJobs(mockApplications);
        setError(prev => ({ ...prev, appliedJobs: null }));
      } else {
        setError(prev => ({ 
          ...prev, 
          appliedJobs: `Erreur ${err.response?.status || 'réseau'}: ${err.response?.data?.message || err.message}` 
        }));
      }
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
      console.log('🔄 Context: Fetching offers for freelancer:', currentFreelancerId);
      
      const response = await freelancerAPI.getOffers(currentFreelancerId);
      console.log('📦 Context: Offers response:', response);
      
      // Extraction sécurisée des données
      let offersData = [];
      if (response?.data?.success && Array.isArray(response.data.data)) {
        offersData = response.data.data;
      } else if (Array.isArray(response?.data)) {
        offersData = response.data;
      } else if (Array.isArray(response)) {
        offersData = response;
      }
      
      console.log('💼 Context: Extracted offers data:', offersData);
      
      // Validation et nettoyage des données
      const validOffers = offersData
        .filter(item => item && typeof item === 'object')
        .map(item => ({
          _id: item._id || `offer-${Date.now()}-${Math.random()}`,
          title: item.title || 'Titre manquant',
          clientName: item.clientName || 'Client anonyme',
          status: item.status || 'pending',
          offerPrice: typeof item.offerPrice === 'number' ? item.offerPrice : 0,
          currency: item.currency || 'MAD',
          timeline: item.timeline || 'Non spécifié',
          skills: Array.isArray(item.skills) ? item.skills : [],
          createdAt: item.createdAt || new Date(),
          description: item.description || item.offerDescription || '',
          offerDescription: item.offerDescription || item.description || '',
          isApplication: Boolean(item.isApplication)
        }));
      
      console.log('✅ Context: Valid offers after processing:', validOffers.length);
      setOffers(validOffers);
      setError(prev => ({ ...prev, offers: null }));
      
    } catch (err) {
      console.error('❌ Context: Error fetching offers:', err);
      console.log('📍 API endpoint called:', `/freelancers/${currentFreelancerId}/offers`);
      console.log('📍 Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      
      // Si l'endpoint n'existe pas (404) ou autre erreur serveur, utiliser mock temporairement
      if (err.response?.status === 404 || err.response?.status >= 500) {
        console.log('🧪 Endpoint non implémenté ou erreur serveur - Utilisation de données de test');
        const mockOffers = [
          {
            _id: 'test-offer-1',
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
    try {
      // Vérifier si on a un freelancerId
      if (!currentFreelancerId) {
        throw new Error('Vous devez être connecté pour postuler');
      }

      console.log('🔄 Submitting application:', { missionId, proposal, freelancerId: currentFreelancerId });

      const response = await freelancerAPI.applyForJob(currentFreelancerId, missionId, proposal);
      
      console.log('✅ Application submitted successfully:', response);

      // Rafraîchir la liste des candidatures ET des offres
      await fetchApplications();
      await fetchOffers();
      
      return response.data || response;
    } catch (err) {
      console.error('❌ Error applying for job:', err);
      
      // Si c'est une erreur 409 (déjà postulé)
      if (err.response?.status === 409) {
        throw new Error('Vous avez déjà postulé à cette mission');
      }
      
      // Si c'est une erreur 404 (mission non trouvée)
      if (err.response?.status === 404) {
        throw new Error('Mission non trouvée');
      }

      // Pour les autres erreurs
      throw new Error(err.response?.data?.message || err.message || 'Erreur lors de la candidature');
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

  // ✅ useEffect APRES toutes les déclarations de fonctions
  useEffect(() => {
    fetchJobs();
    if (currentFreelancerId) {
      fetchSavedJobs();
      fetchApplications();
      fetchOffers();
    }
  }, [currentFreelancerId]);

  // ✅ RETURN à la fin
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
        setFreelancerId,
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