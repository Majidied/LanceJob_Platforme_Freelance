const Freelancer = require('../models/freelancer.model');
const Mission = require('../models/mission.model');
const mongoose = require('mongoose');


exports.getAllFreelancers = async () => {
  return await Freelancer.find({});
};

exports.getFreelancerById = async (id) => {
  return await Freelancer.findById(id);
};

exports.createFreelancer = async (freelancerData) => {
  const freelancer = new Freelancer(freelancerData);
  return await freelancer.save();
};

exports.updateFreelancer = async (id, freelancerData) => {
  return await Freelancer.findByIdAndUpdate(id, freelancerData, { new: true });
};

exports.deleteFreelancer = async (id) => {
  return await Freelancer.findByIdAndDelete(id);
};

// ✅ CORRECTION de la fonction applyForMission dans freelancer.service.js
exports.applyForMission = async (freelancerId, missionId, proposalData) => {
  console.log('🔍 Service - Vérification de la mission:', missionId);
  console.log('📝 Service - Proposal data received:', proposalData);
  
  // Check if mission exists
  const mission = await Mission.findById(missionId);
  console.log('📋 Mission trouvée:', mission ? {
    _id: mission._id,
    title: mission.title,
    status: mission.status,
    budget: mission.budget
  } : 'AUCUNE');
  
  if (!mission) {
    throw new Error('Mission not found');
  }
  
  // Optionnel: vérifier le statut de la mission
  if (mission.status === 'draft') {
    console.log('⚠️ Warning: Mission is in draft status');
    // Vous pouvez choisir de lever une erreur ou continuer
    // throw new Error('Mission is not published yet');
  }
  
  console.log('🔍 Vérification si déjà postulé pour freelancer:', freelancerId);
  
  // Check if already applied
  const alreadyApplied = await Freelancer.findOne({
    _id: freelancerId,
    'appliedMissions.mission': missionId
  });
  
  if (alreadyApplied) {
    console.log('❌ Déjà postulé');
    throw new Error('You have already applied for this mission');
  }
  
  console.log('✅ Pas encore postulé, création de la candidature...');
  
  // ✅ CORRECTION: Assurer que proposalData est un objet, puis stringify UNE SEULE FOIS
  let formattedProposal;
  if (typeof proposalData === 'object' && proposalData !== null) {
    // Valider les données importantes
    const validatedData = {
      coverLetter: proposalData.coverLetter || '',
      proposedPrice: Number(proposalData.proposedPrice) || 0,
      currency: proposalData.currency || 'MAD',
      deliveryTime: Number(proposalData.deliveryTime) || 0,
      attachments: proposalData.attachments || []
    };
    
    console.log('🔧 Service - Validated proposal data:', validatedData);
    formattedProposal = JSON.stringify(validatedData);
  } else if (typeof proposalData === 'string') {
    // Si déjà une string, l'utiliser directement
    formattedProposal = proposalData;
  } else {
    throw new Error('Invalid proposal data format');
  }
  
  console.log('💾 Service - Final formatted proposal:', formattedProposal);
  
  // Add to applied missions
  const result = await Freelancer.findByIdAndUpdate(
    freelancerId,
    {
      $push: {
        appliedMissions: {
          mission: missionId,
          applicationDate: new Date(),
          status: 'pending',
          proposal: formattedProposal
        }
      }
    },
    { new: true }
  ).populate('appliedMissions.mission');
  
  console.log('✅ Candidature créée avec succès');
  
  // Retourner la dernière candidature ajoutée pour vérification
  const lastApplication = result.appliedMissions[result.appliedMissions.length - 1];
  console.log('🔍 Service - Last application created:', {
    _id: lastApplication._id,
    proposal: lastApplication.proposal,
    parsedProposal: JSON.parse(lastApplication.proposal)
  });
  
  return result;
};
exports.getAppliedMissions = async (freelancerId) => {
  try {
    console.log('SERVICE: getAppliedMissions for freelancerId:', freelancerId);
    const freelancer = await Freelancer.findById(freelancerId)
      .populate({
        path: 'appliedMissions.mission',
        select: 'title description budget currency client tags deadline type',
        populate: {
          path: 'client',
          select: 'name email',
        },
      })
      .select('appliedMissions');

    if (!freelancer) {
      console.warn('SERVICE: Freelancer not found for ID:', freelancerId);
      return [];
    }

    if (!freelancer.appliedMissions || freelancer.appliedMissions.length === 0) {
      console.log('SERVICE: No applied missions found for freelancer:', freelancerId);
      return [];
    }

    return freelancer.appliedMissions
      .filter(app => {
        if (!app) {
          console.warn('SERVICE: Filtered out a null/undefined application object.');
          return false;
        }
        if (!app.mission) {
          console.warn(`SERVICE: Filtered out application ${app._id} due to missing mission data.`);
          return false; // Une mission est essentielle pour une candidature
        }
        return true;
      })
      .map(app => {
        let parsedProposal = {
          proposedPrice: 0,
          currency: 'MAD',
          deliveryTime: 0,
          coverLetter: '',
        };

        if (app.proposal) {
          try {
            const parsed = typeof app.proposal === 'string'
              ? JSON.parse(app.proposal)
              : app.proposal;

            parsedProposal.proposedPrice = Number(parsed.proposedPrice) || 0;
            parsedProposal.currency = parsed.currency || 'MAD';
            parsedProposal.deliveryTime = Number(parsed.deliveryTime) || 0;
            parsedProposal.coverLetter = parsed.coverLetter || '';
          } catch (e) {
            console.error(`SERVICE: Error parsing proposal for app ${app._id}:`, e.message, app.proposal);
          }
        } else {
           console.warn(`SERVICE: No proposal string found for app ${app._id}. Using defaults.`);
        }

        const missionData = app.mission; // Déjà filtré pour que app.mission existe
        const clientData = missionData.client || {};

        return {
          _id: app._id,
          missionId: missionData._id,
          missionTitle: missionData.title || 'Titre de mission non disponible',
          clientName: clientData.name || 'Client non spécifié',
          status: app.status || 'pending',
          proposedPrice: parsedProposal.proposedPrice,
          currency: parsedProposal.currency,
          deliveryTime: parsedProposal.deliveryTime,
          coverLetter: parsedProposal.coverLetter || app.message || '',
          appliedAt: app.applicationDate || new Date(),
          skills: missionData.tags || [],
          budget: missionData.budget || 0,
          timeline: missionData.deadline
            ? new Date(missionData.deadline).toLocaleDateString('fr-FR')
            : 'Non spécifié',
          description: missionData.description || '',
        };
      });
  } catch (error) {
    console.error('SERVICE: Critical error in getAppliedMissions:', error);
    throw error;
  }
};

