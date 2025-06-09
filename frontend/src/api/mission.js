import api from "./api";


export const fetchMissions = async () => {
  const response = await api.get('/mission');
  return response.data;
};


export const createMission = async (missionData) => {
  const response = await api.post(`/mission`, missionData);
  return response.data;
};

export const updateMission = async (id,updatedData) => {
  const response = await api.put(`/mission/${id}`,updatedData);
  return response.data;
};
export const submitApplication = async (missionId, applicationData) => {
  const response = await api.post(`/mission/${missionId}/apply`, applicationData);
  return response.data;
};

// Service pour récupérer les candidatures d'une mission (pour le client)
export const getMissionApplications = async (missionId) => {
  const response = await api.get(`/mission/${missionId}/applications`);
  return response.data;
};

// Service pour mettre à jour le statut d'une candidature
export const updateApplicationStatus = async (missionId, applicationId, status) => {
  const response = await api.put(`/mission/${missionId}/applications/${applicationId}`, { status });
  return response.data;
};
