'use strict';

const Order = require('../../models/Order');
const stripeService = require('./stripeService');
const chapaService = require('./chapaService');
const logger = require('../../utils/logger');

/**
 * Create a Stripe Checkout Session for an order.
 *
 * @route POST /api/payments/stripe/create-session
 */
async function createStripeSession(req, res, next) {
  try {
    const { orderId } = req.body;

    // Find order and verify ownership
    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    if (order.userId.toString() !== req.user.userId.toString()) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    const result = await stripeService.createStripeSession(
      orderId,
      order.total,
      order.currency,
      req.user.email
    );

    logger.info(`Stripe session created for order ${orderId}`);
    res.status(200).json({
      success: true,
      sessionId: result.sessionId,
      url: result.url,
    });
  } catch (error) {
    logger.error('Create Stripe session error:', error);
    next(error);
  }
}

/**
 * Initialize a Chapa payment for an order.
 *
 * @route POST /api/payments/chapa/initialize
 */
async function initializeChapaPayment(req, res, next) {
  try {
    const { orderId } = req.body;

    // Find order and verify ownership
    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    if (order.userId.toString() !== req.user.userId.toString()) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    const nameParts = req.user.name ? req.user.name.split(' ') : ['', ''];
    const customerInfo = {
      email: req.user.email,
      firstName: nameParts[0],
      lastName: nameParts[1] || '',
    };

    const result = await chapaService.initializeChapaPayment(
      orderId,
      order.total,
      customerInfo
    );

    logger.info(`Chapa payment initialized for order ${orderId}`);
    res.status(200).json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      txRef: result.txRef,
    });
  } catch (error) {
    logger.error('Initialize Chapa payment error:', error);
    next(error);
  }
}

module.exports = {
  createStripeSession,
  initializeChapaPayment,
};
