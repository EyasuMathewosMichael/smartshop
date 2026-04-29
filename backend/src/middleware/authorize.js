'use strict';

/**
 * Authorization middleware — restricts access to admin users only.
 * Assumes authenticate middleware has already run and set req.user.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authorizeAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Admin access required' });
}

/**
 * Authorization middleware — restricts access to customer users only.
 * Assumes authenticate middleware has already run and set req.user.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authorizeCustomer(req, res, next) {
  if (req.user && req.user.role === 'customer') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Customer access required' });
}

module.exports = { authorizeAdmin, authorizeCustomer };
