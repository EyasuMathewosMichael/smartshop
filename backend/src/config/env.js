'use strict';

/**
 * Centralised environment variable validation.
 *
 * In production (NODE_ENV=production) every required variable MUST be present;
 * the process will throw an error and refuse to start if any are missing.
 *
 * In development / test environments missing variables produce a warning so
 * that local development remains frictionless.
 */

/**
 * Variables that are always required regardless of environment.
 */
const REQUIRED_VARS = [
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRE',
  'BCRYPT_ROUNDS',
  'REDIS_URL',
  'FRONTEND_URL',
  'NODE_ENV',
];

/**
 * Variables only required in production (optional in dev/test).
 * The app will warn if these are missing in production.
 */
const PRODUCTION_REQUIRED_VARS = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'CHAPA_SECRET_KEY',
  'CHAPA_WEBHOOK_SECRET',
  'CLOUD_STORAGE_KEY',
  'CLOUD_STORAGE_BUCKET',
  'CLOUDINARY_CLOUD_NAME',
  'EMAIL_SERVICE_API_KEY',
  'EXCHANGE_RATE_API_KEY',
];

/**
 * Validate that all required environment variables are present.
 * Throws in production; warns in other environments.
 *
 * @throws {Error} When running in production and a required variable is missing.
 */
function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`[env] FATAL — ${message}`);
    } else {
      // eslint-disable-next-line no-console
      console.warn(`[env] WARNING — ${message}`);
    }
  }

  // In production, also warn about optional-but-recommended vars
  if (process.env.NODE_ENV === 'production') {
    const missingOptional = PRODUCTION_REQUIRED_VARS.filter((key) => !process.env[key]);
    if (missingOptional.length > 0) {
      // eslint-disable-next-line no-console
      console.warn(`[env] WARNING — These services are not configured and will return 503 errors when used: ${missingOptional.join(', ')}`);
    }
  }
}

/**
 * Parsed and typed configuration object derived from environment variables.
 * Import this throughout the application instead of accessing process.env directly.
 */
const config = {
  // Server
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',

  // Database
  mongodbUri: process.env.MONGODB_URI || '',

  // Authentication
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpire: process.env.JWT_EXPIRE || '24h',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',

  // Chapa
  chapaSecretKey: process.env.CHAPA_SECRET_KEY || '',
  chapaWebhookSecret: process.env.CHAPA_WEBHOOK_SECRET || '',

  // Cloud storage / Cloudinary
  cloudStorageKey: process.env.CLOUD_STORAGE_KEY || '',
  cloudStorageBucket: process.env.CLOUD_STORAGE_BUCKET || '',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',

  // Email
  emailServiceApiKey: process.env.EMAIL_SERVICE_API_KEY || '',

  // Exchange rate
  exchangeRateApiKey: process.env.EXCHANGE_RATE_API_KEY || '',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

module.exports = { validateEnv, config };
