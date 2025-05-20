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

// New methods for job applications, saved jobs, and offers

exports.applyForMission = async (freelancerId, missionId, proposal) => {
  // Check if mission exists
  const mission = await Mission.findById(missionId);
  if (!mission) {
    throw new Error('Mission not found');
  }
  
  // Check if already applied
  const alreadyApplied = await Freelancer.findOne({
    _id: freelancerId,
    'appliedMissions.mission': missionId
  });
  
  if (alreadyApplied) {
    throw new Error('You have already applied for this mission');
  }
  
  // Add to applied missions
  return await Freelancer.findByIdAndUpdate(
    freelancerId,
    {
      $push: {
        appliedMissions: {
          mission: missionId,
          applicationDate: new Date(),
          status: 'pending',
          proposal
        }
      }
    },
    { new: true }
  ).populate('appliedMissions.mission');
};

exports.getAppliedMissions = async (freelancerId) => {
  const freelancer = await Freelancer.findById(freelancerId)
    .populate('appliedMissions.mission')
    .select('appliedMissions');
    
  return freelancer ? freelancer.appliedMissions : [];
};

exports.saveJob = async (freelancerId, missionId) => {
  // Check if mission exists
  const mission = await Mission.findById(missionId);
  if (!mission) {
    throw new Error('Mission not found');
  }
  
  // Check if already saved
  const alreadySaved = await Freelancer.findOne({
    _id: freelancerId,
    savedJobs: missionId
  });
  
  if (alreadySaved) {
    // If already saved, remove it (toggle functionality)
    return await Freelancer.findByIdAndUpdate(
      freelancerId,
      { $pull: { savedJobs: missionId } },
      { new: true }
    ).populate('savedJobs');
  }
  
  // Add to saved jobs
  return await Freelancer.findByIdAndUpdate(
    freelancerId,
    { $push: { savedJobs: missionId } },
    { new: true }
  ).populate('savedJobs');
};

exports.getSavedJobs = async (freelancerId) => {
  const freelancer = await Freelancer.findById(freelancerId)
    .populate('savedJobs')
    .select('savedJobs');
    
  return freelancer ? freelancer.savedJobs : [];
};

exports.getOffers = async (freelancerId) => {
  const freelancer = await Freelancer.findById(freelancerId)
    .populate('offers.mission offers.client')
    .select('offers');
    
  return freelancer ? freelancer.offers : [];
};

exports.respondToOffer = async (freelancerId, offerId, status) => {
  if (!['accepted', 'rejected'].includes(status)) {
    throw new Error('Invalid status. Must be "accepted" or "rejected"');
  }
  
  return await Freelancer.findOneAndUpdate(
    { 
      _id: freelancerId,
      'offers._id': offerId
    },
    {
      $set: { 'offers.$.status': status }
    },
    { new: true }
  ).populate('offers.mission offers.client');
};const freelancerService = require('../services/freelancer.service');

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
    
    const application = await freelancerService.applyForMission(freelancerId, missionId, proposal);
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
    const offers = await freelancerService.getOffers(id);
    res.status(200).json({ data: offers });
  } catch (error) {
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