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
};

