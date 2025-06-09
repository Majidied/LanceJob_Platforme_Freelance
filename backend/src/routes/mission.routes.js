const express = require('express');
const missionController = require('../controllers/mission.controller');
const { trackMissionView, createInteractionTracker } = require('../middleware/interaction.middleware');

const router = express.Router();

router.get('/', missionController.getAllMissions);
router.get('/:id', trackMissionView, missionController.getMissionById);
router.post('/', missionController.createMission);
router.put('/:id', missionController.updateMission);
router.delete('/:id', missionController.deleteMission);
router.put('/:missionId/applications/:applicationId', missionController.updateApplicationStatus);


// Mission application routes with interaction tracking
router.post('/:id/apply', createInteractionTracker('apply'), missionController.applyToMission);
router.post('/:id/save', createInteractionTracker('save'), missionController.saveMission);
router.post('/:id/contact', createInteractionTracker('contact'), missionController.contactClient);

module.exports = router;
