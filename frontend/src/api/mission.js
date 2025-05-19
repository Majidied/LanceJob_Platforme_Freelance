import api from "./api";


export const fetchMissions = async () => {
  const response = await api.get('/mission');
  return response.data;
};


export const createMission = async (missionData) => {
  const response = await api.post(`/mission`, missionData);
  return response.data;
};
