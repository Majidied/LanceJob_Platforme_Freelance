import api from "./api"; 

// Fonctions individuelles (gardez-les si vous les utilisez ailleurs)
export const fetchFreelancers = async () => {
  const response = await api.get('/freelancer');
  return response.data;
};

export const createFreelancer = async (freelancerData) => {
  const response = await api.post(`/freelancer`, freelancerData);
  return response.data;
};

export const getFreelancer = async (id) => {
  const response = await api.get(`/freelancer/${id}`);
  return response.data;
};

// ✅ Nouvelle fonction pour mettre à jour un freelancer
export const updateFreelancer = async (id, updatedData) => {
  const response = await api.put(`/freelancer/${id}`, updatedData);
  return response.data;
};

// API Freelancer corrigée pour correspondre à votre backend
export const freelancerAPI = {
  // Get all available jobs (missions)
  getJobs: () => api.get('/mission'),
 
  // Get job details
  getJobDetails: (jobId) => api.get(`/mission/${jobId}`),
 
  // Save/unsave a job
  toggleSaveJob: (freelancerId, missionId) =>
    api.post('/freelancer/save-job', { freelancerId, missionId }),
 
  // Get saved jobs
  getSavedJobs: (freelancerId) =>
    api.get(`/freelancer/${freelancerId}/saved-jobs`),
 
  // Apply for a job
  applyForJob: (freelancerId, missionId, proposal) =>
    api.post('/freelancer/apply', { freelancerId, missionId, proposal }),
 
  // Get all applications (candidatures)
  getApplications: (freelancerId) =>
    api.get(`/freelancer/${freelancerId}/applications`),
 
  // Get all offers (offres reçues)
  getOffers: (freelancerId) =>
    api.get(`/freelancer/${freelancerId}/offers`),
 
  // Respond to an offer - CORRIGÉ: /freelancer au lieu de /freelancers
  respondToOffer: (freelancerId, offerId, status) =>
    api.post('/freelancer/respond-offer', { freelancerId, offerId, status })
};

export default freelancerAPI;