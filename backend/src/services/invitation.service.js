// backend/src/services/invitation.service.js
const Freelancer = require('../models/freelancer.model');
const Mission = require('../models/mission.model');
const Client = require('../models/client.model');

// ✅ Inviter un freelancer à une mission
exports.inviteFreelancer = async (clientId, freelancerId, missionId, invitationData) => {
  try {
    console.log('🔄 Service: Inviting freelancer', { clientId, freelancerId, missionId });

    // Vérifier que la mission existe et appartient au client
    const mission = await Mission.findOne({ _id: missionId, client: clientId });
    if (!mission) {
      throw new Error('Mission not found or you do not have permission');
    }

    // Vérifier que le freelancer existe
    const freelancer = await Freelancer.findById(freelancerId);
    if (!freelancer) {
      throw new Error('Freelancer not found');
    }

    // Vérifier que le client existe
    const client = await Client.findById(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    // Vérifier qu'il n'y a pas déjà une invitation en cours
    const existingOffer = freelancer.offers.find(offer => 
      offer.mission.toString() === missionId && 
      offer.client.toString() === clientId &&
      offer.status === 'pending'
    );

    if (existingOffer) {
      throw new Error('An invitation is already pending for this mission');
    }

    // Créer l'invitation
    const invitation = {
      mission: missionId,
      client: clientId,
      invitationDate: new Date(),
      status: 'pending',
      type: 'invitation',
      message: invitationData.message,
      proposedPrice: invitationData.proposedPrice,
      currency: invitationData.currency || 'MAD',
      deadline: invitationData.deadline,
      requirements: invitationData.requirements,
      invitationDetails: {
        urgency: invitationData.urgency || 'medium',
        estimatedDuration: invitationData.estimatedDuration,
        startDate: invitationData.startDate
      }
    };

    // Ajouter l'invitation au freelancer
    freelancer.offers.push(invitation);
    await freelancer.save();

    // Populer les données pour la réponse
    const updatedFreelancer = await Freelancer.findById(freelancerId)
      .populate({
        path: 'offers.mission',
        select: 'title description tags budget deadline'
      })
      .populate({
        path: 'offers.client',
        select: 'name email'
      });

    console.log('✅ Service: Invitation sent successfully');
    
    return {
      success: true,
      message: 'Invitation sent successfully',
      invitation: updatedFreelancer.offers[updatedFreelancer.offers.length - 1]
    };

  } catch (error) {
    console.error('❌ Service: Error inviting freelancer:', error);
    throw error;
  }
};

// ✅ Obtenir toutes les invitations envoyées par un client
exports.getClientInvitations = async (clientId) => {
  try {
    console.log('🔄 Service: Getting client invitations for:', clientId);

    // Trouver tous les freelancers qui ont des offres de ce client
    const freelancersWithOffers = await Freelancer.find({
      'offers.client': clientId
    })
    .populate({
      path: 'offers.mission',
      select: 'title description tags budget deadline'
    })
    .populate({
      path: 'offers.client',
      select: 'name email'
    })
    .select('name email offers');

    // Extraire et formater les invitations
    const invitations = [];
    freelancersWithOffers.forEach(freelancer => {
      freelancer.offers.forEach(offer => {
        if (offer.client._id.toString() === clientId) {
          invitations.push({
            _id: offer._id,
            freelancer: {
              _id: freelancer._id,
              name: freelancer.name,
              email: freelancer.email
            },
            mission: offer.mission,
            client: offer.client,
            invitationDate: offer.invitationDate,
            status: offer.status,
            type: offer.type,
            message: offer.message,
            proposedPrice: offer.proposedPrice,
            currency: offer.currency,
            deadline: offer.deadline,
            requirements: offer.requirements,
            invitationDetails: offer.invitationDetails
          });
        }
      });
    });

    console.log('✅ Service: Found', invitations.length, 'invitations');
    return invitations;

  } catch (error) {
    console.error('❌ Service: Error getting client invitations:', error);
    throw error;
  }
};

// ✅ Répondre à une invitation (côté freelancer)
exports.respondToInvitation = async (freelancerId, invitationId, response, responseMessage) => {
  try {
    console.log('🔄 Service: Freelancer responding to invitation', { 
      freelancerId, 
      invitationId, 
      response 
    });

    if (!['accepted', 'rejected'].includes(response)) {
      throw new Error('Invalid response. Must be "accepted" or "rejected"');
    }

    const freelancer = await Freelancer.findById(freelancerId);
    if (!freelancer) {
      throw new Error('Freelancer not found');
    }

    // Trouver l'invitation
    const invitation = freelancer.offers.id(invitationId);
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new Error('This invitation has already been responded to');
    }

    // Mettre à jour le statut
    invitation.status = response;
    if (responseMessage) {
      invitation.responseMessage = responseMessage;
    }
    invitation.responseDate = new Date();

    await freelancer.save();

    // Si acceptée, on peut optionnellement créer une application automatique
    if (response === 'accepted') {
      // Logique additionnelle si nécessaire (ex: créer une candidature automatique)
    }

    console.log('✅ Service: Response recorded successfully');
    
    return {
      success: true,
      message: `Invitation ${response} successfully`,
      invitation
    };

  } catch (error) {
    console.error('❌ Service: Error responding to invitation:', error);
    throw error;
  }
};

// ✅ Retirer une invitation (côté client)
exports.withdrawInvitation = async (clientId, freelancerId, invitationId) => {
  try {
    console.log('🔄 Service: Withdrawing invitation', { 
      clientId, 
      freelancerId, 
      invitationId 
    });

    const freelancer = await Freelancer.findById(freelancerId);
    if (!freelancer) {
      throw new Error('Freelancer not found');
    }

    // Trouver l'invitation
    const invitation = freelancer.offers.id(invitationId);
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    // Vérifier que c'est bien le client qui a envoyé l'invitation
    if (invitation.client.toString() !== clientId) {
      throw new Error('You can only withdraw your own invitations');
    }

    if (invitation.status !== 'pending') {
      throw new Error('Can only withdraw pending invitations');
    }

    // Marquer comme retirée
    invitation.status = 'withdrawn';
    invitation.withdrawnDate = new Date();

    await freelancer.save();

    console.log('✅ Service: Invitation withdrawn successfully');
    
    return {
      success: true,
      message: 'Invitation withdrawn successfully'
    };

  } catch (error) {
    console.error('❌ Service: Error withdrawing invitation:', error);
    throw error;
  }
};