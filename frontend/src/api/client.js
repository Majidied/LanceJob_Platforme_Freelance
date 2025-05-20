import api from "./api";

export const getClient = async (id) => {
  const response = await api.get(`/client/${id}`);
  return response.data;
};

export const fetchClients = async () => {
  const response = await api.get('/client');
  return response.data;
};

export const updateClient = async (id,updatedData) => {
  const response = await api.put(`/client/${id}`,updatedData);
  return response.data;
};
