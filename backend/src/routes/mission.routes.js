const express = require('express');
const missionController = require('../controllers/mission.controller');

const router = express.Router();

router.get('/', missionController.getAllMissions);
router.get('/:id', missionController.getMissionById);
router.post('/', missionController.createMission);
router.put('/:id', missionController.updateMission);
router.delete('/:id', missionController.deleteMission);
router.put('/:missionId/applications/:applicationId', missionController.updateApplicationStatus);


module.exports = router;
