'use strict';

const Cart = require('../models/Cart');
const EmailLog = require('../models/EmailLog');
const ExchangeRate = require('../models/ExchangeRate');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');
const User = require('../models/User');
const Wishlist = require('../models/Wishlist');
const logger = require('../utils/logger');

/**
 * Ensure all Mongoose model indexes are created in MongoDB.
 * Safe to call on every startup — Mongoose skips indexes that already exist.
 *
 * @returns {Promise<void>}
 */
async function ensureAllIndexes() {
  const models = [
    { name: 'Cart', model: Cart },
    { name: 'EmailLog', model: EmailLog },
    { name: 'ExchangeRate', model: ExchangeRate },
    { name: 'Order', model: Order },
    { name: 'Product', model: Product },
    { name: 'Review', model: Review },
    { name: 'User', model: User },
    { name: 'Wishlist', model: Wishlist },
  ];

  for (const { name, model } of models) {
    try {
      await model.ensureIndexes();
      logger.info(`Indexes ensured for model: ${name}`);
    } catch (err) {
      logger.error(`Failed to ensure indexes for model: ${name}`, {
        error: err.message,
      });
    }
  }

  logger.info('All model indexes have been ensured');
}

module.exports = { ensureAllIndexes };
