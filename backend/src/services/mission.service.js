const Mission = require('../models/mission.model');
const Client = require('../models/client.model');

exports.getAllMissions = async () => {
  return await Mission.find({});
};

exports.getMissionById = async (id) => {
  return await Mission.findById(id);
};

exports.createMission = async (missionData) => {
  const mission = new Mission(missionData);
  const savedMission = await mission.save();

  await Client.findByIdAndUpdate(
    missionData.client,
    { $push: { postedMissions: savedMission._id } },
    { new: true }
  );

  return savedMission;
};

exports.updateMission = async (id, missionData) => {
  return await Mission.findByIdAndUpdate(id, missionData, { new: true });
};

exports.deleteMission = async (id) => {
  return await Mission.findByIdAndDelete(id);
};
