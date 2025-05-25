const Mission = require('../models/mission.model');


exports.getAllMissions = async () => {
  return await Mission.find({});
};

exports.getMissionById = async (id) => {
  return await Mission.findById(id);
};

exports.createMission = async (missionData) => {
  const mission = new Mission(missionData);
  return await mission.save();
};

exports.updateMission = async (id, missionData) => {
  return await Mission.findByIdAndUpdate(id, missionData, { new: true });
};

exports.deleteMission = async (id) => {
  return await Mission.findByIdAndDelete(id);
};
