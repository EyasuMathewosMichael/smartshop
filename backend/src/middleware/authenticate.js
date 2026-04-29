'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateToken } = require('../utils/auth');

/**
 * Authentication middleware.
 * Extracts JWT from Authorization header (Bearer) or cookie,
 * validates it, fetches the user from DB, and attaches user info to req.user.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function authenticate(req, res, next) {
  try {
    // Extract token from Authorization header or cookie
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    // Validate and decode the token
    let decoded;
    try {
      decoded = validateToken(token);
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ success: false, message: 'Token expired' });
      }
      // JsonWebTokenError or any other JWT error
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    // Fetch user from DB to get current isActive status
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is inactive' });
    }

    // Attach user info to request
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (error) {
    // Unexpected errors (e.g. DB failure) — pass to error handler
    next(error);
  }
}

module.exports = authenticate;
