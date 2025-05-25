const Freelancer = require('../models/freelancer.model');

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