exports.getOffers = async (freelancerId) => {
  try {
    console.log('SERVICE: getOffers for freelancerId:', freelancerId);
    const applications = await this.getAppliedMissions(freelancerId);

    if (!applications || applications.length === 0) {
      console.log('SERVICE: No applications found to format as offers.');
      return [];
    }

    return applications.map(app => {
      if (!app) {
          console.warn('SERVICE (getOffers): Encountered null application after getAppliedMissions.');
          return null;
      }
      return {
        _id: app._id,
        title: app.missionTitle,
        description: app.coverLetter || app.description,
        clientName: app.clientName,
        status: app.status,
        offerPrice: app.proposedPrice, // Mappage de proposedPrice vers offerPrice
        currency: app.currency,
        timeline: app.deliveryTime
          ? `${app.deliveryTime} jours`
          : app.timeline,
        skills: app.skills || [],
        createdAt: app.appliedAt,
        offerDescription: app.coverLetter || '',
        isApplication: true,
        applicationStatus: app.status,
      };
    }).filter(item => item !== null);
  } catch (error) {
    console.error('SERVICE: Critical error in getOffers:', error);
    throw error;
  }
};

exports.saveJob = async (freelancerId, missionId) => {
  // ... existing code for saveJob ...
  const freelancer = await Freelancer.findById(freelancerId);
  if (!freelancer) throw new Error('Freelancer not found');

  return await Freelancer.findByIdAndUpdate(
    freelancerId,
    { $addToSet: { savedJobs: missionId } }, // $addToSet pour éviter les doublons
    { new: true }
  ).populate('savedJobs');
};

