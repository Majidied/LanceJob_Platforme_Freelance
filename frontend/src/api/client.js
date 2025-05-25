import api from "./api";


export const editClient = async (id) => {
  const response = await api.put(`/user/${id}`);
  return response.data;
};
