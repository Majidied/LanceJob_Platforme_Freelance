const mongoose = require('mongoose');
const config = require('./index');

/**
 * Asynchronously connects to the MongoDB database using Mongoose.
 * Logs a success message upon successful connection.
 * If the connection fails, logs the error and exits the process.
 *
 * @async
 * @function
 * @throws Will terminate the process if the connection fails.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
