// frontend/src/api/invitation.js
import api from './api';

// ✅ API pour les invitations côté client
export const invitationAPI = {
  // Inviter un freelancer à une mission
  inviteFreelancer: async (freelancerId, missionId, invitationData) => {
    const response = await api.post(
      `/invitations/freelancer/${freelancerId}/mission/${missionId}`,
      invitationData
    );
    return response.data;
  },

  // Obtenir toutes les invitations envoyées par un client
  getClientInvitations: async (clientId) => {
    const response = await api.get(`/invitations/client/${clientId}`);
    return response.data;
  },

  // Retirer une invitation
  withdrawInvitation: async (clientId, freelancerId, invitationId) => {
    const response = await api.delete(
      `/invitations/client/${clientId}/freelancer/${freelancerId}/invitation/${invitationId}`
    );
    return response.data;
  },

  // Répondre à une invitation (côté freelancer)
  respondToInvitation: async (freelancerId, invitationId, response, message) => {
    const result = await api.put(
      `/invitations/freelancer/${freelancerId}/invitation/${invitationId}/respond`,
      { response, message }
    );
    return result.data;
  }
};

export default invitationAPI;