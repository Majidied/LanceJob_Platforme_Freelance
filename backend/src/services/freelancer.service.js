const Freelancer = require('../models/freelancer.model');
const { Client } = require('@elastic/elasticsearch');
const esClient = new Client({ node: 'http://localhost:9200' });
const mongoose = require('mongoose');
// Test Elasticsearch connection
const testESConnection = async () => {
  try {
    const health = await esClient.cluster.health();
    console.log('Elasticsearch connection successful:', health);
    return true;
  } catch (error) {
    console.error('Elasticsearch connection failed:', error.message);
    return false;
  }
};

exports.getAllFreelancers = async () => {
  return await Freelancer.find({});
}       

exports.getFreelancerById = async (id) => {
  return await Freelancer.findById(id);
}

exports.createFreelancer = async (freelancerData) => {
  console.log('Creating freelancer with data:', freelancerData);
  
  const freelancer = new Freelancer(freelancerData);
  const savedFreelancer = await freelancer.save();
  
  console.log('Freelancer saved to MongoDB:', savedFreelancer._id);

  // Test ES connection before indexing
  const isESConnected = await testESConnection();
  if (!isESConnected) {
    console.error('Skipping Elasticsearch indexing - connection failed');
    return savedFreelancer;
  }

  // Index the freelancer in Elasticsearch after saving
  try {
    console.log('Attempting to index freelancer in Elasticsearch...');
    const indexResult = await exports.indexFreelancer(savedFreelancer);
    console.log('Elasticsearch indexing successful:', indexResult);
  } catch (error) {
    console.error('Elasticsearch indexing error (createFreelancer):', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
  }

  return savedFreelancer;
};

exports.updateFreelancer = async (id, freelancerData) => {
  const updatedFreelancer = await Freelancer.findByIdAndUpdate(id, freelancerData, { new: true });

  if (updatedFreelancer) {
    try {
      console.log('Updating freelancer index in Elasticsearch...');
      await exports.updateFreelancerIndex(updatedFreelancer);
      console.log('Elasticsearch update successful');
    } catch (error) {
      console.error('Elasticsearch update error (updateFreelancer):', error);
    }
  }

  return updatedFreelancer;
};

exports.deleteFreelancer = async (id) => {
  const deletedFreelancer = await Freelancer.findByIdAndDelete(id);

  if (deletedFreelancer) {
    try {
      console.log('Deleting freelancer from Elasticsearch index...');
      await exports.deleteFreelancerIndex(id);
      console.log('Elasticsearch delete successful');
    } catch (error) {
      console.error('Elasticsearch delete error (deleteFreelancer):', error);
    }
  }

  return deletedFreelancer;
};

exports.searchFreelancers = async (searchText) => {
  console.log('Searching for:', searchText);
  
  // First, check if index exists and has documents
  try {
    const indexExists = await esClient.indices.exists({ index: 'freelancers' });
    console.log('Index exists:', indexExists);
    
    if (indexExists) {
      const count = await esClient.count({ index: 'freelancers' });
      console.log('Total documents in index:', count.count);
      
      // Get a sample document to verify structure
      const sampleDocs = await esClient.search({
        index: 'freelancers',
        size: 1
      });
      console.log('Sample document:', JSON.stringify(sampleDocs.hits.hits[0], null, 2));
    }
  } catch (error) {
    console.error('Error checking index status:', error);
  }

  const should = [];

  if (searchText) {
    should.push(
      { match: { bio: { query: searchText.toLowerCase(), boost: 5 } } },
      { match: { skills: { query: searchText.toLowerCase(), boost: 3 } } }
    );
  }

  const esQuery = {
    index: 'freelancers',
    from: 0,
    size: 10,
    query: {
      bool: {
        should: should,
        minimum_should_match: 1
      }
    },
    sort: [{ _score: 'desc' }]
  };

  try {
    console.log('Elasticsearch Query:', JSON.stringify(esQuery, null, 2));
    const result = await esClient.search(esQuery);
    
    console.log('Elasticsearch Response hits count:', result.hits.total.value);
    console.log('First few results:', JSON.stringify(result.hits.hits.slice(0, 2), null, 2));
    
    if (!result.hits.hits.length) {
      console.warn('No freelancers found for search:', searchText);
      return [];
    }
    return result.hits.hits.map(hit => hit._source);
  } catch (error) {
    console.error('Elasticsearch search error:', error);
    throw new Error('Failed to search freelancers');
  }
};

exports.checkAndFixIndexMapping = async () => {
  try {
    const indexExists = await esClient.indices.exists({ index: 'freelancers' });
    
    if (!indexExists) {
      console.log('Creating freelancers index with proper mapping...');
      const response = await esClient.indices.create({
        index: 'freelancers',
        body: {
          mappings: {
            properties: {
              _id: { type: 'keyword' },
              phone: { 
                type: 'text',
                fields: { keyword: { type: 'keyword' } }
              },
              bio: {
                type: 'text',
                analyzer: 'standard',
                fields: { keyword: { type: 'keyword' } }
              },
              skills: {
                type: 'text',
                analyzer: 'standard',
                fields: { keyword: { type: 'keyword' } }
              },
              address: {
                type: 'text',
                fields: { keyword: { type: 'keyword' } }
              },
              history: { type: 'text' },
              experience: { type: 'text' }
            }
          }
        }
      });
      console.log('Index creation response:', response);
    } else {
      const mapping = await esClient.indices.getMapping({ index: 'freelancers' });
      console.log('Current mapping:', JSON.stringify(mapping, null, 2));
    }
  } catch (error) {
    console.error('Error checking/creating index:', error);
  }
};

exports.indexFreelancer = async (freelancer) => {
  console.log('Indexing freelancer:', freelancer._id);
  console.log('Freelancer data to index:', {
    phone: freelancer.phone,
    bio: freelancer.bio,
    skills: freelancer.skills,
    address: freelancer.address,
    history: freelancer.history,
    experience: freelancer.experience
  });

  try {
    const result = await esClient.index({
      index: 'freelancers',
      id: freelancer._id.toString(), // ID goes here as parameter
      body: {
        // Remove _id from body - it's automatically handled by Elasticsearch
        phone: freelancer.phone,
        bio: freelancer.bio,
        skills: freelancer.skills,
        address: freelancer.address,
        history: freelancer.history,
        experience: freelancer.experience
      }
    });
    
    console.log('Index operation result:', result);
    
    // Force refresh to make document immediately searchable
    await esClient.indices.refresh({ index: 'freelancers' });
    console.log('Index refreshed');
    
    return result;
  } catch (error) {
    console.error('Error during indexing:', error);
    throw error;
  }
};

exports.updateFreelancerIndex = async (freelancer) => {
  try {
    const result = await esClient.update({
      index: 'freelancers',
      id: freelancer._id.toString(),
      body: {
        doc: {
          phone: freelancer.phone,
          bio: freelancer.bio,
          skills: freelancer.skills,
          address: freelancer.address,
          history: freelancer.history,
          experience: freelancer.experience
        }
      }
    });
    
    await esClient.indices.refresh({ index: 'freelancers' });
    return result;
  } catch (error) {
    console.error('Error during update:', error);
    throw error;
  }
};

exports.deleteFreelancerIndex = async (id) => {
  try {
    const result = await esClient.delete({
      index: 'freelancers',
      id: id.toString()
    });
    
    await esClient.indices.refresh({ index: 'freelancers' });
    return result;
  } catch (error) {
    console.error('Error during delete:', error);
    throw error;
  }
};

// Add utility function to manually reindex all freelancers
exports.reindexAllFreelancers = async () => {
  console.log('Starting reindex of all freelancers...');
  
  try {
    // Get all freelancers from MongoDB
    const freelancers = await Freelancer.find({});
    console.log(`Found ${freelancers.length} freelancers in MongoDB`);
    
    // Clear existing index
    try {
      await esClient.indices.delete({ index: 'freelancers' });
      console.log('Deleted existing index');
    } catch (error) {
      console.log('Index did not exist or could not be deleted');
    }
    
    // Recreate index with proper mapping
    await exports.checkAndFixIndexMapping();
    
    // Index each freelancer
    for (const freelancer of freelancers) {
      await exports.indexFreelancer(freelancer);
      console.log(`Indexed freelancer: ${freelancer._id}`);
    }
    
    console.log('Reindexing completed successfully');
    return { success: true, count: freelancers.length };
  } catch (error) {
    console.error('Error during reindexing:', error);
    return { success: false, error: error.message };
  }
};






// ✅ CORRECTION COMPLÈTE de la fonction applyForMission
exports.applyForMission = async (freelancerId, missionId, proposalData) => {
  console.log('🔍 Service - Vérification de la mission:', missionId);
  console.log('📝 Service - Proposal data received:', proposalData);
  
  // ✅ 1. Vérifier que le freelancer existe AVANT tout
  const freelancerExists = await Freelancer.findById(freelancerId);
  if (!freelancerExists) {
    console.error(`❌ Freelancer non trouvé avec l'ID: ${freelancerId}`);
    throw new Error(`Freelancer not found with ID: ${freelancerId}`);
  }
  console.log('✅ Freelancer trouvé:', freelancerExists._id);
  
  // ✅ 2. Check if mission exists
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
  
  // ✅ 3. Check if already applied - AMÉLIORATION avec vérification plus robuste
  const alreadyAppliedFreelancer = await Freelancer.findOne({
    _id: freelancerId,
    'appliedMissions.mission': missionId
  });

  const alreadyAppliedMission = await Mission.findOne({
    _id: missionId,
    'applications.freelancer': freelancerId
  });

  if (alreadyAppliedFreelancer || alreadyAppliedMission) {
    console.log('❌ Déjà postulé');
    throw new Error('You have already applied for this mission');
  }
  
  console.log('✅ Pas encore postulé, création de la candidature...');
  
  // ✅ 4. CORRECTION: Assurer que proposalData est un objet, puis stringify UNE SEULE FOIS
  let formattedProposal;
  let parsedProposalData = {};

  if (typeof proposalData === 'object' && proposalData !== null) {
    // Valider les données importantes
    const validatedData = {
      coverLetter: proposalData.coverLetter || '',
      proposedPrice: Number(proposalData.proposedPrice) || 0,
      currency: proposalData.currency || 'MAD',
      deliveryTime: proposalData.deliveryTime || 0,
      attachments: proposalData.attachments || []
    };
    
    parsedProposalData = validatedData;
    
    console.log('🔧 Service - Validated proposal data:', validatedData);
    formattedProposal = JSON.stringify(validatedData);
  } else if (typeof proposalData === 'string') {
    // Si déjà une string, l'utiliser directement
    formattedProposal = proposalData;
    try {
      parsedProposalData = JSON.parse(proposalData);
    } catch (e) {
      console.warn('Could not parse existing proposal string');
    }
  } else {
    throw new Error('Invalid proposal data format');
  }
  
  console.log('💾 Service - Final formatted proposal:', formattedProposal);
  
  // ✅ 5. VERSION SANS TRANSACTION (pour MongoDB standalone)
  let updatedFreelancer;
  let updatedMission;

  try {
    // ✅ 5a. Mettre à jour le freelancer d'abord
    updatedFreelancer = await Freelancer.findByIdAndUpdate(
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
    );
    
    if (!updatedFreelancer) {
      throw new Error(`Failed to update freelancer with ID: ${freelancerId}`);
    }
    
    console.log('✅ Freelancer mis à jour avec succès');
    
    // ✅ 5b. Mettre à jour la mission
    updatedMission = await Mission.findByIdAndUpdate(
      missionId,
      {
        $push: {
          applications: {
            freelancer: freelancerId,
            applicationDate: new Date(),
            message: parsedProposalData.coverLetter || '',
            proposedPrice: parsedProposalData.proposedPrice || 0,
            proposedDuration:parsedProposalData.deliveryTime|| 0,
            status: 'pending'
          }
        }
      },
      { new: true }
    );
    
    if (!updatedMission) {
      // ❌ Si la mission échoue, annuler la mise à jour du freelancer
      console.error('❌ Échec de la mise à jour de la mission, annulation...');
      
      await Freelancer.findByIdAndUpdate(
        freelancerId,
        {
          $pull: {
            appliedMissions: { mission: missionId }
          }
        }
      );
      
      throw new Error(`Failed to update mission with ID: ${missionId}`);
    }
    
    console.log('✅ Mission mise à jour avec succès');
    console.log('✅ Candidature ajoutée dans les deux modèles');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    
    // Si on a réussi à mettre à jour le freelancer mais pas la mission, annuler
    if (updatedFreelancer && !updatedMission) {
      console.log('🔄 Annulation de la mise à jour du freelancer...');
      try {
        await Freelancer.findByIdAndUpdate(
          freelancerId,
          {
            $pull: {
              appliedMissions: { mission: missionId }
            }
          }
        );
        console.log('✅ Mise à jour du freelancer annulée');
      } catch (rollbackError) {
        console.error('❌ Erreur lors de l\'annulation:', rollbackError);
      }
    }
    
    throw error;
  }

  // ✅ 6. Récupérer le freelancer mis à jour avec les données populées
  const result = await Freelancer.findById(freelancerId)
    .populate('appliedMissions.mission');
    
  // ✅ CORRECTION CRITIQUE: Vérifier si result est null
  if (!result) {
    console.error(`❌ Échec de la mise à jour du freelancer avec l'ID: ${freelancerId}`);
    throw new Error(`Failed to update freelancer with ID: ${freelancerId}`);
  }
  
  console.log('✅ Candidature créée avec succès');
  
  // ✅ 7. Vérification supplémentaire avant d'accéder aux appliedMissions
  if (!result.appliedMissions || result.appliedMissions.length === 0) {
    console.error('❌ Aucune candidature trouvée après la mise à jour');
    throw new Error('No applied missions found after update');
  }
  
  // Retourner la dernière candidature ajoutée pour vérification
  const lastApplication = result.appliedMissions[result.appliedMissions.length - 1];
  console.log('🔍 Service - Last application created:', {
    _id: lastApplication._id,
    proposal: lastApplication.proposal
  });
  
  // ✅ 8. Sécuriser le parsing pour les logs
  try {
    const parsedProposal = JSON.parse(lastApplication.proposal);
    console.log('📋 Parsed proposal:', parsedProposal);
  } catch (parseError) {
    console.warn('⚠️ Could not parse proposal for logging:', parseError.message);
  }
  
  return result;
};

// ✅ FONCTION UTILITAIRE: Pour débugger un freelancer spécifique
exports.debugFreelancer = async (freelancerId) => {
  try {
    console.log(`🔍 Debugging freelancer: ${freelancerId}`);
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(freelancerId)) {
      console.log('❌ ID freelancer invalide');
      return { error: 'Invalid freelancer ID format' };
    }
    
    const freelancer = await Freelancer.findById(freelancerId);
    
    if (!freelancer) {
      console.log('❌ Freelancer non trouvé');
      return { error: 'Freelancer not found' };
    }

    console.log('📋 Freelancer data:');
    console.log('- ID:', freelancer._id);
    console.log('- Name:', freelancer.name || freelancer.firstName + ' ' + freelancer.lastName);
    console.log('- Email:', freelancer.email);
    console.log('- appliedMissions exists:', freelancer.appliedMissions !== undefined);
    console.log('- appliedMissions type:', typeof freelancer.appliedMissions);
    console.log('- appliedMissions length:', freelancer.appliedMissions?.length || 'N/A');

    return {
      success: true,
      freelancer: {
        id: freelancer._id,
        name: freelancer.name || `${freelancer.firstName} ${freelancer.lastName}`,
        email: freelancer.email,
        appliedMissionsCount: freelancer.appliedMissions?.length || 0
      }
    };
  } catch (error) {
    console.error('❌ Error debugging freelancer:', error);
    return { error: error.message };
  }
};

