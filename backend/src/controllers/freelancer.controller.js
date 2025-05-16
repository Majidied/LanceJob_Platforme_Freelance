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
