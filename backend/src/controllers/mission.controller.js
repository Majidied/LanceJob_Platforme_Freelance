const missionService = require('../services/mission.service');
const Freelancer = require('../models/freelancer.model');
const Mission = require('../models/mission.model');


exports.getAllMissions = async (req, res, next) => {
  try {
    const missions = await missionService.getAllMissions();
    res.status(200).json({ data: missions });
  } catch (error) {
    next(error);
  }
};

exports.getMissionById = async (req, res, next) => {
  try {
    const mission = await missionService.getMissionById(req.params.id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }
    res.status(200).json({ data: mission });
  } catch (error) {
    next(error);
  }
};

exports.createMission = async (req, res, next) => {
  try {
    const mission = await missionService.createMission(req.body);
    res.status(201).json({ data: mission });
  } catch (error) {
    next(error);
  }
};

exports.updateMission = async (req, res, next) => {
  try {
    const mission = await missionService.updateMission(req.params.id, req.body);
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }
    res.status(200).json({ data: mission });
  } catch (error) {
    next(error);
  }
};

exports.deleteMission = async (req, res, next) => {
  try {
    const mission = await missionService.deleteMission(req.params.id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }
    res.status(200).json({ message: 'Mission deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Apply to a mission
exports.applyToMission = async (req, res, next) => {
  try {
    const { id: missionId } = req.params;
    const { message, proposedPrice, proposedDuration } = req.body;
    const freelancerId = req.user?.id; // Assuming authentication middleware sets req.user

    if (!freelancerId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if mission exists
    const mission = await Mission.findById(missionId);
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    // Check if already applied
    const alreadyApplied = mission.applications.some(
      app => app.freelancer.toString() === freelancerId
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied to this mission' });
    }

    // Add application to mission
    mission.applications.push({
      freelancer: freelancerId,
      message: message || '',
      proposedPrice,
      proposedDuration,
      status: 'pending'
    });
    await mission.save();

    // Add to freelancer's applied missions
    await Freelancer.findByIdAndUpdate(freelancerId, {
      $push: {
        appliedMissions: {
          mission: missionId,
          status: 'pending'
        }
      }
    });

    res.status(200).json({ 
      message: 'Application submitted successfully',
      data: { missionId, status: 'pending' }
    });
  } catch (error) {
    next(error);
  }
};

// Save a mission to freelancer's saved list
exports.saveMission = async (req, res, next) => {
  try {
    const { id: missionId } = req.params;
    const freelancerId = req.user?.id;

    if (!freelancerId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if mission exists
    const mission = await Mission.findById(missionId);
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    // Find freelancer and add to saved missions if not already saved
    const freelancer = await Freelancer.findById(freelancerId);
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    // Initialize savedMissions array if it doesn't exist
    if (!freelancer.savedMissions) {
      freelancer.savedMissions = [];
    }

    // Check if already saved
    const alreadySaved = freelancer.savedMissions.some(
      savedId => savedId.toString() === missionId
    );

    if (alreadySaved) {
      return res.status(400).json({ message: 'Mission already saved' });
    }

    // Add to saved missions
    freelancer.savedMissions.push(missionId);
    await freelancer.save();

    res.status(200).json({ 
      message: 'Mission saved successfully',
      data: { missionId, saved: true }
    });
  } catch (error) {
    next(error);
  }
};

// Contact client about a mission
exports.contactClient = async (req, res, next) => {
  try {
    const { id: missionId } = req.params;
    const { message } = req.body;
    const freelancerId = req.user?.id;

    if (!freelancerId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Check if mission exists and populate client info
    const mission = await Mission.findById(missionId).populate('client', 'name email');
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    // Get freelancer info
    const freelancer = await Freelancer.findById(freelancerId).select('name email');
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    // Here you would typically integrate with your messaging service
    // For now, we'll just return a success response
    // In a real application, you might:
    // 1. Create a conversation in your messaging system
    // 2. Send an email notification to the client
    // 3. Store the initial message

    res.status(200).json({ 
      message: 'Contact request sent successfully',
      data: { 
        missionId,
        clientName: mission.client.name,
        freelancerName: freelancer.name,
        contactInitiated: true
      }
    });
  } catch (error) {
    next(error);
  }
};