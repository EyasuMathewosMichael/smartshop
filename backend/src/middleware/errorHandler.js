'use strict';

const logger = require('../utils/logger');

/**
 * Global Express error-handling middleware.
 *
 * Normalises Mongoose errors, sets appropriate HTTP status codes, and returns
 * a consistent JSON error envelope.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An internal server error occurred';
  let code = err.code || 'ERROR';

  // ── Mongoose ValidationError ─────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    code = 'VALIDATION_ERROR';
  }

  // ── Mongoose CastError (invalid ObjectId) ────────────────────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID';
    code = 'INVALID_ID';
  }

  // ── MongoDB duplicate key error ──────────────────────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for ${field}`;
    code = 'DUPLICATE_KEY';
  }

  // ── Log the error ────────────────────────────────────────────────────────
  const logMeta = {
    action: 'error_handler',
    statusCode,
    requestId: req.requestId || 'unknown',
    userId: req.user ? req.user._id || req.user.id : undefined,
    method: req.method,
    url: req.originalUrl,
  };

  if (statusCode >= 500) {
    logger.error(err.message || 'Internal server error', {
      ...logMeta,
      stack: err.stack,
      error: err,
    });
    // Return generic message for 5xx to avoid leaking internals
    message = 'An internal server error occurred';
  } else {
    logger.warn(message, logMeta);
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: err.details || {},
      timestamp: new Date().toISOString(),
      requestId: req.requestId || 'unknown',
    },
  });
}

module.exports = errorHandler;
