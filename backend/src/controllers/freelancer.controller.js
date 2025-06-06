const freelancerService = require('../services/freelancer.service');

exports.getAllFreelancers = async (req, res, next) => {
  try {
    const freelancers = await freelancerService.getAllFreelancers();
    res.status(200).json({ data: freelancers });
  } catch (error) {
    next(error);
  }
};

exports.getFreelancerById = async (req, res, next) => {
  try {
    const freelancer = await freelancerService.getFreelancerById(req.params.id);
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }
    res.status(200).json({ data: freelancer });
  } catch (error) {
    next(error);
  }
};

exports.createFreelancer = async (req, res, next) => {
  try {
    const freelancer = await freelancerService.createFreelancer(req.body);
    res.status(201).json({ data: freelancer });
  } catch (error) {
    next(error);
  }
};

exports.updateFreelancer = async (req, res, next) => {
  try {
    const freelancer = await freelancerService.updateFreelancer(req.params.id, req.body);
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }
    res.status(200).json({ data: freelancer });
  } catch (error) {
    next(error);
  }
};

exports.deleteFreelancer = async (req, res, next) => {
  try {
    const freelancer = await freelancerService.deleteFreelancer(req.params.id);
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }
    res.status(200).json({ message: 'Freelancer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// New controller methods for job applications, saved jobs, and offers

exports.applyForMission = async (req, res, next) => {
  try {
    const { freelancerId, missionId, proposal } = req.body;
    
    if (!freelancerId || !missionId) {
      return res.status(400).json({ message: 'Freelancer ID and Mission ID are required' });
    }

    // Validation de la proposition
    if (!proposal || !proposal.coverLetter || !proposal.proposedPrice || !proposal.deliveryTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Proposition incomplète. coverLetter, proposedPrice et deliveryTime sont requis' 
      });
    }

    // Formater la proposition pour le stockage
    const formattedProposal = JSON.stringify({
      coverLetter: proposal.coverLetter,
      proposedPrice: proposal.proposedPrice,
      currency: proposal.currency || 'MAD',
      deliveryTime: proposal.deliveryTime,
      attachments: proposal.attachments || []
    });
    
    const application = await freelancerService.applyForMission(freelancerId, missionId, formattedProposal);
    res.status(201).json({ 
      success: true,
      message: 'Application submitted successfully', 
      data: application 
    });
  } catch (error) {
    if (error.message === 'Mission not found' || error.message === 'You have already applied for this mission') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

exports.getAppliedMissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const applications = await freelancerService.getAppliedMissions(id);
    res.status(200).json({ data: applications });
  } catch (error) {
    next(error);
  }
};

exports.saveJob = async (req, res, next) => {
  try {
    const { freelancerId, missionId } = req.body;
    
    if (!freelancerId || !missionId) {
      return res.status(400).json({ message: 'Freelancer ID and Mission ID are required' });
    }
    
    const updatedFreelancer = await freelancerService.saveJob(freelancerId, missionId);
    
    // Check if the job was added or removed from saved jobs
    const isSaved = updatedFreelancer.savedJobs.some(job => job._id.toString() === missionId);
    
    res.status(200).json({ 
      success: true,
      message: isSaved ? 'Job saved successfully' : 'Job removed from saved jobs',
      data: updatedFreelancer.savedJobs
    });
  } catch (error) {
    if (error.message === 'Mission not found') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

exports.getSavedJobs = async (req, res, next) => {
  try {
    const { id } = req.params;
    const savedJobs = await freelancerService.getSavedJobs(id);
    res.status(200).json({ data: savedJobs });
  } catch (error) {
    next(error);
  }
};

exports.getOffers = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('🔍 Controller: Getting offers for freelancer ID:', id);
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Freelancer ID is required' 
      });
    }
    
    const offers = await freelancerService.getOffers(id);
    console.log('💼 Controller: Found offers:', offers ? offers.length : 0);
    
    res.status(200).json({ 
      success: true,
      data: offers || [] 
    });
  } catch (error) {
    console.error('❌ Controller: Error in getOffers:', error.message);
    if (error.message === 'Freelancer not found') {
      return res.status(404).json({ 
        success: false, 
        message: 'Freelancer not found' 
      });
    }
    next(error);
  }
};

exports.respondToOffer = async (req, res, next) => {
  try {
    const { freelancerId, offerId, status } = req.body;
    
    if (!freelancerId || !offerId || !status) {
      return res.status(400).json({ message: 'Freelancer ID, Offer ID and status are required' });
    }
    
    const updatedFreelancer = await freelancerService.respondToOffer(freelancerId, offerId, status);
    res.status(200).json({ 
      success: true,
      message: `Offer ${status} successfully`, 
      data: updatedFreelancer.offers 
    });
  } catch (error) {
    if (error.message.includes('Invalid status')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};