exports.respondToOffer = async (freelancerId, offerId, status) => {
  if (!['accepted', 'rejected'].includes(status)) {
    throw new Error('Invalid status. Must be "accepted" or "rejected"');
  }
  
  // Si "offers" sont en fait des "appliedMissions" (candidatures)
  // Mettre à jour le statut de la candidature spécifique
  const updatedFreelancerDoc = await Freelancer.findOneAndUpdate(
    {
      _id: freelancerId,
      'appliedMissions._id': offerId 
    },
    {
      $set: { 'appliedMissions.$.status': status } 
    },
    { new: true }
  )
  .populate({
      path: 'appliedMissions.mission',
      select: 'title description budget currency client tags deadline type',
      populate: { path: 'client', select: 'name email' },
  });
  
  if (!updatedFreelancerDoc) {
    throw new Error('Freelancer not found or Application (Offer) ID does not match.');
  }
  
  // Retourner la candidature mise à jour
  const updatedApplication = updatedFreelancerDoc.appliedMissions.find(
    app => app._id.toString() === offerId.toString()
  );

  if (!updatedApplication) {
      throw new Error('Failed to find the updated application after status change.');
  }
  
exports.getSavedJobs = async (freelancerId) => {
  try {
    console.log('SERVICE: getSavedJobs for freelancerId:', freelancerId);
    
    const freelancer = await Freelancer.findById(freelancerId)
      .populate('savedJobs')
      .select('savedJobs');

    if (!freelancer) {
      throw new Error('Freelancer not found');
    }

    return freelancer.savedJobs || [];
  } catch (error) {
    console.error('SERVICE: Error in getSavedJobs:', error);
    throw error;
  }
};
  // Remapper pour correspondre à la structure attendue par le frontend si nécessaire
  // (similaire à la structure de getAppliedMissions)
  let parsedProposal = { proposedPrice: 0, currency: 'MAD', deliveryTime: 0, coverLetter: '' };
  if (updatedApplication.proposal) {
      try {
          const parsed = typeof updatedApplication.proposal === 'string' ? JSON.parse(updatedApplication.proposal) : updatedApplication.proposal;
          parsedProposal.proposedPrice = Number(parsed.proposedPrice) || 0;
          parsedProposal.currency = parsed.currency || 'MAD';
          parsedProposal.deliveryTime = Number(parsed.deliveryTime) || 0;
          parsedProposal.coverLetter = parsed.coverLetter || '';
      } catch (e) { /* defaults will be used */ }
  }

  return {
      _id: updatedApplication._id,
      missionId: updatedApplication.mission?._id,
      missionTitle: updatedApplication.mission?.title || 'Titre de mission non disponible',
      clientName: updatedApplication.mission?.client?.name || 'Client non spécifié',
      status: updatedApplication.status, // Le nouveau statut
      proposedPrice: parsedProposal.proposedPrice,
      currency: parsedProposal.currency,
      deliveryTime: parsedProposal.deliveryTime,
      coverLetter: parsedProposal.coverLetter || updatedApplication.message || '',
      appliedAt: updatedApplication.applicationDate || new Date(),
      skills: updatedApplication.mission?.tags || [],
      budget: updatedApplication.mission?.budget || 0,
      timeline: updatedApplication.mission?.deadline ? new Date(updatedApplication.mission.deadline).toLocaleDateString('fr-FR') : 'Non spécifié',
      description: updatedApplication.mission?.description || '',
  };
};
