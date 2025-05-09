const missionService = require('../services/mission.service');


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