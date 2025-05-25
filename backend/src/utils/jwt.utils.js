const jwt = require('jsonwebtoken');
const config = require('../config');
const { redisClient } = require('../config/redis');


/**
 * Generates a token for a given user ID and saves it in Redis.
 * 
 * @param userId - The ID of the user.
 * @returns The generated token.
 */
const generateToken = async (userId) => {
    const token = jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: '30d' });
    console.log('Generated token:', token);
    await redisClient.set(token, userId, { EX: 60 * 60 * 24 * 30 }); // 30 days expiry
    return token;
};

/**
 * Verifies the validity of a token and checks if it exists in Redis.
 * 
 * @param token - The token to be verified.
 * @returns A promise that resolves to the decoded token if it is valid and exists in Redis, otherwise null.
 */
const verifyToken = async (token) => {
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        const userId = await redisClient.get(token);
        if (!userId) throw new Error('Token not found in Redis');
        return decoded;
    } catch (err) {
        throw err;
    }
};

/**
 * Retrieves the user ID associated with a given token from Redis.
 *
 * @param {string} token - The token to retrieve the user ID from.
 * @returns {string|null} - The user ID if the token is valid and exists in Redis, or null if invalid.
 */
const getUserIdByToken = async (token) => {
    try {
        jwt.verify(token, config.jwtSecret);
        const userId = await redisClient.get(token);
        return userId || null;
    } catch (error) {
        return null;
    }
};

const generateVerificationCode = (userID) => {
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    redisClient.set(userID, verificationCode, { EX: 60 * 60 }); // 1 hour expiry
    return verificationCode;
}

/**
 * Verifies the verification code for a given user ID.
 *
 * @param {string} userID - The user ID to verify the code for.
 * @param {string} verificationCode - The verification code to verify.
 * @returns {boolean} - True if the verification code is valid, false otherwise.
 */
const verifyVerificationCode = async (userID, verificationCode) => {
    const storedCode = await redisClient.get(userID);
    if (storedCode === verificationCode) {
        await redisClient.del(userID); // Delete the code after successful verification
        return true;
    }
    return false;
}

module.exports = {
    generateToken,
    verifyToken,
    getUserIdByToken,
    generateVerificationCode,
    verifyVerificationCode
};
