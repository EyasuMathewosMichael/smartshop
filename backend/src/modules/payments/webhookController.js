'use strict';

const Order = require('../../models/Order');
const stripeService = require('./stripeService');
const chapaService = require('./chapaService');
const orderService = require('../orders/orderService');
const emailService = require('../email/emailService');
const logger = require('../../utils/logger');

/**
 * Handle Stripe webhook events.
 *
 * @route POST /api/webhooks/stripe
 */
async function handleStripeWebhook(req, res, next) {
  try {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      const error = new Error('Missing Stripe signature');
      error.statusCode = 400;
      throw error;
    }

    // Verify webhook
    const event = stripeService.verifyStripeWebhook(req.body, signature);

    logger.info(`Stripe webhook received: ${event.type}`);

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata.orderId;

      if (!orderId) {
        logger.warn('Stripe webhook: No orderId in metadata');
        return res.status(200).json({ received: true });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        logger.warn(`Stripe webhook: Order ${orderId} not found`);
        return res.status(200).json({ received: true });
      }

      // Check idempotency
      if (order.paymentDetails && order.paymentDetails.transactionId) {
        logger.info(`Stripe webhook: Order ${orderId} already processed`);
        return res.status(200).json({ received: true });
      }

      // Update order payment details
      order.paymentStatus = 'completed';
      order.paymentDetails = {
        transactionId: session.payment_intent,
        paymentGateway: 'stripe',
        paidAt: new Date(),
        amount: session.amount_total / 100,
        currency: 'USD',
      };
      await order.save();

      // Update order status to paid
      await orderService.updateOrderStatus(
        orderId,
        'paid',
        null,
        'Payment confirmed via Stripe'
      );

      // Send order confirmation email (non-blocking)
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

      logger.info(`Stripe payment completed for order ${orderId}`);
    }

    // Handle payment_intent.payment_failed
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      // Try to find order by payment intent ID
      const order = await Order.findOne({
        'paymentDetails.transactionId': paymentIntent.id,
      });

      if (order) {
        order.paymentStatus = 'failed';
        await order.save();
        logger.info(`Stripe payment failed for order ${order._id}`);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Stripe webhook error:', error);
    next(error);
  }
}

/**
 * Handle Chapa webhook events.
 *
 * @route POST /api/webhooks/chapa
 */
async function handleChapaWebhook(req, res, next) {
  try {
    const signature = req.headers['x-chapa-signature'];
    if (!signature) {
      const error = new Error('Missing Chapa signature');
      error.statusCode = 400;
      throw error;
    }

    // Verify webhook
    const payload = chapaService.verifyChapaWebhook(req.body, signature);

    logger.info(`Chapa webhook received: ${payload.event || 'payment'}`);

    // Extract orderId from tx_ref (format: smartshop-{orderId}-{timestamp})
    const txRef = payload.tx_ref || payload.trx_ref;
    if (!txRef) {
      logger.warn('Chapa webhook: No tx_ref in payload');
      return res.status(200).json({ received: true });
    }

    const parts = txRef.split('-');
    if (parts.length < 3 || parts[0] !== 'smartshop') {
      logger.warn(`Chapa webhook: Invalid tx_ref format: ${txRef}`);
      return res.status(200).json({ received: true });
    }

    const orderId = parts[1];

    const order = await Order.findById(orderId);
    if (!order) {
      logger.warn(`Chapa webhook: Order ${orderId} not found`);
      return res.status(200).json({ received: true });
    }

    // Check idempotency
    if (order.paymentDetails && order.paymentDetails.transactionId) {
      logger.info(`Chapa webhook: Order ${orderId} already processed`);
      return res.status(200).json({ received: true });
    }

    // Check payment status
    if (payload.status === 'success') {
      // Update order payment details
      order.paymentStatus = 'completed';
      order.paymentDetails = {
        transactionId: payload.reference || txRef,
        paymentGateway: 'chapa',
        paidAt: new Date(),
        amount: parseFloat(payload.amount),
        currency: 'ETB',
      };
      await order.save();

      // Update order status to paid
      await orderService.updateOrderStatus(
        orderId,
        'paid',
        null,
        'Payment confirmed via Chapa'
      );

      // Send order confirmation email (non-blocking)
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

      logger.info(`Chapa payment completed for order ${orderId}`);
    } else if (payload.status === 'failed') {
      order.paymentStatus = 'failed';
      await order.save();
      logger.info(`Chapa payment failed for order ${orderId}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Chapa webhook error:', error);
    next(error);
  }
}

module.exports = {
  handleStripeWebhook,
  handleChapaWebhook,
};
