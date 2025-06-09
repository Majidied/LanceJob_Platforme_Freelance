const userService = require('../services/user.service');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ data: users });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
exports.applyToMission = async (req, res, next) => {
  try {
    console.log('=== DEBUG APPLY TO MISSION ===');
    console.log('Mission ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('User from req:', req.user); // Si vous utilisez l'authentification
    
    const { id } = req.params;
    const applicationData = req.body;
    
    // Validation basique
    if (!applicationData.freelancer) {
      console.log('ERROR: Missing freelancer ID');
      return res.status(400).json({ message: 'Freelancer ID is required' });
    }
    
    if (!applicationData.message || applicationData.message.trim().length === 0) {
      console.log('ERROR: Missing message');
      return res.status(400).json({ message: 'Message is required' });
    }
    
    if (!applicationData.proposedPrice || applicationData.proposedPrice <= 0) {
      console.log('ERROR: Invalid proposed price');
      return res.status(400).json({ message: 'Valid proposed price is required' });
    }
    
    console.log('Calling mission service...');
    const updatedMission = await missionService.applyToMission(id, applicationData);
    
    if (!updatedMission) {
      console.log('ERROR: Mission not found');
      return res.status(404).json({ message: 'Mission not found' });
    }
    
    console.log('Application submitted successfully');
    res.status(201).json({ 
      message: 'Application submitted successfully',
      data: updatedMission 
    });
  } catch (error) {
    console.log('ERROR in applyToMission controller:', error);
    console.log('Error stack:', error.stack);
    
    if (error.message === 'ALREADY_APPLIED') {
      return res.status(400).json({ message: 'You have already applied to this mission' });
    }
    
    if (error.message === 'Mission not found') {
      return res.status(404).json({ message: 'Mission not found' });
    }
    
    // Erreur générique
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};
