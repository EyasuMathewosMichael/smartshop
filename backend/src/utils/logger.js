'use strict';

const { createLogger, format, transports } = require('winston');

const { combine, timestamp, json, colorize, simple, errors } = format;

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

/**
 * Structured Winston logger.
 *
 * - Development: colourised, human-readable output to console.
 * - Production:  JSON-formatted output to console + rotating file.
 * - Test:        Silent (suppresses noise during test runs).
 */
const logger = createLogger({
  level: isProduction ? 'info' : 'debug',
  silent: isTest,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    json()
  ),
  defaultMeta: { service: 'smartshop-backend' },
  transports: isProduction
    ? [
        new transports.Console(),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' }),
      ]
    : [
        new transports.Console({
          format: combine(colorize(), simple()),
        }),
      ],
});

module.exports = logger;
