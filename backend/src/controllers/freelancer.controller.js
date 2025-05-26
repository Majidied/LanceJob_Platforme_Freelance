const freelancerService = require('../services/freelancer.service');

exports.getAllFreelancers = async (req, res, next) => {
  try {
    const freelancers = await freelancerService.getAllFreelancers();
    res.status(200).json(freelancers);
  } catch (error) {
    next(error);
  }
}
exports.getFreelancerById = async (req, res, next) => {
  try {
    const freelancer = await freelancerService.getFreelancerById(req.params.id);
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }
    res.status(200).json(freelancer);
  } catch (error) {
    next(error);
  }
}
exports.createFreelancer = async (req, res, next) => {
  try {
    const newFreelancer = await freelancerService.createFreelancer(req.body);
    res.status(201).json(newFreelancer);
  } catch (error) {
    next(error);
  }
}
exports.updateFreelancer = async (req, res, next) => {
    try {
        const updatedFreelancer = await freelancerService.updateFreelancer(req.params.id, req.body);
        if (!updatedFreelancer) {
            return res.status(404).json({ message: 'Freelancer not found' });
        }
        res.status(200).json(updatedFreelancer);
    } catch (error) {
        next(error);
    }
}

exports.deleteFreelancer = async (req, res, next) => {
    try {
        const deleted = await freelancerService.deleteFreelancer(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Freelancer not found' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}
exports.searchFreelancers = async (req, res, next) => {
  try {
    const searchText = req.query.q || '';
    if (!searchText) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    console.log('Search Query:', searchText); // Debugging log
    const freelancers = await freelancerService.searchFreelancers(searchText);
    console.log('Search Results:', freelancers); // Debugging log

    res.status(200).json({ data: freelancers });
  } catch (error) {
    console.error('Search Freelancer Error:', error); // Debugging log
    next(error);
  }
};


