'use strict';

const express = require('express');
const webhookController = require('../modules/payments/webhookController');

const router = express.Router();

/**
 * @route   POST /api/webhooks/stripe
 * @desc    Handle Stripe webhook events
 * @access  Public (verified via signature)
 * @note    Uses express.raw() to preserve raw body for Stripe signature verification
 */
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  webhookController.handleStripeWebhook
);

/**
 * @route   POST /api/webhooks/chapa
 * @desc    Handle Chapa webhook events
 * @access  Public (verified via HMAC signature)
 */
router.post('/chapa', webhookController.handleChapaWebhook);

module.exports = router;
