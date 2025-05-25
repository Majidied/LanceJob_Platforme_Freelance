const express = require('express');
const userRoutes = require('./user.routes');
const missionRoutes = require('./mission.routes');
const authRoutes = require('./auth.routes'); // Uncomment if you have auth routes
const freelancerRoutes = require('./freelancer.routes');
const clientRoutes = require('./client.routes');


const router = express.Router();

router.use('/users', userRoutes);
router.use('/auth', authRoutes); // Uncomment if you have auth routes
router.use('/mission', missionRoutes);
router.use('/freelancer', freelancerRoutes);
router.use('/client', clientRoutes);
// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;