// ✅ MIGRATION: Pour corriger les freelancers existants sans appliedMissions
exports.fixFreelancersWithoutAppliedMissions = async () => {
  try {
    console.log('🔧 Fixing freelancers without appliedMissions...');
    
    const result = await Freelancer.updateMany(
      { 
        $or: [
          { appliedMissions: { $exists: false } },
          { appliedMissions: null }
        ]
      },
      { $set: { appliedMissions: [] } }
    );

    console.log(`✅ Fixed ${result.modifiedCount} freelancers`);
    return result;
  } catch (error) {
    console.error('❌ Error fixing freelancers:', error);
    throw error;
  }
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
            parsedProposal.deliveryTime = parsed.deliveryTime || 0;
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
        offerPrice: app.proposedPrice, 
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


// Extrait de freelancer.service.js - Fonction saveJob améliorée

exports.saveJob = async (freelancerId, missionId) => {
  try {
    console.log('🔄 Service: Toggle saved job for freelancer:', freelancerId, 'mission:', missionId);
    
    const freelancer = await Freelancer.findById(freelancerId);
    if (!freelancer) {
      throw new Error('Freelancer not found');
    }

    // Vérifier si la mission existe
    const mission = await Mission.findById(missionId);
    if (!mission) {
      throw new Error('Mission not found');
    }

    // Vérifier si le job est déjà sauvegardé
    const isAlreadySaved = freelancer.savedJobs.some(
      savedJobId => savedJobId.toString() === missionId.toString()
    );

    let updatedFreelancer;
    
    if (isAlreadySaved) {
      // Supprimer le job des favoris
      console.log('📤 Removing job from saved jobs');
      updatedFreelancer = await Freelancer.findByIdAndUpdate(
        freelancerId,
        { $pull: { savedJobs: missionId } },
        { new: true }
      ).populate('savedJobs');
    } else {
      // Ajouter le job aux favoris
      console.log('📥 Adding job to saved jobs');
      updatedFreelancer = await Freelancer.findByIdAndUpdate(
        freelancerId,
        { $addToSet: { savedJobs: missionId } },
        { new: true }
      ).populate('savedJobs');
    }

    if (!updatedFreelancer) {
      throw new Error('Failed to update freelancer saved jobs');
    }

    console.log('✅ Saved jobs updated successfully. Total saved jobs:', updatedFreelancer.savedJobs.length);
    
    return updatedFreelancer;
  } catch (error) {
    console.error('❌ Error in saveJob service:', error);
    throw error;
  }
};

exports.getSavedJobs = async (freelancerId) => {
  try {
    console.log('🔄 Service: Getting saved jobs for freelancer:', freelancerId);
    
    const freelancer = await Freelancer.findById(freelancerId)
      .populate({
        path: 'savedJobs',
        select: 'title description budget currency tags deadline type experience client createdAt',
        populate: {
          path: 'client',
          select: 'name email'
        }
      })
      .select('savedJobs');

    if (!freelancer) {
      throw new Error('Freelancer not found');
    }

    console.log('✅ Saved jobs fetched successfully:', freelancer.savedJobs.length);
    return freelancer.savedJobs || [];
  } catch (error) {
    console.error('❌ Error in getSavedJobs service:', error);
    throw error;
  }
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
          parsedProposal.deliveryTime = parsed.deliveryTime || 0;
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
