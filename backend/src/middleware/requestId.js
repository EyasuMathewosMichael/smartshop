'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Middleware that generates a unique request ID for every incoming request.
 *
 * - Attaches the ID to `req.requestId`
 * - Adds it to the response as the `X-Request-Id` header
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requestId(req, res, next) {
  const id = uuidv4();
  req.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
}

module.exports = requestId;
