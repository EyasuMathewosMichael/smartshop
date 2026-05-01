'use strict';

const express = require('express');
const paymentController = require('../modules/payments/paymentController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// All payment routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/payments/stripe/create-session
 * @desc    Create a Stripe Checkout Session for an order
 * @access  Private
 */
router.post('/stripe/create-session', paymentController.createStripeSession);

/**
 * @route   POST /api/payments/chapa/initialize
 * @desc    Initialize a Chapa payment for an order
 * @access  Private
 */
router.post('/chapa/initialize', paymentController.initializeChapaPayment);

/**
 * @route   POST /api/payments/chapa/verify
 * @desc    Verify a Chapa payment by tx_ref after redirect
 * @access  Private
 */
router.post('/chapa/verify', paymentController.verifyChapaPayment);

module.exports = router;
