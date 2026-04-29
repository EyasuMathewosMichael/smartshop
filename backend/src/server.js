'use strict';

// Load environment variables from .env file before anything else
require('dotenv').config();

const { validateEnv, config } = require('./config/env');
const connectDB = require('./config/db');
const createApp = require('./app');
const logger = require('./utils/logger');
const { startExchangeRateScheduler } = require('./utils/exchangeRateService');
const { startEmailRetryScheduler } = require('./modules/email/emailService');
const { ensureAllIndexes } = require('./scripts/ensureIndexes');

/**
 * Bootstrap and start the SmartShop API server.
 */
async function start() {
  // 1. Validate required environment variables
  validateEnv();

  // 2. Connect to MongoDB
  await connectDB();

  // 3. Ensure all model indexes are created
  await ensureAllIndexes();

  // 4. Start background schedulers
  startExchangeRateScheduler();
  startEmailRetryScheduler();

  // 5. Create the Express application
  const app = createApp();

  // 6. Start listening on all interfaces (0.0.0.0) so phones/devices on the
  //    same network can reach the API via the PC's local IP address.
  const server = app.listen(config.port, '0.0.0.0', () => {
    logger.info('SmartShop API server started', {
      action: 'server_start',
      port: config.port,
      env: config.nodeEnv,
    });
  });

  // ── Graceful shutdown ────────────────────────────────────────────────────
  const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down gracefully`, {
      action: 'server_shutdown',
      signal,
    });

    server.close(() => {
      logger.info('HTTP server closed', { action: 'server_closed' });
      process.exit(0);
    });

    // Force exit after 10 seconds if graceful shutdown stalls
    setTimeout(() => {
      logger.error('Forced shutdown after timeout', {
        action: 'server_force_shutdown',
      });
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // ── Unhandled rejections / exceptions ────────────────────────────────────
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', {
      action: 'unhandled_rejection',
      reason: String(reason),
    });
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception — shutting down', {
      action: 'uncaught_exception',
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});
