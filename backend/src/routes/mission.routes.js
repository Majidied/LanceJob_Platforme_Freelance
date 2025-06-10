const express = require('express');
const missionController = require('../controllers/mission.controller');
const { authenticateJWT, verificationUser} = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/search', missionController.searchMission);
router.get('/', authenticateJWT, verificationUser, missionController.getAllMissions);
router.get('/:id',  authenticateJWT, verificationUser,missionController.getMissionById);
router.post('/',  authenticateJWT, verificationUser,missionController.createMission);
router.put('/:id',  authenticateJWT, verificationUser,missionController.updateMission);
router.delete('/:id', authenticateJWT, verificationUser, missionController.deleteMission);
router.put('/:missionId/applications/:applicationId', authenticateJWT, verificationUser, missionController.updateApplicationStatus);



module.exports = router;
