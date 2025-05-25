import api from "./api"; // Votre instance API existante

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

// API Freelancer corrigée pour correspondre à votre backend
export const freelancerAPI = {
  // Get all available jobs (missions)
  getJobs: () => api.get('/mission'),
 
  // Get job details
  getJobDetails: (jobId) => api.get(`/mission/${jobId}`),
 
  // Save/unsave a job
  toggleSaveJob: (freelancerId, missionId) =>
    api.post('/freelancers/save-job', { freelancerId, missionId }),
 
  // Get saved jobs
  getSavedJobs: (freelancerId) =>
    api.get(`/freelancers/${freelancerId}/saved-jobs`),
 
  // Apply for a job
  applyForJob: (freelancerId, missionId, proposal) =>
    api.post('/freelancers/apply', { freelancerId, missionId, proposal }),
 
  // Get all applications
  getApplications: (freelancerId) =>
    api.get(`/freelancers/${freelancerId}/applications`),
 
  // Get all offers
  getOffers: (freelancerId) =>
    api.get(`/freelancers/${freelancerId}/offers`),
 
  // Respond to an offer
  respondToOffer: (freelancerId, offerId, status) =>
    api.post('/freelancers/respond-offer', { freelancerId, offerId, status })
};

export default freelancerAPI;