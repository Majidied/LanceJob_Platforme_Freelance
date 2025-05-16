import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

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
