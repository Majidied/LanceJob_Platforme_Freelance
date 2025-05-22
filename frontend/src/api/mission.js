import api from "./api";


export const fetchMissions = async () => {
  const response = await api.get('/mission');
  return response.data;
};


export const createMission = async (missionData) => {
  const response = await api.post(`/mission`, missionData);
  return response.data;
};
export const getAllMissions = (filters = {}) => {
  return api.get('/missions', { params: filters });
};

// Récupérer les détails d'une mission
export const getMissionById = (id) => {
  return api.get(`/missions/${id}`);
};

// Rechercher des missions avec des filtres
export const searchMissions = (searchParams) => {
  return api.get('/missions/search', { params: searchParams });
};
