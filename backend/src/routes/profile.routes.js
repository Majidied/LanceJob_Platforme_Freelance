const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const profileController = require('../controllers/profile.controller');

router.post('/profile-image/:userId', upload.single('profileImage'), profileController.uploadProfileImage);


router.delete('/profile-image/:userId', profileController.deleteProfileImage);

router.get('/profile-image/:filename', profileController.getProfileImage);

module.exports = router;