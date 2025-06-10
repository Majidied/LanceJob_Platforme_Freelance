const express = require('express');
const userRoutes = require('./user.routes');
const missionRoutes = require('./mission.routes');
const authRoutes = require('./auth.routes'); // Uncomment if you have auth routes
const freelancerRoutes = require('./freelancer.routes');
const clientRoutes = require('./client.routes');
const uploadRoutes = require('./profile.routes');

const { authenticateJWT, verificationUser} = require('../middleware/auth.middleware');


const router = express.Router();

router.use('/users', authenticateJWT, userRoutes);
router.use('/auth', authRoutes);
router.use('/mission', authenticateJWT, verificationUser, missionRoutes);
router.use('/freelancer', authenticateJWT, verificationUser, freelancerRoutes);
router.use('/client', authenticateJWT, verificationUser, clientRoutes);
router.use('/upload', uploadRoutes);


// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;