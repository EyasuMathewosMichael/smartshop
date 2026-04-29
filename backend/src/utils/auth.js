'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { config } = require('../config/env');

/**
 * Hash a password using bcrypt with configured salt rounds.
 *
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(config.bcryptRounds);
  return await bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a bcrypt hash.
 *
 * @param {string} password - Plain text password
 * @param {string} hash - Bcrypt hash to compare against
 * @returns {Promise<boolean>} True if password matches hash, false otherwise
 */
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user.
 *
 * @param {string} userId - User's database ID
 * @param {string} email - User's email address
 * @param {string} role - User's role (customer/admin)
 * @returns {string} Signed JWT token
 */
function generateToken(userId, email, role) {
  const payload = {
    userId,
    email,
    role,
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpire,
    algorithm: 'HS256',
  });
}

/**
 * Validate and decode a JWT token.
 *
 * @param {string} token - JWT token to validate
 * @returns {Object} Decoded token payload containing {userId, email, role}
 * @throws {Error} If token is invalid or expired
 */
function validateToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

/**
 * Validate email format using regex.
 *
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email matches format local@domain.tld, false otherwise
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  validateToken,
  validateEmail,
};
