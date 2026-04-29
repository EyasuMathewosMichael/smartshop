'use strict';

const { config } = require('../../config/env');
const logger = require('../../utils/logger');

/**
 * Lazily initialise the Stripe client so the app can start without a key.
 * The client is only created when a payment is actually attempted.
 */
function getStripeClient() {
  if (!config.stripeSecretKey) {
    const err = new Error('Stripe is not configured. Set STRIPE_SECRET_KEY to enable card payments.');
    err.statusCode = 503;
    throw err;
  }
  // Require inline so the SDK is not loaded at all when the key is absent
  return require('stripe')(config.stripeSecretKey);
}

/**
 * Create a Stripe Checkout Session for an order.
 *
 * @param {string} orderId - Order ID
 * @param {number} amount - Amount to charge
 * @param {string} currency - Currency code
 * @param {string} customerEmail - Customer email address
 * @returns {Promise<{sessionId: string, url: string}>}
 */
async function createStripeSession(orderId, amount, currency, customerEmail) {
  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Order ${orderId}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${config.frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${config.frontendUrl}/checkout?cancelled=true`,
      metadata: {
        orderId: orderId.toString(),
      },
      customer_email: customerEmail,
    });

    logger.info(`Stripe session created for order ${orderId}: ${session.id}`);
    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    logger.error('Error creating Stripe session:', error);
    throw error;
  }
}

/**
 * Verify a Stripe webhook signature and return the event.
 *
 * @param {Buffer} rawBody - Raw request body
 * @param {string} signature - Stripe-Signature header value
 * @returns {object} Stripe event
 */
function verifyStripeWebhook(rawBody, signature) {
  try {
    const stripe = getStripeClient();
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.stripeWebhookSecret
    );
    return event;
  } catch (error) {
    logger.error('Stripe webhook verification failed:', error);
    throw error;
  }
}

module.exports = {
  createStripeSession,
  verifyStripeWebhook,
};
