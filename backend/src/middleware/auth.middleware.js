const jwt = require('jsonwebtoken');
const config = require('../config');

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

const verificationUser = (req, res, next) => {
    if (req.user && req.user.status === 'VERIFIED') {
        next();
    } else {
        res.status(403).json({ message: 'User not verified' });
    }
};

module.exports = {
    authenticateJWT,
    verificationUser
};