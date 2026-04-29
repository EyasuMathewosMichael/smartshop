'use strict';

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for authentication endpoints.
 * Allows a maximum of 5 requests per minute per IP.
 */
const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter.
 * Allows a maximum of 100 requests per minute per IP.
 */
const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authRateLimiter, apiRateLimiter };
