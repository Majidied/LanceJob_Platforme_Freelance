import api from './api'; 

export const uploadProfileImage = async (userId, file) => {
  const formData = new FormData();
  formData.append('profileImage', file);
  try {
    const response = await api.post(`/upload/profile-image/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Image upload response:', response.data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de l\'upload de l\'image'
    );
  }
};

export const deleteProfileImage = async (userId) => {
  try {
    const response = await api.delete(`/upload/profile-image/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Erreur lors de la suppression de l\'image'
    );
  }
};

export const getImageUrl = (filename) => {
  if (!filename) return null;
  
  // Ajout d'un timestamp pour éviter le cache
  const timestamp = Date.now();
  return `${api.defaults.baseURL}/upload/profile-image/${filename}?t=${timestamp}`;
};

