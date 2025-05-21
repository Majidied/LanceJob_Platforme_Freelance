import api from "./api";

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
export const freelancerAPI = {
  // Get all available jobs
  getJobs: () => API.get('/missions'),
  
  // Get job details
  getJobDetails: (jobId) => API.get(`/missions/${jobId}`),
  
  // Save/unsave a job
  toggleSaveJob: (freelancerId, missionId) => 
    API.post('/freelancers/save-job', { freelancerId, missionId }),
  
  // Get saved jobs
  getSavedJobs: (freelancerId) => 
    API.get(`/freelancers/${freelancerId}/saved-jobs`),
  
  // Apply for a job
  applyForJob: (freelancerId, missionId, proposal) => 
    API.post('/freelancers/apply', { freelancerId, missionId, proposal }),
  
  // Get all applications
  getApplications: (freelancerId) => 
    API.get(`/freelancers/${freelancerId}/applications`),
  
  // Get all offers
  getOffers: (freelancerId) => 
    API.get(`/freelancers/${freelancerId}/offers`),
  
  // Respond to an offer
  respondToOffer: (freelancerId, offerId, status) => 
    API.post('/freelancers/respond-offer', { freelancerId, offerId, status })
};
export default freelancerAPI;
