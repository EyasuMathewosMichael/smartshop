'use strict';

const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connection pool settings for Mongoose / MongoDB driver.
 */
const POOL_OPTIONS = {
  maxPoolSize: 10,       // Maximum number of connections in the pool
  minPoolSize: 2,        // Minimum number of connections kept open
  serverSelectionTimeoutMS: 5000,  // Timeout for initial server selection
  socketTimeoutMS: 45000,          // Timeout for socket inactivity
  connectTimeoutMS: 10000,         // Timeout for initial connection
  heartbeatFrequencyMS: 10000,     // How often the driver checks server health
};

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

/**
 * Attempt to connect to MongoDB with exponential back-off retry logic.
 *
 * @param {number} attempt - Current attempt number (1-based).
 * @returns {Promise<void>}
 */
async function connectWithRetry(attempt = 1) {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    await mongoose.connect(uri, POOL_OPTIONS);
    logger.info('MongoDB connected successfully', {
      action: 'db_connect',
      attempt,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    });
  } catch (err) {
    logger.error('MongoDB connection failed', {
      action: 'db_connect_error',
      attempt,
      error: err.message,
    });

    if (attempt >= MAX_RETRIES) {
      logger.error('Max MongoDB connection retries reached. Exiting.', {
        action: 'db_connect_fatal',
        maxRetries: MAX_RETRIES,
      });
      throw err;
    }

    const delay = RETRY_DELAY_MS * attempt; // linear back-off
    logger.info(`Retrying MongoDB connection in ${delay}ms…`, {
      action: 'db_connect_retry',
      nextAttempt: attempt + 1,
      delayMs: delay,
    });

    await new Promise((resolve) => setTimeout(resolve, delay));
    return connectWithRetry(attempt + 1);
  }
}

/**
 * Register Mongoose connection event listeners for observability.
 */
function registerConnectionEvents() {
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected', { action: 'db_disconnected' });
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected', { action: 'db_reconnected' });
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', {
      action: 'db_error',
      error: err.message,
    });
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed on app termination', {
      action: 'db_shutdown',
    });
    process.exit(0);
  });
}

/**
 * Initialise the database connection.
 * Call this once at application startup.
 *
 * @returns {Promise<void>}
 */
async function connectDB() {
  registerConnectionEvents();
  await connectWithRetry();
}

module.exports = connectDB;
