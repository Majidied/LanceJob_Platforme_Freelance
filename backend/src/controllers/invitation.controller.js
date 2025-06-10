// backend/src/controllers/invitation.controller.js
const invitationService = require('../services/invitation.service');

// ✅ Inviter un freelancer à une mission
exports.inviteFreelancer = async (req, res, next) => {
  try {
    const { freelancerId, missionId } = req.params;
    const { clientId } = req.body; // En production, récupérer depuis req.user
    const invitationData = req.body;

    console.log('🔍 Controller: Invite freelancer request:', {
      freelancerId,
      missionId,
      clientId,
      invitationData
    });

    // Validation des données requises
    if (!invitationData.message || !invitationData.proposedPrice) {
      return res.status(400).json({
        success: false,
        message: 'Message and proposed price are required'
      });
    }

    const result = await invitationService.inviteFreelancer(
      clientId,
      freelancerId,
      missionId,
      invitationData
    );

    res.status(201).json(result);

  } catch (error) {
    console.error('❌ Controller: Error in inviteFreelancer:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('already pending')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    next(error);
  }
};

// ✅ Obtenir les invitations envoyées par un client
exports.getClientInvitations = async (req, res, next) => {
  try {
    const { clientId } = req.params;

    console.log('🔍 Controller: Get client invitations for:', clientId);

    const invitations = await invitationService.getClientInvitations(clientId);

    res.status(200).json({
      success: true,
      data: invitations
    });

  } catch (error) {
    console.error('❌ Controller: Error in getClientInvitations:', error);
    next(error);
  }
};

// ✅ Répondre à une invitation (côté freelancer)
exports.respondToInvitation = async (req, res, next) => {
  try {
    const { freelancerId, invitationId } = req.params;
    const { response, message } = req.body;

    console.log('🔍 Controller: Respond to invitation:', {
      freelancerId,
      invitationId,
      response
    });

    const result = await invitationService.respondToInvitation(
      freelancerId,
      invitationId,
      response,
      message
    );

    res.status(200).json(result);

  } catch (error) {
    console.error('❌ Controller: Error in respondToInvitation:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('Invalid response') || error.message.includes('already been responded')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    next(error);
  }
};

// ✅ Retirer une invitation (côté client)
exports.withdrawInvitation = async (req, res, next) => {
  try {
    const { clientId, freelancerId, invitationId } = req.params;

    console.log('🔍 Controller: Withdraw invitation:', {
      clientId,
      freelancerId,
      invitationId
    });

    const result = await invitationService.withdrawInvitation(
      clientId,
      freelancerId,
      invitationId
    );

    res.status(200).json(result);

  } catch (error) {
    console.error('❌ Controller: Error in withdrawInvitation:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('only withdraw') || error.message.includes('only pending')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    next(error);
  }
};