'use strict';

const Redis = require('ioredis');
const { config } = require('../config/env');
const logger = require('./logger');

// Create Redis client
const client = new Redis(config.redisUrl);

client.on('error', (err) => {
  logger.error('Redis connection error:', { error: err.message });
});

/**
 * Get a value from the cache.
 *
 * @param {string} key - Cache key
 * @returns {Promise<*>} Parsed value or null if not found / Redis unavailable
 */
async function get(key) {
  try {
    const data = await client.get(key);
    if (data === null) return null;
    return JSON.parse(data);
  } catch (err) {
    logger.error('Cache get error:', { key, error: err.message });
    return null;
  }
}

/**
 * Set a value in the cache with a TTL.
 *
 * @param {string} key - Cache key
 * @param {*} value - Value to cache (will be JSON-serialised)
 * @param {number} ttlSeconds - Time-to-live in seconds
 * @returns {Promise<void>}
 */
async function set(key, value, ttlSeconds) {
  try {
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    logger.error('Cache set error:', { key, error: err.message });
  }
}

/**
 * Delete a single key from the cache.
 *
 * @param {string} key - Cache key
 * @returns {Promise<void>}
 */
async function del(key) {
  try {
    await client.del(key);
  } catch (err) {
    logger.error('Cache del error:', { key, error: err.message });
  }
}

/**
 * Delete all keys matching a glob pattern.
 *
 * @param {string} pattern - Glob pattern, e.g. "/api/products"
 * @returns {Promise<void>}
 */
async function delPattern(pattern) {
  try {
    const keys = await client.keys(pattern);
    if (keys && keys.length > 0) {
      await client.del(...keys);
    }
  } catch (err) {
    logger.error('Cache delPattern error:', { pattern, error: err.message });
  }
}

/**
 * Express middleware that caches JSON responses.
 *
 * On a cache hit the cached body is returned immediately.
 * On a miss the request is passed to the next handler and the response
 * body is stored in cache before being sent.
 *
 * @param {number} ttl - Cache TTL in seconds
 * @returns {import('express').RequestHandler}
 */
function cacheMiddleware(ttl) {
  return async (req, res, next) => {
    const key = req.originalUrl;

    try {
      const cached = await get(key);
      if (cached !== null) {
        return res.json(cached);
      }
    } catch (err) {
      logger.error('Cache middleware get error:', { key, error: err.message });
    }

    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      try {
        await set(key, body, ttl);
      } catch (err) {
        logger.error('Cache middleware set error:', { key, error: err.message });
      }
      return originalJson(body);
    };

    next();
  };
}

module.exports = { get, set, del, delPattern, cacheMiddleware };
