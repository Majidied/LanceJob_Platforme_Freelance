const { createClient } = require('redis');
const config = require('./index');

const redisClient = createClient({
    url: config.redisUrl,
    legacyMode: true,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

/**
 * Asynchronously connects to the Redis server if the client is not already open.
 * Logs a message to the console upon successful connection.
 * 
 * @async
 * @function connectRedis
 * @returns {Promise<void>} Resolves when the connection is established or already open.
 */
const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Redis connected');
  }
};

module.exports = { redisClient, connectRedis };
