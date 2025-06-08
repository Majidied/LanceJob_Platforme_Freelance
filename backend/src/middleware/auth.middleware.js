const jwt = require('jsonwebtoken');
const config = require('../config');
const userService = require('../services/user.service');

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, config.jwtSecret, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid token' });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ message: 'No token provided'});
    }
};

const verificationUser = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const user = await userService.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.status !== 'ACTIVE') {
            return res.status(403).json({ message: 'User not verified' });
        }
        // User is verified
        next();
    } catch (error) {
        console.error('Error in verificationUser middleware:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    authenticateJWT,
    verificationUser
};