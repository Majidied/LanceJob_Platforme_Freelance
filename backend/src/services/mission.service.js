const Mission = require('../models/mission.model');
const Client = require('../models/client.model');
const Freelancer = require('../models/freelancer.model');

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
exports.updateApplicationStatus = async (missionId, applicationId, status,currentApplicationId) => {
  const mission = await Mission.findById(missionId);
  if (!mission) {
    console.log('Mission not found:', missionId);
    return null;
  }

  const application = mission.applications.id(applicationId);
  if (!application) {
    console.log('Application not found:', applicationId);
    return null;
  }

  application.status = status;
  await mission.save();

  const freelancer = await Freelancer.findOneAndUpdate(
      {
        'appliedMissions.mission': missionId,
        'appliedMissions._id': currentApplicationId,
      },
      {
        $set: {
          'appliedMissions.$.status': status
        }
      }
    );

  return mission;
};
