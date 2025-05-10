const jwt = require('jsonwebtoken');
const { redisClient } = require('../config/redis');
const dotenv = require('dotenv');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

/**
 * Generates an access token for a given user ID.
 * 
 * @param userId - The ID of the user.
 * @returns The generated access token.
 */
const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: '15m' });
};

/**
 * Verifies the validity of a token.
 * 
 * @param token - The token to be verified.
 * @returns A promise that resolves to the decoded token if it is valid, otherwise null.
 */
const verifyAccessToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.jwtSecret, (err, decoded) => {
            if (err) return reject(err);
            resolve(decoded);
        });
    });
};


/**
 * Generates a refresh token for a given user ID and stores it in Redis.
 * 
 * @param userId - The ID of the user.
 * @returns The generated refresh token.
 */
const generateRefreshToken = async (userId) => {
    const jti = uuidv4();
    const refreshToken = jwt.sign({ id: userId, jti }, config.jwtSecret, { expiresIn: '30d' });
    // Use set with EX option for node-redis v4+
    await redisClient.set(`refresh:${jti}`, 'EX', userId, { EX: 30 * 24 * 60 * 60 });
    return refreshToken;
};

/**
 * Verifies a refresh token and checks if it matches the one stored in Redis.
 * 
 * @param token - The refresh token to be verified.
 * @returns The decoded token if valid, otherwise null.
 */
const verifyRefreshToken = async (token) => {
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        const storedUserId = await redisClient.get(`refresh:${decoded.jti}`);
        if (storedUserId !== decoded.id) return null;
        return decoded;
    } catch (err) {
        return null;
    }
};

/**
 * Removes a token from the Redis cache and executes a callback function.
 *
 * @param {string} token - The token to be removed from the Redis cache.
 * @returns {void}
 */
const removeToken = async (token) => {
    await redisClient.del(token);
};

/**
 * Retrieves the user ID associated with a given token.
 *
 * @param {string} token - The token to retrieve the user ID from.
 * @returns {Promise<string|null>} - A promise that resolves to the user ID if the token is valid, or null if the token is not found.
 */
const getUserIdByToken = (token) => {
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        return decoded.id;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

/**
 * Removes all tokens associated with a specific user and type from the Redis cache.
 * 
 * @param userId - The ID of the user.
 * @param type - The type of the token.
 * @returns A Promise that resolves to void.
 * @throws If there is an error removing the tokens.
 */
const removeAllTokens = async (userId, type) => {
    try {
        const keys = await redisClient.keys(`${type}:${userId}*`);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    } catch (error) {
        console.error('Error removing tokens:', error);
        throw error;
    }
}


/**
 * Generates a verification token for a given user ID.
 *
 * @param userId - The ID of the user.
 * @returns A promise that resolves to the generated verification token.
 */
const generateVerificationCode = async (userId) => {
    // Generate a 6-digit numeric code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Use set with EX option for node-redis v4+
    await redisClient.set(`verify:${userId}`, 'EX', code, { EX: 3600 });

    return code;
};


module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    removeToken,
    removeAllTokens,
    getUserIdByToken,
    generateVerificationCode,
    verifyAccessToken,
};
