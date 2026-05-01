'use strict';

const Order = require('../../models/Order');
const stripeService = require('./stripeService');
const chapaService = require('./chapaService');
const orderService = require('../orders/orderService');
const emailService = require('../email/emailService');
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

/**
 * Verify a Chapa payment by tx_ref after redirect.
 *
 * @route POST /api/payments/chapa/verify
 */
async function verifyChapaPayment(req, res, next) {
  try {
    const { txRef } = req.body;
    if (!txRef) {
      const error = new Error('txRef is required');
      error.statusCode = 400;
      throw error;
    }

    // Extract orderId from tx_ref (format: smartshop-{orderId}-{timestamp})
    const parts = txRef.split('-');
    if (parts.length < 3 || parts[0] !== 'smartshop') {
      const error = new Error('Invalid txRef format');
      error.statusCode = 400;
      throw error;
    }
    const orderId = parts[1];

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

    // Already confirmed — return success immediately
    if (order.paymentStatus === 'completed') {
      return res.status(200).json({ success: true, status: 'completed', orderId });
    }

    // Verify with Chapa API
    const txData = await chapaService.verifyChapaTransaction(txRef);

    if (txData && txData.status === 'success') {
      // Idempotency check
      if (order.paymentDetails && order.paymentDetails.transactionId) {
        return res.status(200).json({ success: true, status: 'completed', orderId });
      }

      order.paymentStatus = 'completed';
      order.paymentDetails = {
        transactionId: txData.reference || txRef,
        paymentGateway: 'chapa',
        paidAt: new Date(),
        amount: parseFloat(txData.amount),
        currency: 'ETB',
      };
      await order.save();

      await orderService.updateOrderStatus(orderId, 'paid', null, 'Payment confirmed via Chapa');

      // Send confirmation email (non-blocking)
      const populatedOrder = await Order.findById(orderId).populate('userId', 'email name');
      if (populatedOrder && populatedOrder.userId) {
        emailService
          .sendOrderConfirmation(populatedOrder.userId.email, {
            orderNumber: populatedOrder.orderNumber,
            items: populatedOrder.items,
            total: populatedOrder.total,
            paymentMethod: populatedOrder.paymentMethod,
          })
          .catch((err) => logger.error('Order confirmation email failed:', err));
      }

      logger.info(`Chapa payment verified and confirmed for order ${orderId}`);
      return res.status(200).json({ success: true, status: 'completed', orderId });
    }

    // Payment not yet successful
    return res.status(200).json({ success: false, status: txData?.status || 'pending', orderId });
  } catch (error) {
    logger.error('Verify Chapa payment error:', error);
    next(error);
  }
}

module.exports = {
  createStripeSession,
  initializeChapaPayment,
  verifyChapaPayment,
};
